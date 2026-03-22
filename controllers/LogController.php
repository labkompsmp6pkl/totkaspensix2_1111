<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';

/**
 * LogController - Pusat Audit & Monitoring Real-time
 * Mengelola log akses, kejadian sesi, reset pengerjaan, dan monitoring DNA siswa.
 * Versi: 8.5.0 (Full restoration)
 */
class LogController {
    
    /**
     * Mengambil log akses user (Login/Sync) terbaru.
     */
    public static function getAll() {
        try {
            $db = Database::getConnection();
            $sql = "SELECT al.*, u.name, u.kelas, g.group_name 
                    FROM access_logs al 
                    JOIN users u ON al.user_id = u.id 
                    LEFT JOIN question_groups g ON al.group_id = g.id 
                    ORDER BY al.id DESC LIMIT 300";
            $res = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            return Response::json($res);
        } catch (Exception $e) {
            return Response::json([]);
        }
    }

    /**
     * Mencatat aktivitas spesifik user ke database.
     */
    public static function logActivity($input) {
        try {
            $db = Database::getConnection();
            $uid = $input['user_id'] ?? null;
            $gid = $input['group_id'] ?? null;
            $details = $input['details'] ?? 'Aktivitas';
            $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
            $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

            if (!$uid) return Response::json(["success" => false], 400);

            $stmt = $db->prepare("INSERT INTO access_logs (user_id, group_id, ip_address, user_agent, details) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$uid, $gid, $ip, $ua, $details]);
            
            return Response::json(["success" => true]);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * Mengambil riwayat reset pengerjaan (Recycle) untuk audit guru.
     */
    public static function getResetLogs() {
        try {
            $db = Database::getConnection();
            $sql = "SELECT rl.*, u.name as target_name, a.name as actor_name, g.group_name 
                    FROM reset_logs rl 
                    JOIN users u ON rl.target_user_id = u.id 
                    JOIN users a ON rl.created_by = a.id 
                    LEFT JOIN question_groups g ON rl.group_id = g.id 
                    ORDER BY rl.id DESC";
            $res = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            return Response::json($res);
        } catch (Exception $e) {
            return Response::json([]);
        }
    }

    /**
     * Mengambil riwayat kejadian sesi (Buka/Tutup/Otomatis).
     */
    public static function getSessionEvents($params) {
        try {
            $gid = $params['group_id'] ?? null;
            $db = Database::getConnection();
            
            $sql = "SELECT se.*, u.name as actor_name, g.group_name 
                    FROM session_events se 
                    LEFT JOIN users u ON se.created_by = u.id 
                    LEFT JOIN question_groups g ON se.group_id = g.id";
            
            if ($gid && $gid !== 'all') {
                $stmt = $db->prepare($sql . " WHERE se.group_id = ? ORDER BY se.id DESC LIMIT 100");
                $stmt->execute([$gid]);
                $res = $stmt->fetchAll();
            } else {
                $res = $db->query($sql . " ORDER BY se.id DESC LIMIT 100")->fetchAll();
            }
            
            return Response::json($res);
        } catch (Exception $e) {
            return Response::json([]);
        }
    }

    /**
     * Monitoring DNA: Menggabungkan data pengerjaan aktif dan yang sudah selesai.
     * Sangat krusial untuk pengawasan ujian real-time.
     */
    public static function getActiveMonitoring($params) {
        try {
            $gid = $params['group_id'] ?? null;
            if (!$gid || $gid === 'all' || $gid === 'null') {
                return Response::json(["ongoing" => [], "finished" => []]);
            }

            $db = Database::getConnection();
            
            // 1. Ambil Siswa yang Sedang Mengerjakan (Ongoing)
            $ongoing_sql = "SELECT 
                                u.id as user_id, u.name, u.kelas, u.nis, 
                                'ONGOING' as status, g.group_name, g.id as group_id,
                                (SELECT COUNT(*) FROM student_progress WHERE user_id = u.id AND group_id = g.id AND status = 'active') as answered_count,
                                (SELECT COUNT(DISTINCT reset_at) FROM student_progress WHERE user_id = u.id AND group_id = g.id AND status = 'reset') as reset_count,
                                COALESCE(
                                    (SELECT MIN(created_at) FROM student_progress WHERE user_id = u.id AND group_id = g.id AND status = 'active'),
                                    (SELECT MIN(created_at) FROM access_logs WHERE user_id = u.id AND group_id = g.id),
                                    '-'
                                ) as start_time,
                                (SELECT MAX(updated_at) FROM student_progress WHERE user_id = u.id AND group_id = g.id AND status = 'active') as last_activity
                            FROM users u
                            INNER JOIN question_groups g ON g.id = :gid
                            WHERE u.role = 'SISWA'
                            AND (
                                EXISTS (SELECT 1 FROM access_logs al WHERE al.user_id = u.id AND al.group_id = g.id)
                                OR EXISTS (SELECT 1 FROM student_progress sp WHERE sp.user_id = u.id AND sp.group_id = g.id AND sp.status = 'active')
                            )
                            AND NOT EXISTS (
                                SELECT 1 FROM scores s 
                                WHERE s.user_id = u.id AND s.group_id = g.id AND s.status = 'active'
                            )
                            GROUP BY u.id";
            
            $stmt_ongoing = $db->prepare($ongoing_sql);
            $stmt_ongoing->execute(['gid' => $gid]);
            $list_ongoing = $stmt_ongoing->fetchAll(PDO::FETCH_ASSOC);

            // 2. Ambil Siswa yang Sudah Selesai (Finished)
            $finished_sql = "SELECT 
                                u.id as user_id, u.name, u.kelas, u.nis, 
                                'FINISHED' as status, s.score, s.start_time, s.end_time, s.answers_json,
                                g.group_name, g.id as group_id,
                                (SELECT COUNT(DISTINCT reset_at) FROM student_progress WHERE user_id = u.id AND group_id = g.id AND status = 'reset') as reset_count,
                                (SELECT MAX(updated_at) FROM student_progress WHERE user_id = u.id AND group_id = g.id) as last_activity
                             FROM scores s 
                             JOIN users u ON s.user_id = u.id 
                             JOIN question_groups g ON s.group_id = g.id
                             WHERE s.group_id = :gid AND s.status = 'active'
                             ORDER BY s.end_time DESC";
            
            $stmt_finished = $db->prepare($finished_sql);
            $stmt_finished->execute(['gid' => $gid]);
            $list_finished = $stmt_finished->fetchAll(PDO::FETCH_ASSOC);

            return Response::json([
                "ongoing" => $list_ongoing, 
                "finished" => $list_finished,
                "timestamp" => time()
            ]);
        } catch (Exception $e) {
            return Response::json(["ongoing" => [], "finished" => [], "error" => $e->getMessage()]);
        }
    }

    /**
     * Mencatat log error ke file .txt untuk audit frontend.
     */
    public static function logError($input) {
        try {
            $log = $input['log'] ?? 'Empty log';
            $logsDir = __DIR__ . '/../logs';
            if (!file_exists($logsDir)) {
                mkdir($logsDir, 0777, true);
            }
            $file = $logsDir . '/error_logs.txt';
            
            // Tambahkan pembatas dan waktu server jika belum ada di log
            $timestamp = date('Y-m-d H:i:s');
            $entry = "--- SERVER LOGGED AT $timestamp ---\n" . $log . "\n\n";
            
            file_put_contents($file, $entry, FILE_APPEND | LOCK_EX);
            
            return Response::json(["success" => true]);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * Mengambil isi file error_logs.txt
     */
    public static function getErrorLogs() {
        try {
            $file = __DIR__ . '/../logs/error_logs.txt';
            if (!file_exists($file)) {
                return Response::json(["success" => true, "logs" => "Belum ada log error."]);
            }
            $content = file_get_contents($file);
            return Response::json(["success" => true, "logs" => $content]);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * Menghapus isi file error_logs.txt
     */
    public static function clearErrorLogs() {
        try {
            $file = __DIR__ . '/../logs/error_logs.txt';
            if (file_exists($file)) {
                unlink($file);
            }
            return Response::json(["success" => true]);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }
}
?>
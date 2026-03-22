<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';

/**
 * ScoreController - Manajemen Nilai, Hasil, dan Integritas Ujian
 * 
 * Kelas ini mengontrol seluruh alur data hasil ujian siswa di SMP N 06 Pekalongan.
 * Memastikan setiap jawaban tersimpan dengan aman dan mendukung fitur reset 
 * pengerjaan untuk memfasilitasi ujian ulang (recycle), baik individu maupun massal.
 * 
 * @package Controllers
 * @version 8.9.0 (World-Class Senior Engineer Edition)
 * @author Senior Frontend & Backend Engineer
 */
class ScoreController {

    /**
     * Mengambil daftar seluruh skor yang berstatus 'active'.
     * Digunakan oleh Admin dan Guru untuk memantau nilai yang sah (bukan hasil reset).
     * 
     * @return void Mengirim respon JSON berisi array skor aktif.
     */
    public static function getAll() {
        try {
            $db = Database::getConnection();
            
            /**
             * Menggunakan query join untuk mendapatkan detail user dan grup soal sekaligus.
             * Hal ini mengurangi latensi dibandingkan melakukan query berulang di sisi client.
             */
            $sql = "SELECT 
                        s.*, 
                        u.name, 
                        u.kelas, 
                        u.nis, 
                        u.nisn,
                        g.group_name,
                        g.group_code
                    FROM scores s 
                    INNER JOIN users u ON s.user_id = u.id 
                    LEFT JOIN question_groups g ON s.group_id = g.id 
                    WHERE s.status = 'active'
                    ORDER BY s.end_time DESC, s.id DESC";
            
            $stmt = $db->prepare($sql);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Verifikasi integritas data sebelum pengiriman
            if ($results === false) {
                return Response::json([]);
            }

            return Response::json($results);

        } catch (PDOException $e) {
            error_log("Database Error in ScoreController::getAll: " . $e->getMessage());
            return Response::json([
                "success" => false, 
                "message" => "Terjadi kesalahan pada server database.",
                "error_code" => $e->getCode()
            ], 500);
        } catch (Exception $e) {
            return Response::json([
                "success" => false, 
                "message" => "Gagal memproses data skor: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengambil riwayat skor lengkap (Active & Reset) untuk audit trail.
     * Default status diatur ke 'all' untuk transparansi sinkronisasi di dashboard siswa.
     * 
     * @param array $params Parameter pencarian (user_id, group_id, status).
     * @return void
     */
    public static function getHistory($params) {
        try {
            $db = Database::getConnection();
            
            $uid = isset($params['user_id']) ? (int)$params['user_id'] : null;
            $gid = isset($params['group_id']) ? (int)$params['group_id'] : null;
            
            /** 
             * PENTING: Menggunakan status 'all' secara default.
             * Hal ini memungkinkan dashboard siswa mendeteksi pengerjaan yang di-reset
             * sehingga tombol "MULAI" muncul kembali setelah sinkronisasi.
             */
            $status = isset($params['status']) ? $params['status'] : 'all';
            
            $sql = "SELECT 
                        s.*, 
                        u.name, 
                        u.kelas, 
                        u.nis, 
                        g.group_name 
                    FROM scores s 
                    INNER JOIN users u ON s.user_id = u.id 
                    INNER JOIN question_groups g ON s.group_id = g.id 
                    WHERE 1=1";
            
            $bind = [];
            if ($uid > 0) { 
                $sql .= " AND s.user_id = ?"; 
                $bind[] = $uid; 
            }
            if ($gid > 0) { 
                $sql .= " AND s.group_id = ?"; 
                $bind[] = $gid; 
            }
            
            if ($status !== 'all') { 
                $sql .= " AND s.status = ?"; 
                $bind[] = $status; 
            }
            
            $sql .= " ORDER BY s.id DESC";
            $stmt = $db->prepare($sql);
            $stmt->execute($bind);
            
            return Response::json($stmt->fetchAll(PDO::FETCH_ASSOC));

        } catch (Exception $e) {
            return Response::json([
                "success" => false, 
                "message" => "Gagal memuat riwayat: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan rincian skor spesifik berdasarkan ID unik.
     * Biasanya digunakan untuk tampilan modal rincian pengerjaan oleh guru.
     */
    public static function getById($id) {
        try {
            if (!$id) throw new Exception("Identitas pengerjaan tidak valid.");
            
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT s.*, u.name, u.kelas, u.nis FROM scores s JOIN users u ON s.user_id = u.id WHERE s.id = ?");
            $stmt->execute([$id]);
            $score = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$score) {
                return Response::json(["success" => false, "message" => "Record pengerjaan tidak ditemukan."], 404);
            }
            
            return Response::json(["success" => true, "data" => $score]);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * Menyimpan hasil ujian (Submit Final).
     * Mengubah pengerjaan menjadi status 'active' dan mencatat waktu submit.
     */
    public static function submit($input) {
        try {
            $db = Database::getConnection();
            
            $uid = (int)($input['studentId'] ?? 0);
            $gid = (int)($input['groupId'] ?? 0);
            
            if ($uid <= 0 || $gid <= 0) {
                throw new Exception("Identitas pengerjaan atau sesi tidak sah.");
            }

            /**
             * Penanganan Waktu Mulai.
             * Mengonversi timestamp milidetik dari JavaScript Date.now() ke format standar SQL.
             */
            $startTime = isset($input['startTime']) 
                ? date('Y-m-d H:i:s', floor($input['startTime'] / 1000)) 
                : date('Y-m-d H:i:s');
            
            $sql = "INSERT INTO scores (
                        user_id, group_id, score, total_points_earned, 
                        max_possible_points, answers_json, uncertain_json, start_time, 
                        end_time, status, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'active', NOW())";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                $uid, 
                $gid, 
                (int)($input['score'] ?? 0),
                (int)($input['totalPointsEarned'] ?? 0), 
                (int)($input['maxPossiblePoints'] ?? 100),
                json_encode($input['answers'] ?? []), 
                json_encode($input['uncertainAnswers'] ?? []),
                $startTime
            ]);
            
            return Response::json([
                "success" => true, 
                "message" => "Data jawaban telah disinkronkan dan dikirim ke server."
            ]);

        } catch (Exception $e) {
            error_log("Critical Submit Error: " . $e->getMessage());
            return Response::json(["success" => false, "message" => "Gagal Sinkronisasi: " . $e->getMessage()], 500);
        }
    }

    /**
     * Mekanisme RESET Pengerjaan (Atomic Recycle Logic).
     * Mendukung Reset Individu (user_id angka) dan Reset Massal (user_id = 'all').
     * 
     * @param array $params (user_id, group_id, performer_id).
     */
    public static function reset($params) {
        try {
            $db = Database::getConnection();
            $uid = $params['user_id'] ?? null; 
            $gid = (int)($params['group_id'] ?? 0);
            $actor = (int)($params['performer_id'] ?? 0);

            if ($gid <= 0) {
                return Response::json(["success" => false, "message" => "ID Sesi diperlukan."], 400);
            }

            /**
             * Memulai Transaksi Database.
             * Menjamin status scores dan student_progress berubah secara bersamaan (All or Nothing).
             */
            $db->beginTransaction();

            if ($uid === 'all') {
                // --- STRATEGI RESET MASSAL ---
                $db->prepare("UPDATE scores SET status = 'reset' WHERE group_id = ? AND status = 'active'")->execute([$gid]);
                $db->prepare("UPDATE student_progress SET status = 'reset', reset_at = NOW() WHERE group_id = ? AND status = 'active'")->execute([$gid]);
                $logDetails = "Pembersihan massal seluruh pengerjaan pada Sesi ID $gid.";
                $targetLogId = 0; // ID 0 merepresentasikan entitas 'Seluruh Peserta'
            } else {
                // --- STRATEGI RESET INDIVIDU ---
                $target_uid = (int)$uid;
                if ($target_uid <= 0) throw new Exception("ID Peserta tidak valid.");
                
                $db->prepare("UPDATE scores SET status = 'reset' WHERE user_id = ? AND group_id = ? AND status = 'active'")->execute([$target_uid, $gid]);
                $db->prepare("UPDATE student_progress SET status = 'reset', reset_at = NOW() WHERE user_id = ? AND group_id = ? AND status = 'active'")->execute([$target_uid, $gid]);
                $logDetails = "Pembersihan pengerjaan individu peserta ID $target_uid.";
                $targetLogId = $target_uid;
            }
            
            // Pencatatan Log Audit untuk transparansi manajerial
            if ($actor >= 0) {
                $stmtLog = $db->prepare("INSERT INTO reset_logs (target_user_id, group_id, created_by, status, details) 
                                         VALUES (?, ?, ?, 'SUCCESS', ?)");
                $stmtLog->execute([$targetLogId, $gid, $actor, $logDetails]);
            }

            $db->commit();
            
            return Response::json([
                "success" => true, 
                "message" => "Operasi reset berhasil. Siswa dapat memulai kembali pengerjaan."
            ]);

        } catch (PDOException $e) {
            if ($db && $db->inTransaction()) $db->rollBack();
            return Response::json(["success" => false, "message" => "Database Transaction Error: " . $e->getMessage()], 500);
        } catch (Exception $e) {
            if ($db && $db->inTransaction()) $db->rollBack();
            return Response::json(["success" => false, "message" => "Reset gagal: " . $e->getMessage()], 500);
        }
    }
}


<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';

class ProgressController {
    /**
     * Simpan progres jawaban sementara (Auto-save)
     */
    public static function save($input) {
        try {
            $db = Database::getConnection();
            $uid = (int)$input['user_id'];
            $gid = (int)$input['group_id'];
            $qid = (int)$input['question_id'];
            $ans = json_encode($input['answer_data']);
            $unc = (int)($input['is_uncertain'] ?? 0);

            $check = $db->prepare("SELECT id FROM student_progress WHERE user_id = ? AND group_id = ? AND question_id = ? AND status = 'active' LIMIT 1");
            $check->execute([$uid, $gid, $qid]);
            $existing = $check->fetch();

            if ($existing) {
                $sql = "UPDATE student_progress SET answer_data = ?, is_uncertain = ?, updated_at = NOW() WHERE id = ?";
                $db->prepare($sql)->execute([$ans, $unc, $existing['id']]);
            } else {
                $sql = "INSERT INTO student_progress (user_id, group_id, question_id, answer_data, is_uncertain, status, created_at) VALUES (?, ?, ?, ?, ?, 'active', NOW())";
                $db->prepare($sql)->execute([$uid, $gid, $qid, $ans, $unc]);
            }

            return Response::json(["success" => true]);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * Mendapatkan rincian pengerjaan siswa untuk satu grup soal
     */
    public static function get($params) {
        try {
            $db = Database::getConnection();
            $uid = (int)($params['user_id'] ?? 0);
            $gid = (int)($params['group_id'] ?? 0);

            $stmt = $db->prepare("SELECT question_id, answer_data, is_uncertain FROM student_progress WHERE user_id = ? AND group_id = ? AND status = 'active'");
            $stmt->execute([$uid, $gid]);
            $rows = $stmt->fetchAll();

            $answers = [];
            $uncertain = [];
            foreach ($rows as $r) {
                $answers[$r['question_id']] = json_decode($r['answer_data'], true);
                if ($r['is_uncertain']) $uncertain[] = $r['question_id'];
            }

            return Response::json(["answers" => $answers, "uncertain" => $uncertain]);
        } catch (Exception $e) {
            return Response::json(["answers" => [], "uncertain" => []]);
        }
    }

    /**
     * Mendapatkan ringkasan progres pengerjaan milik user saat ini
     */
    public static function getMyProgress($params) {
        try {
            $db = Database::getConnection();
            $uid = (int)($params['user_id'] ?? 0);

            $sql = "SELECT group_id, 
                    COUNT(*) as answered_count, 
                    SUM(is_uncertain) as uncertain_count,
                    MAX(updated_at) as last_activity
                    FROM student_progress 
                    WHERE user_id = ? AND status = 'active' 
                    GROUP BY group_id";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([$uid]);
            return Response::json($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (Exception $e) {
            return Response::json([]);
        }
    }

    /**
     * Menyimpan durasi pengerjaan satu soal (Tracking Analitik)
     */
    public static function saveTimeLog($input) {
        try {
            $db = Database::getConnection();
            $uid = (int)$input['user_id'];
            $gid = (int)$input['group_id'];
            $qid = (int)$input['question_id'];
            $duration = (int)$input['duration_seconds'];
            $is_correct = (int)$input['is_correct']; 
            $ans = json_encode($input['answer_data']);

            $sql = "INSERT INTO question_time_logs (
                        user_id, group_id, question_id, duration_seconds, 
                        is_correct, answer_data, start_time, end_time, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, NOW() - INTERVAL ? SECOND, NOW(), NOW())";
            
            $db->prepare($sql)->execute([$uid, $gid, $qid, $duration, $is_correct, $ans, $duration]);
            
            return Response::json(["success" => true]);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * Mengambil log waktu untuk Dashboard Guru (Analisis Heatmap)
     */
    public static function getTimeLogs($params) {
        try {
            $db = Database::getConnection();
            $uid = (int)$params['user_id'];
            $gid = (int)$params['group_id'];

            $sql = "SELECT tl.*, q.subject, q.type, q.points as max_points
                    FROM question_time_logs tl 
                    JOIN questions q ON tl.question_id = q.id 
                    WHERE tl.user_id = ? AND tl.group_id = ?
                    ORDER BY tl.created_at ASC";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([$uid, $gid]);
            
            return Response::json($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (Exception $e) {
            return Response::json([]);
        }
    }
}
?>

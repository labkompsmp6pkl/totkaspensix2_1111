<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';

if (!class_exists('QuestionController')) {
    class QuestionController {
    /**
     * Ambil semua soal yang aktif (tidak di-delete)
     */
    public static function getAll() {
        try {
            $db = Database::getConnection();
            $sql = "SELECT * FROM questions WHERE deleted_at IS NULL ORDER BY subject ASC, sort_order ASC";
            $res = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($res as &$q) {
                self::formatQuestion($q);
            }
            return Response::json($res);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * Ambil soal yang ada di tempat sampah
     */
    public static function getTrash() {
        try {
            $db = Database::getConnection();
            $sql = "SELECT * FROM questions WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC";
            $res = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($res as &$q) {
                self::formatQuestion($q);
            }
            return Response::json($res);
        } catch (Exception $e) {
            return Response::json([]);
        }
    }

    /**
     * Simpan atau Update Soal
     */
    public static function save($input) {
        try {
            $db = Database::getConnection();
            $id = $input['id'] ?? null;

            // Bungkus data konten ke dalam JSON
            $content = json_encode([
                "options" => $input['options'] ?? [], 
                "correctOptionId" => $input['correctOptionId'] ?? null,
                "correctOptionIds" => $input['correctOptionIds'] ?? [], 
                "statements" => $input['statements'] ?? [],
                "tableOptions" => $input['tableOptions'] ?? ['BENAR', 'SALAH']
            ]);
            
            $scoringMode = $input['scoring_mode'] ?? 'all_or_nothing';
            if (empty($scoringMode)) $scoringMode = 'all_or_nothing';
            
            $data = [
                'g' => json_encode($input['group_ids'] ?? []),
                's' => $input['subject'],
                't' => $input['text'],
                'tp' => $input['type'],
                'p' => (int)($input['points'] ?? 10),
                'sm' => $scoringMode,
                'so' => (int)($input['sort_order'] ?? 0),
                'tt' => (int)($input['target_time'] ?? 0),
                'mu' => $input['mediaUrl'] ?? '',
                'c' => $content,
                'cb' => $input['created_by'] ?? 1
            ];

            if ($id) {
                $sql = "UPDATE questions SET 
                            group_id=:g, subject=:s, text=:t, type=:tp, 
                            points=:p, scoring_mode=:sm, sort_order=:so, 
                            target_time=:tt, media_url=:mu, content_json=:c, 
                            updated_at=NOW() 
                        WHERE id=:id";
                $data['id'] = $id;
                unset($data['cb']);
            } else {
                $sql = "INSERT INTO questions (
                            group_id, subject, text, type, points, 
                            scoring_mode, sort_order, target_time, 
                            media_url, content_json, created_by, created_at
                        ) VALUES (:g, :s, :t, :tp, :p, :sm, :so, :tt, :mu, :c, :cb, NOW())";
            }

            $db->prepare($sql)->execute($data);
            return Response::json(["success" => true, "message" => "Soal berhasil disimpan"]);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * Soft Delete (Pindah ke Trash)
     */
    public static function delete($id) {
        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("UPDATE questions SET deleted_at = NOW() WHERE id = ?");
            $stmt->execute([$id]);
            return Response::json(["success" => true]);
        } catch (Exception $e) {
            return Response::json(["success" => false], 500);
        }
    }

    /**
     * Restore dari Trash
     */
    public static function restore($input) {
        try {
            $db = Database::getConnection();
            $id = $input['id'] ?? null;
            $db->prepare("UPDATE questions SET deleted_at = NULL WHERE id = ?")->execute([$id]);
            return Response::json(["success" => true]);
        } catch (Exception $e) {
            return Response::json(["success" => false], 500);
        }
    }

    /**
     * Helper untuk memformat output JSON soal
     */
    private static function formatQuestion(&$q) {
        $q['group_ids'] = json_decode($q['group_id'] ?? '[]', true);
        $content = json_decode($q['content_json'] ?? '{}', true);
        
        $q['options'] = $content['options'] ?? [];
        $q['correctOptionId'] = $content['correctOptionId'] ?? null;
        $q['correctOptionIds'] = $content['correctOptionIds'] ?? [];
        $q['statements'] = $content['statements'] ?? [];
        $q['tableOptions'] = $content['tableOptions'] ?? ['BENAR', 'SALAH'];
        $q['scoring_mode'] = $q['scoring_mode'] ?? 'all_or_nothing';
        
        unset($q['content_json']);
        unset($q['group_id']);
    }
}
}
?>
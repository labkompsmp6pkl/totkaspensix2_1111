<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';

if (!class_exists('GroupController')) {
    class GroupController {
    public static function getAll() {
        try {
            $db = Database::getConnection();
            $sql = "SELECT g.*, 
                    (SELECT COUNT(*) FROM scores WHERE group_id = g.id AND status = 'active') as count_finished,
                    (SELECT COUNT(DISTINCT user_id) FROM student_progress WHERE group_id = g.id AND status = 'active') as count_ongoing
                    FROM question_groups g WHERE deleted_at IS NULL ORDER BY id DESC";
            $res = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            
            foreach($res as &$g) { 
                $g['id'] = (int)$g['id']; 
                $g['teacher_ids'] = json_decode($g['teacher_ids'] ?? '[]', true); 
                $g['target_classes'] = json_decode($g['target_classes'] ?? '[]', true); 
                $g['is_active'] = $g['last_started_at'] !== null;
            }
            
            return Response::json($res);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * Aksi Independen: Mengaktifkan atau Mematikan Sesi tertentu.
     */
    public static function toggleStatus($input) {
        try {
            $db = Database::getConnection();
            $gid = (int)($input['group_id'] ?? 0);
            $status = $input['status']; // 'START' atau 'STOP'
            $performer = (int)($input['performer_id'] ?? 0);

            if ($gid <= 0) throw new Exception("ID Sesi tidak valid.");

            if ($status === 'START') {
                // Beri timestamp mulai SEKARANG menggunakan waktu PHP agar sinkron (WIB)
                $db->prepare("UPDATE question_groups SET last_started_at = ? WHERE id = ?")->execute([date('Y-m-d H:i:s'), $gid]);
                $db->prepare("INSERT INTO session_events (group_id, event_type, event_notes, created_by) 
                              VALUES (?, 'START', 'AKTIVASI MANDIRI', ?)")->execute([$gid, $performer]);
            } else {
                // Matikan sesi
                $db->prepare("UPDATE question_groups SET last_started_at = NULL WHERE id = ?")->execute([$gid]);
                $db->prepare("INSERT INTO session_events (group_id, event_type, event_notes, created_by) 
                              VALUES (?, 'STOP', 'PENGHENTIAN MANUAL', ?)")->execute([$gid, $performer]);
            }

            return Response::json(["success" => true]);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public static function save($input) {
        try {
            $db = Database::getConnection();
            $id = $input['id'] ?? null;
            
            // Casting eksplisit ke integer agar tidak ada selisih data
            $data = [
                'gn' => $input['group_name'], 
                'gc' => strtoupper($input['group_code']),
                'dm' => (int)($input['duration_minutes'] ?? 60), 
                'etm' => (int)($input['extra_time_minutes'] ?? 0),
                'ish' => (int)($input['is_shuffled'] ?? 1),
                'tid' => json_encode($input['teacher_ids'] ?? []), 
                'tcls' => json_encode($input['target_classes'] ?? [])
            ];

            if ($id) {
                $sql = "UPDATE question_groups SET group_name=:gn, group_code=:gc, duration_minutes=:dm, extra_time_minutes=:etm, is_shuffled=:ish, teacher_ids=:tid, target_classes=:tcls, updated_at=NOW() WHERE id=:id";
                $data['id'] = (int)$id;
            } else {
                $sql = "INSERT INTO question_groups (group_name, group_code, duration_minutes, extra_time_minutes, is_shuffled, teacher_ids, target_classes, created_at) VALUES (:gn, :gc, :dm, :etm, :ish, :tid, :tcls, NOW())";
            }
            $db->prepare($sql)->execute($data);
            return Response::json(["success" => true]);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public static function delete($id) {
        try {
            $db = Database::getConnection();
            $db->prepare("UPDATE question_groups SET deleted_at = NOW() WHERE id = ?")->execute([$id]);
            return Response::json(["success" => true]);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }
}
}
?>
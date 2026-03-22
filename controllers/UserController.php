<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';

if (!class_exists('UserController')) {
    class UserController {
    public static function getAll() {
        $db = Database::getConnection();
        $sql = "SELECT * FROM users WHERE deleted_at IS NULL ORDER BY name ASC";
        return Response::json($db->query($sql)->fetchAll(PDO::FETCH_ASSOC));
    }

    public static function getTrash() {
        $db = Database::getConnection();
        $sql = "SELECT * FROM users WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC";
        return Response::json($db->query($sql)->fetchAll(PDO::FETCH_ASSOC));
    }

    public static function restore($input) {
        $db = Database::getConnection();
        $id = $input['id'] ?? null;
        $performer_id = $input['performer_id'] ?? null;
        $password = $input['password'] ?? null;

        if (!$id || !$performer_id || !$password) return Response::json(["success" => false, "message" => "Data tidak lengkap"], 400);

        $stmt = $db->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$performer_id]);
        $user = $stmt->fetch();

        if ($user && $user['password'] === $password) {
            $db->prepare("UPDATE users SET deleted_at = NULL WHERE id = ?")->execute([$id]);
            return Response::json(["success" => true]);
        }
        return Response::json(["success" => false, "message" => "Kata Sandi Salah!"], 401);
    }

    public static function save($input) {
        try {
            $db = Database::getConnection();
            $id = $input['id'] ?? null;
            $data = [
                'n' => $input['name'], 
                'r' => $input['role'], 
                'u' => $input['username'], 
                'nis' => $input['nis'] ?? null, 
                'nip' => $input['nip'] ?? null, 
                'k' => $input['kelas'] ?? null,
                'ta' => $input['tahun_ajaran'] ?? null
            ];
            
            if ($id) {
                $sql = "UPDATE users SET name=:n, role=:r, username=:u, nis=:nis, nip=:nip, kelas=:k, tahun_ajaran=:ta, updated_at=NOW()";
                if (!empty($input['password'])) { 
                    $sql .= ", password=:p"; 
                    $data['p'] = $input['password']; 
                }
                $sql .= " WHERE id=:id"; 
                $data['id'] = $id;
            } else {
                $sql = "INSERT INTO users (name, role, username, password, nis, nip, kelas, tahun_ajaran, created_at) VALUES (:n, :r, :u, :p, :nis, :nip, :k, :ta, NOW())";
                $data['p'] = $input['password'] ?? '123456';
            }
            
            $stmt = $db->prepare($sql);
            $stmt->execute($data);
            return Response::json(["success" => true]);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => "Gagal menyimpan data: " . $e->getMessage()], 500);
        }
    }

    public static function delete($id) {
        if (!$id) return Response::json(["success" => false, "message" => "ID required"], 400);
        $db = Database::getConnection();
        $db->prepare("UPDATE users SET deleted_at = NOW() WHERE id = ?")->execute([$id]);
        return Response::json(["success" => true]);
    }
}
}
?>
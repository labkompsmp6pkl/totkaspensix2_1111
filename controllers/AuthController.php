<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';

if (!class_exists('AuthController')) {
    class AuthController {
        public static function login($input) {
            try {
                $db = Database::getConnection();
                
                $id = isset($input['identifier']) ? trim($input['identifier']) : '';
                $pass = isset($input['password']) ? trim($input['password']) : '';
                $g_id = $input['group_id'] ?? null;

                if (empty($id) || empty($pass)) {
                    return Response::json(["success" => false, "message" => "ID dan Password wajib diisi"], 400);
                }

                $stmt = $db->prepare("SELECT * FROM users WHERE (username = :u OR nis = :n OR nip = :p) AND deleted_at IS NULL LIMIT 1");
                $stmt->execute([
                    'u' => $id,
                    'n' => $id,
                    'p' => $id
                ]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
                $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

                if ($user) {
                    if (trim((string)$user['password']) === (string)$pass) {
                        try {
                            $log = $db->prepare("INSERT INTO access_logs (user_id, group_id, ip_address, user_agent, details) VALUES (?, ?, ?, ?, ?)");
                            $log->execute([$user['id'], $g_id, $ip, $ua, "Login Berhasil"]);
                        } catch (Exception $e) {}
                        
                        unset($user['password']); 
                        return Response::json(["success" => true, "user" => $user]);
                    } else {
                        return Response::json(["success" => false, "message" => "Kata Sandi Salah untuk ID: $id"], 401);
                    }
                }
                
                return Response::json(["success" => false, "message" => "ID Pengguna tidak terdaftar"], 401);
                
            } catch (Exception $e) {
                return Response::json(["success" => false, "message" => "Login Error: " . $e->getMessage()], 500);
            }
        }
    }
}
?>
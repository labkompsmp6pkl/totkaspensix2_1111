<?php
/**
 * PORTAL API SMP N 06 PEKALONGAN - UNIVERSAL SYNC ENGINE
 * Versi: 9.9.0 (Full Restoration & Analytics Edition)
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// SET TIMEZONE INDONESIA BARAT (PEKALONGAN)
date_default_timezone_set('Asia/Jakarta');

function sendHeaders() {
    if (!headers_sent()) {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS, PUT");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept, X-App-Version");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Max-Age: 86400");
        header("Content-Type: application/json; charset=UTF-8");
        header("X-Content-Type-Options: nosniff");
        header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
        header("Cache-Control: post-check=0, pre-check=0", false);
        header("Pragma: no-cache");
    }
}

sendHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        if (ob_get_level() > 0) ob_end_clean();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Critical Error: " . $error['message']]);
    }
});

try {
    $baseDir = __DIR__;
    $modules = [
        '/core/Database.php', '/core/Response.php', '/controllers/AuthController.php',
        '/controllers/QuestionController.php', '/controllers/GroupController.php',
        '/controllers/UserController.php', '/controllers/ConfigController.php',
        '/controllers/ScoreController.php', '/controllers/ProgressController.php',
        '/controllers/LogController.php'
    ];

    foreach ($modules as $m) {
        if (file_exists($baseDir . $m)) {
            require_once $baseDir . $m;
        }
    }

    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?: $_POST;
    $action = isset($_GET['action']) ? strtolower(trim($_GET['action'])) : (isset($input['action']) ? strtolower(trim($input['action'])) : '');

    if (ob_get_level()) ob_clean();

    if (empty($action)) {
        echo json_encode(["success" => true, "status" => "Academic Node Online", "v" => "9.9.0", "server_time" => date('H:i:s')]);
    } else {
        switch ($action) {
            case 'ping': 
                $dbStatus = "Disconnected";
                try {
                    Database::getConnection();
                    $dbStatus = "Connected";
                } catch (Exception $e) {
                    $dbStatus = "Error: " . $e->getMessage();
                }
                echo json_encode(["success" => true, "time" => time(), "formatted" => date('H:i:s'), "db" => $dbStatus]); 
                break;
            
            case 'debug_modules':
                $results = [];
                foreach ($modules as $m) {
                    $results[$m] = [
                        'exists' => file_exists($baseDir . $m),
                        'path' => $baseDir . $m
                    ];
                }
                echo json_encode(["success" => true, "modules" => $results]);
                break;
            
            case 'migrate':
                try {
                    $db = Database::getConnection();
                    $messages = [];
                    
                    // Cek tabel scores
                    $checkScores = $db->query("SHOW COLUMNS FROM scores LIKE 'uncertain_json'");
                    if (!$checkScores->fetch()) {
                        $db->exec("ALTER TABLE scores ADD COLUMN uncertain_json TEXT NULL AFTER answers_json");
                        $messages[] = "Kolom uncertain_json ditambahkan ke tabel scores.";
                    }

                    // Cek tabel users
                    $checkUsers = $db->query("SHOW COLUMNS FROM users LIKE 'tahun_ajaran'");
                    if (!$checkUsers->fetch()) {
                        $db->exec("ALTER TABLE users ADD COLUMN tahun_ajaran VARCHAR(20) NULL AFTER kelas");
                        $messages[] = "Kolom tahun_ajaran ditambahkan ke tabel users.";
                    }

                    $checkNIS = $db->query("SHOW COLUMNS FROM users LIKE 'nis'");
                    if (!$checkNIS->fetch()) {
                        $db->exec("ALTER TABLE users ADD COLUMN nis VARCHAR(50) NULL AFTER username");
                        $messages[] = "Kolom nis ditambahkan ke tabel users.";
                    }

                    $checkNIP = $db->query("SHOW COLUMNS FROM users LIKE 'nip'");
                    if (!$checkNIP->fetch()) {
                        $db->exec("ALTER TABLE users ADD COLUMN nip VARCHAR(50) NULL AFTER nis");
                        $messages[] = "Kolom nip ditambahkan ke tabel users.";
                    }

                    if (empty($messages)) {
                        echo json_encode(["success" => true, "message" => "Database sudah up-to-date."]);
                    } else {
                        echo json_encode(["success" => true, "message" => "Migrasi Berhasil: " . implode(" ", $messages)]);
                    }
                } catch (Exception $e) {
                    echo json_encode(["success" => false, "message" => "Migrasi Gagal: " . $e->getMessage()]);
                }
                break;
            
            // USER & AUTH
            case 'login': AuthController::login($input); break;
            case 'get_users': UserController::getAll(); break;
            case 'save_user': UserController::save($input); break;
            case 'delete_user': UserController::delete($_GET['id'] ?? null); break;
            case 'get_users_trash': UserController::getTrash(); break;
            case 'restore_user': UserController::restore($input); break;
            
            // BANK SOAL
            case 'get_questions': QuestionController::getAll(); break;
            case 'save_question': QuestionController::save($input); break;
            case 'delete_question': QuestionController::delete($_GET['id'] ?? null); break;
            case 'get_questions_trash': QuestionController::getTrash(); break;
            case 'restore_question': QuestionController::restore($input); break;
            
            // SESI & KONFIGURASI
            case 'get_groups': GroupController::getAll(); break;
            case 'debug_groups': 
                $conn = Database::getConnection();
                $stmt = $conn->query("SELECT id, group_name, target_classes FROM question_groups");
                $groups = $stmt->fetchAll();
                echo json_encode([
                    "success" => true,
                    "raw_data" => $groups,
                    "parsed_data" => array_map(function($g) {
                        $tc = $g['target_classes'];
                        $g['target_classes_parsed'] = json_decode($tc, true);
                        if ($g['target_classes_parsed'] === null && !empty($tc)) {
                            $g['target_classes_parsed'] = array_map('trim', explode(',', $tc));
                        }
                        return $g;
                    }, $groups)
                ]);
                break;
            case 'save_group': 
                if (class_exists('GroupController')) {
                    GroupController::save($input); 
                } else {
                    echo json_encode(["success" => false, "message" => "Kontroller GroupController tidak terdeteksi di sistem."]);
                }
                break;
            case 'delete_group': 
                if (class_exists('GroupController')) {
                    GroupController::delete($_GET['id'] ?? null); 
                } else {
                    echo json_encode(["success" => false, "message" => "Kontroller GroupController tidak terdeteksi di sistem."]);
                }
                break;
            case 'toggle_group_status': 
                if (class_exists('GroupController')) {
                    GroupController::toggleStatus($input); 
                } else {
                    echo json_encode(["success" => false, "message" => "Kontroller GroupController tidak terdeteksi di sistem."]);
                }
                break;
            case 'get_config': ConfigController::get(); break;
            case 'update_config': ConfigController::update($input); break;
            
            // PENILAIAN & AUDIT
            case 'get_scores': ScoreController::getAll(); break;
            case 'get_score_history': ScoreController::getHistory($_GET); break;
            case 'submit_score': ScoreController::submit($input); break;
            case 'reset_score': ScoreController::reset($input); break;
            
            // PROGRESS & ANALYTICS
            case 'save_progress': ProgressController::save($input); break;
            case 'save_time_log': ProgressController::saveTimeLog($input); break;
            case 'get_time_logs': ProgressController::getTimeLogs($_GET); break;
            case 'get_my_progress': ProgressController::getMyProgress($_GET); break;
            case 'get_student_progress_detail': ProgressController::get($_GET); break;
            
            // MONITORING & LOGS
            case 'get_access_logs': LogController::getAll(); break;
            case 'get_active_monitoring': LogController::getActiveMonitoring($_GET); break;
            case 'get_session_events': LogController::getSessionEvents($_GET); break;
            case 'get_reset_logs': LogController::getResetLogs(); break;
            case 'log_activity': LogController::logActivity($input); break;
            case 'log_error': LogController::logError($input); break;
            case 'get_error_logs': LogController::getErrorLogs(); break;
            case 'clear_error_logs': LogController::clearErrorLogs(); break;
            
            default:
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Aksi '$action' tidak dikenali."]);
                break;
        }
    }
} catch (Throwable $e) {
    if (ob_get_level() > 0) ob_end_clean();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Critical Node Error: " . $e->getMessage()]);
}
?>
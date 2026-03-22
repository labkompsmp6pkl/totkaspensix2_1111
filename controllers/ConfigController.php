<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';

/**
 * ConfigController - Intelligent Multi-Session Assessment Engine
 * Mengelola sinkronisasi waktu server, proteksi otomatis (Multi-Sesi), dan konfigurasi gerbang.
 */
class ConfigController {

    /**
     * get() - Sinkronisasi State & Auto-Stop Scanning.
     * Memantau seluruh grup yang running dan mengatur status Gerbang Utama.
     */
    public static function get() {
        try {
            $db = Database::getConnection();
            
            // --- SYNC TIMEZONE: Memastikan NOW() di DB sama dengan time() di PHP (Asia/Jakarta) ---
            $db->exec("SET time_zone = '+07:00'");
            $now = time();
            
            // --- 1. ENGINE PEMANTAUAN MULTI-SESI (SCANNIG LOOP) ---
            // Scan semua grup soal yang sedang 'LIVE' (last_started_at tidak NULL)
            $runningGroups = $db->query("SELECT id, last_started_at, duration_minutes, extra_time_minutes 
                                       FROM question_groups 
                                       WHERE last_started_at IS NOT NULL AND deleted_at IS NULL")->fetchAll();
            
            foreach ($runningGroups as $group) {
                $gid = (int)$group['id'];
                $startTime = strtotime($group['last_started_at']);
                
                // KALKULASI TOTAL MENIT: DURASI UTAMA + TAMBAHAN WAKTU
                $mainDur = (int)($group['duration_minutes'] ?? 0);
                $extraDur = (int)($group['extra_time_minutes'] ?? 0);
                $totalMinutes = $mainDur + $extraDur;
                
                $endTime = $startTime + ($totalMinutes * 60);
                
                // Jika waktu server sekarang melampaui batas pengerjaan sesi ini
                if ($now >= $endTime) {
                    // A. Matikan status aktif grup tersebut secara individu
                    $db->prepare("UPDATE question_groups SET last_started_at = NULL WHERE id = ?")->execute([$gid]);
                    
                    // B. Jika sesi ini sedang terpilih sebagai 'Gerbang Utama', kosongkan gerbangnya
                    $db->prepare("UPDATE exam_config SET active_group_id = NULL WHERE active_group_id = ?")->execute([$gid]);
                    
                    // C. Catat ke Audit Log sebagai pemberhentian otomatis oleh SISTEM (ID: 0)
                    $msg = "OTOMATIS (TOTAL " . $totalMinutes . " MNT HABIS)";
                    $db->prepare("INSERT INTO session_events (group_id, event_type, event_notes, created_by) 
                                  VALUES (?, 'STOP', ?, 0)")
                       ->execute([$gid, $msg]);
                }
            }

            // --- 2. PENGAMBILAN KONFIGURASI GLOBAL ---
            $res = $db->query("SELECT * FROM exam_config WHERE id = 1")->fetch(PDO::FETCH_ASSOC);
            
            if ($res) {
                $res['active_group_id'] = ($res['active_group_id'] !== null) ? (int)$res['active_group_id'] : null;
            } else {
                $res = ["exam_code" => "TKA2026", "active_group_id" => null];
            }

            return Response::json($res);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => "Engine Error: " . $e->getMessage()], 500);
        }
    }

    /**
     * update() - Mengatur perubahan konfigurasi gerbang utama dan Master Token.
     */
    public static function update($input) {
        try {
            $db = Database::getConnection();
            $db->exec("SET time_zone = '+07:00'");
            $performer_id = (int)($input['performer_id'] ?? 1);
            
            // Identifikasi status lama
            $oldConfig = $db->query("SELECT active_group_id FROM exam_config WHERE id = 1")->fetch();
            $oldActiveId = $oldConfig ? $oldConfig['active_group_id'] : null;

            // Tentukan nilai baru
            $newActiveId = (!isset($input['active_group_id']) || $input['active_group_id'] === null || $input['active_group_id'] === 'null' || $input['active_group_id'] === '') 
                           ? null : (int)$input['active_group_id'];
            
            $exam_code = isset($input['exam_code']) ? strtoupper(trim($input['exam_code'])) : 'TKA2026';
            
            // Update Konfigurasi
            $stmt = $db->prepare("UPDATE exam_config SET exam_code = ?, active_group_id = ? WHERE id = 1");
            $stmt->execute([$exam_code, $newActiveId]);
            
            // LOGIKA PENCATATAN AUDIT LOG & TRIGGER WAKTU
            if ($oldActiveId != $newActiveId) {
                // KASUS: Sesi Dihentikan Manual lewat Gerbang Utama
                if ($oldActiveId !== null && $newActiveId === null) {
                    $db->prepare("INSERT INTO session_events (group_id, event_type, event_notes, created_by) 
                                  VALUES (?, 'STOP', 'MANUAL (ADMIN GATE)', ?)")
                       ->execute([$oldActiveId, $performer_id]);
                    
                    // Nonaktifkan juga di tabel grup
                    $db->prepare("UPDATE question_groups SET last_started_at = NULL WHERE id = ?")->execute([$oldActiveId]);
                }
                
                // KASUS: Sesi Baru Dimulai lewat Gerbang Utama
                if ($newActiveId !== null) {
                    $db->prepare("INSERT INTO session_events (group_id, event_type, event_notes, created_by) 
                                  VALUES (?, 'START', 'SESI DIMULAI (GATE)', ?)")
                       ->execute([$newActiveId, $performer_id]);
                    
                    // Set Waktu Mulai SEKARANG menggunakan format PHP agar sinkron dengan timezone WIB
                    $db->prepare("UPDATE question_groups SET last_started_at = ? WHERE id = ?")
                       ->execute([date('Y-m-d H:i:s'), $newActiveId]);
                }
            }
            
            return Response::json(["success" => true]);
        } catch (Exception $e) {
            return Response::json(["success" => false, "message" => "Update Error: " . $e->getMessage()], 500);
        }
    }
}
?>
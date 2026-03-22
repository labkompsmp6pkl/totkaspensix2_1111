<?php
if (!class_exists('Response')) {
    class Response {
        public static function json($data, $status = 200) {
            while (ob_get_level() > 0) {
                ob_end_clean();
            }
            
            http_response_code($status);
            header("Content-Type: application/json; charset=UTF-8");
            
            echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }
    }
}
?>
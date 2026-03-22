<?php
if (!class_exists('Database')) {
    class Database {
        private static $instance = null;
        private $conn;

        private function __construct() {
            $db_name = "smpnpeka_totka";
            $username = "smpnpeka_totka";
            $password = "Kartinispensix@36";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT => 7,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ];
            
            try {
                $this->conn = new PDO("mysql:host=localhost;dbname=$db_name;charset=utf8mb4", $username, $password, $options);
            } catch(PDOException $e) {
                try {
                    $this->conn = new PDO("mysql:host=127.0.0.1;dbname=$db_name;charset=utf8mb4", $username, $password, $options);
                } catch(PDOException $e2) {
                    throw new Exception("Gagal Koneksi Database: " . $e2->getMessage());
                }
            }
        }

        public static function getConnection() {
            if (self::$instance == null) {
                self::$instance = new Database();
            }
            return self::$instance->conn;
        }
    }
}
?>
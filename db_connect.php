<?php
// db_connect.php

// A sessão DEVE ser iniciada antes de qualquer outra lógica,
// especialmente antes das verificações de redirecionamento no index.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$servername = "localhost";
$username   = "root";
$password   = "";        // Altere para sua senha do MySQL
$dbname     = "studio_transformese";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    $is_api = strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false;
    if ($is_api) {
        header('Content-Type: application/json');
        die(json_encode(['success' => false, 'message' => 'Conexão com o banco falhou.']));
    } else {
        die('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Erro</title></head>
             <body style="font-family:sans-serif;text-align:center;padding:4rem">
             <h2>⚠️ Erro de conexão com o banco de dados</h2>
             <p>Verifique as configurações em <strong>db_connect.php</strong>.</p>
             </body></html>');
    }
}

$conn->set_charset("utf8mb4");
?>

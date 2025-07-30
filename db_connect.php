<?php
// db_connect.php

$servername = "localhost"; // Ou o IP do seu servidor de banco de dados
$username = "root"; // Seu usuário do MySQL
$password = ""; // Sua senha do MySQL
$dbname = "studio_transformese";

// Cria a conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica a conexão
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}

// Define o charset para UTF-8
$conn->set_charset("utf8mb4");

// Inicia a sessão PHP para gerenciar o estado de login
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
?>
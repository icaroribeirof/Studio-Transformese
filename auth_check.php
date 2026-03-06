<?php
// auth_check.php
// Inclua este arquivo no topo de cada página protegida.
// Uso: require_once 'auth_check.php'; check_auth('cliente'); ou check_auth('admin');

function check_auth(string $required_role): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $logged_in = isset($_SESSION['user_id']) && isset($_SESSION['role']);

    if (!$logged_in) {
        header('Location: index.php');
        exit;
    }

    if ($_SESSION['role'] !== $required_role) {
        // Redireciona para o painel correto de acordo com o papel real
        if ($_SESSION['role'] === 'admin') {
            header('Location: admin.php');
        } else {
            header('Location: cliente.php');
        }
        exit;
    }
}
?>

<?php
// api/api_auth_check.php
// Inclua no início de cada endpoint de API protegido.

function api_require_auth(string $required_role = ''): array {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Não autenticado.']);
        exit;
    }

    if ($required_role && $_SESSION['role'] !== $required_role) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Acesso negado.']);
        exit;
    }

    return [
        'id'   => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'],
        'role' => $_SESSION['role'],
    ];
}
?>

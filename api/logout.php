<?php
// api/logout.php
session_start();
session_unset(); // Remove todas as variáveis de sessão
session_destroy(); // Destrói a sessão

header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso.']);
exit;
?>
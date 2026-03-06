<?php
// api/upload_produto_imagem.php
// Endpoint separado para atualizar a imagem de um produto existente
include_once '../db_connect.php';
include_once 'api_auth_check.php';

header('Content-Type: application/json');

api_require_auth('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
    exit;
}

$product_id = (int)($_POST['product_id'] ?? 0);
if (!$product_id) {
    echo json_encode(['success' => false, 'message' => 'ID do produto inválido.']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'Nenhuma imagem enviada.']);
    exit;
}

$allowed_types = ['image/jpeg', 'image/png', 'image/webp'];
$max_size      = 2 * 1024 * 1024;

if (!in_array($_FILES['image']['type'], $allowed_types)) {
    echo json_encode(['success' => false, 'message' => 'Formato inválido. Use JPG, PNG ou WEBP.']);
    exit;
}
if ($_FILES['image']['size'] > $max_size) {
    echo json_encode(['success' => false, 'message' => 'Imagem muito grande. Máximo 2MB.']);
    exit;
}

// Remove imagem antiga
$old_stmt = $conn->prepare("SELECT url_imagem FROM produtos WHERE id = ?");
$old_stmt->bind_param("i", $product_id);
$old_stmt->execute();
$old_row = $old_stmt->get_result()->fetch_assoc();
$old_stmt->close();

if ($old_row && !empty($old_row['url_imagem'])) {
    $old_path = '../' . $old_row['url_imagem'];
    if (file_exists($old_path)) unlink($old_path);
}

// Salva nova imagem
$upload_dir = '../uploads/produtos/';
if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

$ext      = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
$filename = uniqid('prod_', true) . '.' . strtolower($ext);
$dest     = $upload_dir . $filename;

if (!move_uploaded_file($_FILES['image']['tmp_name'], $dest)) {
    echo json_encode(['success' => false, 'message' => 'Erro ao mover arquivo.']);
    exit;
}

$url_imagem = 'uploads/produtos/' . $filename;
$stmt = $conn->prepare("UPDATE produtos SET url_imagem = ? WHERE id = ?");
$stmt->bind_param("si", $url_imagem, $product_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'url_imagem' => $url_imagem, 'message' => 'Imagem atualizada.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar imagem no banco.']);
}
$stmt->close();
?>

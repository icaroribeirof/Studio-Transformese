<?php
// api/categorias.php
include_once '../db_connect.php';
include_once 'api_auth_check.php';

header('Content-Type: application/json');

$session_user = api_require_auth();
$method       = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $conn->prepare("SELECT * FROM categorias ORDER BY nome ASC");
        $stmt->execute();
        $result     = $stmt->get_result();
        $categories = [];
        while ($row = $result->fetch_assoc()) {
            $categories[] = $row;
        }
        $stmt->close();
        echo json_encode(['success' => true, 'categories' => $categories]);
        break;

    case 'POST':
        api_require_auth('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $nome = trim($data['name'] ?? '');

        if (empty($nome)) {
            echo json_encode(['success' => false, 'message' => 'Nome é obrigatório.']);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO categorias (nome) VALUES (?)");
        $stmt->bind_param("s", $nome);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Categoria adicionada!', 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao adicionar categoria.']);
        }
        $stmt->close();
        break;

    case 'DELETE':
        api_require_auth('admin');
        $data = json_decode(file_get_contents('php://input'), true);
        $id   = (int)($data['id'] ?? 0);

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID inválido.']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM categorias WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Categoria removida!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao remover categoria.']);
        }
        $stmt->close();
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
?>

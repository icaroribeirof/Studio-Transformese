<?php
// api/servicos.php
include_once '../db_connect.php';
include_once 'api_auth_check.php';

header('Content-Type: application/json');

$session_user = api_require_auth();
$method       = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $conn->prepare("SELECT * FROM servicos ORDER BY nome ASC");
        $stmt->execute();
        $result   = $stmt->get_result();
        $services = [];
        while ($row = $result->fetch_assoc()) {
            $services[] = $row;
        }
        $stmt->close();
        echo json_encode(['success' => true, 'services' => $services]);
        break;

    case 'POST':
        api_require_auth('admin');
        $data        = json_decode(file_get_contents('php://input'), true);
        $nome        = trim($data['name'] ?? '');
        $preco       = (float)($data['price'] ?? 0);
        $descricao   = trim($data['description'] ?? '');

        if (empty($nome) || $preco <= 0) {
            echo json_encode(['success' => false, 'message' => 'Nome e preço são obrigatórios.']);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO servicos (nome, preco, descricao) VALUES (?, ?, ?)");
        $stmt->bind_param("sds", $nome, $preco, $descricao);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Serviço adicionado!', 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao adicionar serviço.']);
        }
        $stmt->close();
        break;

    case 'PUT':
        api_require_auth('admin');
        $data      = json_decode(file_get_contents('php://input'), true);
        $id        = (int)($data['id'] ?? 0);
        $nome      = trim($data['name'] ?? '');
        $preco     = (float)($data['price'] ?? 0);
        $descricao = trim($data['description'] ?? '');

        if (!$id || empty($nome) || $preco <= 0) {
            echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
            exit;
        }

        $stmt = $conn->prepare("UPDATE servicos SET nome = ?, preco = ?, descricao = ? WHERE id = ?");
        $stmt->bind_param("sdsi", $nome, $preco, $descricao, $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Serviço atualizado!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar serviço.']);
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

        $stmt = $conn->prepare("DELETE FROM servicos WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Serviço removido!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao remover serviço.']);
        }
        $stmt->close();
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
?>

<?php
// api/servicos.php
include_once '../db_connect.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT * FROM servicos ORDER BY nome";
        $result = $conn->query($sql);
        $servicos = [];
        while ($row = $result->fetch_assoc()) {
            $servicos[] = $row;
        }
        echo json_encode(['success' => true, 'services' => $servicos]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $nome = $data['name'] ?? ''; // Renomeado para 'nome'
        $preco = $data['price'] ?? 0.00; // Renomeado para 'preco'
        $descricao = $data['description'] ?? ''; // Renomeado para 'descricao'

        if (empty($nome) || !is_numeric($preco) || $preco <= 0) {
            echo json_encode(['success' => false, 'message' => 'Nome e preço válido são obrigatórios.']);
            exit;
        }

        // Verificar se o serviço já existe
        $stmt = $conn->prepare("SELECT id FROM servicos WHERE nome = ?");
        $stmt->bind_param("s", $nome);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Já existe um serviço com este nome.']);
            $stmt->close();
            exit;
        }
        $stmt->close();

        $stmt = $conn->prepare("INSERT INTO servicos (nome, preco, descricao) VALUES (?, ?, ?)");
        $stmt->bind_param("sds", $nome, $preco, $descricao);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Serviço adicionado com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao adicionar serviço: ' . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        $nome = $data['name'] ?? '';
        $preco = $data['price'] ?? 0.00;
        $descricao = $data['description'] ?? '';

        if (empty($id) || empty($nome) || !is_numeric($preco) || $preco <= 0) {
            echo json_encode(['success' => false, 'message' => 'ID, nome e preço válido são obrigatórios.']);
            exit;
        }

        // Verificar se o novo nome já existe para outro serviço
        $stmt = $conn->prepare("SELECT id FROM servicos WHERE nome = ? AND id != ?");
        $stmt->bind_param("si", $nome, $id);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Já existe outro serviço com este nome.']);
            $stmt->close();
            exit;
        }
        $stmt->close();

        $stmt = $conn->prepare("UPDATE servicos SET nome = ?, preco = ?, descricao = ? WHERE id = ?");
        $stmt->bind_param("sdsi", $nome, $preco, $descricao, $id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Serviço atualizado com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar serviço: ' . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;

        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'ID do serviço é obrigatório.']);
            exit;
        }

        // Opcional: Verificar se há agendamentos usando este serviço antes de excluir
        $stmt_check = $conn->prepare("SELECT COUNT(*) FROM agendamentos WHERE nome_servico = (SELECT nome FROM servicos WHERE id = ?)");
        $stmt_check->bind_param("i", $id);
        $stmt_check->execute();
        $stmt_check->bind_result($count);
        $stmt_check->fetch();
        $stmt_check->close();

        if ($count > 0) {
            echo json_encode(['success' => false, 'message' => 'Não é possível excluir o serviço, pois há agendamentos associados a ele.']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM servicos WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Serviço excluído com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao excluir serviço: ' . $stmt->error]);
        }
        $stmt->close();
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
        break;
}

$conn->close();
?>
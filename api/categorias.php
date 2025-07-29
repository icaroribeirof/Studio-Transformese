<?php
// api/categorias.php
include_once '../db_connect.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT * FROM categorias_produto ORDER BY nome";
        $result = $conn->query($sql);
        $categorias = [];
        while ($row = $result->fetch_assoc()) {
            $categorias[] = $row;
        }
        echo json_encode(['success' => true, 'categories' => $categorias]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $nome = $data['name'] ?? ''; // Renomeado para 'nome'

        if (empty($nome)) {
            echo json_encode(['success' => false, 'message' => 'Nome da categoria é obrigatório.']);
            exit;
        }

        // Verificar se a categoria já existe
        $stmt = $conn->prepare("SELECT id FROM categorias_produto WHERE nome = ?");
        $stmt->bind_param("s", $nome);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Já existe uma categoria com este nome.']);
            $stmt->close();
            exit;
        }
        $stmt->close();

        $stmt = $conn->prepare("INSERT INTO categorias_produto (nome) VALUES (?)");
        $stmt->bind_param("s", $nome);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Categoria adicionada com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao adicionar categoria: ' . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        $nome = $data['name'] ?? '';

        if (empty($id) || empty($nome)) {
            echo json_encode(['success' => false, 'message' => 'ID e nome da categoria são obrigatórios.']);
            exit;
        }

        // Verificar se o novo nome já existe para outra categoria
        $stmt = $conn->prepare("SELECT id FROM categorias_produto WHERE nome = ? AND id != ?");
        $stmt->bind_param("si", $nome, $id);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Já existe outra categoria com este nome.']);
            $stmt->close();
            exit;
        }
        $stmt->close();

        $stmt = $conn->prepare("UPDATE categorias_produto SET nome = ? WHERE id = ?");
        $stmt->bind_param("si", $nome, $id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Categoria atualizada com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar categoria: ' . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;

        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'ID da categoria é obrigatório.']);
            exit;
        }

        // Opcional: Verificar se há produtos usando esta categoria antes de excluir
        $stmt_check = $conn->prepare("SELECT COUNT(*) FROM produtos WHERE id_categoria = ?");
        $stmt_check->bind_param("i", $id);
        $stmt_check->execute();
        $stmt_check->bind_result($count);
        $stmt_check->fetch();
        $stmt_check->close();

        if ($count > 0) {
            echo json_encode(['success' => false, 'message' => 'Não é possível excluir a categoria, pois há produtos associados a ela.']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM categorias_produto WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Categoria excluída com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao excluir categoria: ' . $stmt->error]);
        }
        $stmt->close();
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
        break;
}

$conn->close();
?>
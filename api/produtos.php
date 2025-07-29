<?php
// api/produtos.php
include_once '../db_connect.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT p.*, cp.nome AS nome_categoria FROM produtos p LEFT JOIN categorias_produto cp ON p.id_categoria = cp.id ORDER BY p.nome";
        $result = $conn->query($sql);
        $produtos = [];
        while ($row = $result->fetch_assoc()) {
            $produtos[] = $row;
        }
        echo json_encode(['success' => true, 'products' => $produtos]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        $nome = $data['name'] ?? '';
        $nome_categoria = $data['category'] ?? '';
        $preco = $data['price'] ?? 0.00;
        // Garante que $descricao seja uma string, mesmo que o input seja null/undefined
        $descricao = (string)($data['description'] ?? ''); 
        $url_imagem = $data['imageUrl'] ?? null;

        $id_categoria = null;
        if (!empty($nome_categoria)) {
            $stmt_cat = $conn->prepare("SELECT id FROM categorias_produto WHERE nome = ?");
            $stmt_cat->bind_param("s", $nome_categoria);
            $stmt_cat->execute();
            $result_cat = $stmt_cat->get_result();
            if ($row_cat = $result_cat->fetch_assoc()) {
                $id_categoria = $row_cat['id'];
            }
            $stmt_cat->close();
        }

        $stmt = $conn->prepare("INSERT INTO produtos (nome, id_categoria, preco, descricao, url_imagem) VALUES (?, ?, ?, ?, ?)");


        // O 's' para $descricao está correto
        $stmt->bind_param("sidss", $nome, $id_categoria, $preco, $descricao, $url_imagem);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Produto adicionado com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao adicionar produto: ' . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);

        $id = $data['id'] ?? null;
        $nome = $data['name'] ?? '';
        $nome_categoria = $data['category'] ?? '';
        $preco = $data['price'] ?? 0.00;
        // Garante que $descricao seja uma string, mesmo que o input seja null/undefined
        $descricao = (string)($data['description'] ?? ''); 
        $url_imagem = $data['imageUrl'] ?? null;


        $id_categoria = null;
        if (!empty($nome_categoria)) {
            $stmt_cat = $conn->prepare("SELECT id FROM categorias_produto WHERE nome = ?");
            $stmt_cat->bind_param("s", $nome_categoria);
            $stmt_cat->execute();
            $result_cat = $stmt_cat->get_result();
            if ($row_cat = $result_cat->fetch_assoc()) {
                $id_categoria = $row_cat['id'];
            }
            $stmt_cat->close();
        }

        $stmt = $conn->prepare("UPDATE produtos SET nome = ?, id_categoria = ?, preco = ?, descricao = ?, url_imagem = ? WHERE id = ?");
        

        // O 's' para $descricao está correto
        $stmt->bind_param("sidssi", $nome, $id_categoria, $preco, $descricao, $url_imagem, $id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Produto atualizado com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar produto: ' . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;

        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'ID do produto é obrigatório.']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM produtos WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Produto excluído com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao excluir produto: ' . $stmt->error]);
        }
        $stmt->close();
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
        break;
}

$conn->close();
?>
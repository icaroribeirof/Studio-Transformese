<?php
// api/produtos.php
if (session_status() === PHP_SESSION_NONE) session_start();
include_once '../db_connect.php';
include_once 'api_auth_check.php';

header('Content-Type: application/json');

// Caminho absoluto da raiz do projeto (pasta pai de /api/)
define('PROJECT_ROOT', realpath(__DIR__ . '/..'));
define('UPLOAD_DIR',   PROJECT_ROOT . '/uploads/produtos/');
define('UPLOAD_URL',   'uploads/produtos/'); // URL relativa à raiz do projeto

$session_user = api_require_auth();
$method       = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ─── GET ──────────────────────────────────────────────────────────────────
    case 'GET':
        $sql  = "SELECT p.*, c.nome AS nome_categoria
                 FROM produtos p
                 LEFT JOIN categorias c ON p.id_categoria = c.id
                 ORDER BY p.nome ASC";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $result   = $stmt->get_result();
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $img = $row['url_imagem'] ?? '';
            // Aceita apenas caminhos curtos de arquivo (descarta base64 e lixo legado)
            if (!empty($img)
                && strpos($img, 'data:') === false
                && strlen($img) < 300
                && file_exists(PROJECT_ROOT . '/' . $img)
            ) {
                $row['url_imagem'] = $img;
            } else {
                $row['url_imagem'] = null;
            }
            $products[] = $row;
        }
        $stmt->close();
        echo json_encode(['success' => true, 'products' => $products]);
        break;

    // ─── POST (novo produto) ───────────────────────────────────────────────────
    case 'POST':
        api_require_auth('admin');

        $name        = trim($_POST['name']        ?? '');
        $category    = trim($_POST['category']    ?? '');
        $price       = (float)($_POST['price']    ?? 0);
        $description = trim($_POST['description'] ?? '');

        if (empty($name) || empty($category) || $price <= 0) {
            echo json_encode(['success' => false, 'message' => 'Nome, categoria e preço são obrigatórios.']);
            exit;
        }

        $cat_stmt = $conn->prepare("SELECT id FROM categorias WHERE nome = ? LIMIT 1");
        $cat_stmt->bind_param("s", $category);
        $cat_stmt->execute();
        $cat_result = $cat_stmt->get_result()->fetch_assoc();
        $cat_stmt->close();

        if (!$cat_result) {
            echo json_encode(['success' => false, 'message' => 'Categoria não encontrada.']);
            exit;
        }
        $id_categoria = $cat_result['id'];

        $url_imagem = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $result = save_image($_FILES['image']);
            if ($result['error']) {
                echo json_encode(['success' => false, 'message' => $result['error']]);
                exit;
            }
            $url_imagem = $result['path'];
        }

        $stmt = $conn->prepare("INSERT INTO produtos (nome, id_categoria, preco, descricao, url_imagem) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sidss", $name, $id_categoria, $price, $description, $url_imagem);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Produto adicionado com sucesso!', 'url_imagem' => $url_imagem]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao salvar produto: ' . $conn->error]);
        }
        $stmt->close();
        break;

    // ─── PUT (editar produto) ──────────────────────────────────────────────────
    case 'PUT':
        api_require_auth('admin');

        // PUT pode vir como JSON (sem imagem) ou como FormData (com imagem)
        $content_type = $_SERVER['CONTENT_TYPE'] ?? '';

        if (strpos($content_type, 'multipart/form-data') !== false) {
            // Veio com imagem via FormData
            $id          = (int)($_POST['id']          ?? 0);
            $name        = trim($_POST['name']        ?? '');
            $category    = trim($_POST['category']    ?? '');
            $price       = (float)($_POST['price']    ?? 0);
            $description = trim($_POST['description'] ?? '');
        } else {
            // Veio como JSON puro (sem imagem)
            $data        = json_decode(file_get_contents('php://input'), true);
            $id          = (int)($data['id']          ?? 0);
            $name        = trim($data['name']        ?? '');
            $category    = trim($data['category']    ?? '');
            $price       = (float)($data['price']    ?? 0);
            $description = trim($data['description'] ?? '');
        }

        if (!$id || empty($name) || empty($category) || $price <= 0) {
            echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
            exit;
        }

        $cat_stmt = $conn->prepare("SELECT id FROM categorias WHERE nome = ? LIMIT 1");
        $cat_stmt->bind_param("s", $category);
        $cat_stmt->execute();
        $cat_result = $cat_stmt->get_result()->fetch_assoc();
        $cat_stmt->close();

        if (!$cat_result) {
            echo json_encode(['success' => false, 'message' => 'Categoria não encontrada.']);
            exit;
        }
        $id_categoria = $cat_result['id'];

        // Verifica se veio nova imagem
        $nova_imagem = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            // Remove imagem antiga
            $old = $conn->prepare("SELECT url_imagem FROM produtos WHERE id = ?");
            $old->bind_param("i", $id);
            $old->execute();
            $old_row = $old->get_result()->fetch_assoc();
            $old->close();
            if ($old_row && !empty($old_row['url_imagem'])) {
                $old_path = PROJECT_ROOT . '/' . $old_row['url_imagem'];
                if (file_exists($old_path)) unlink($old_path);
            }

            $result = save_image($_FILES['image']);
            if ($result['error']) {
                echo json_encode(['success' => false, 'message' => $result['error']]);
                exit;
            }
            $nova_imagem = $result['path'];

            $stmt = $conn->prepare("UPDATE produtos SET nome=?, id_categoria=?, preco=?, descricao=?, url_imagem=? WHERE id=?");
            $stmt->bind_param("sidssi", $name, $id_categoria, $price, $description, $nova_imagem, $id);
        } else {
            $stmt = $conn->prepare("UPDATE produtos SET nome=?, id_categoria=?, preco=?, descricao=? WHERE id=?");
            $stmt->bind_param("sidsi", $name, $id_categoria, $price, $description, $id);
        }

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Produto atualizado com sucesso!', 'url_imagem' => $nova_imagem]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar: ' . $conn->error]);
        }
        $stmt->close();
        break;

    // ─── DELETE ───────────────────────────────────────────────────────────────
    case 'DELETE':
        api_require_auth('admin');

        $data = json_decode(file_get_contents('php://input'), true);
        $id   = (int)($data['id'] ?? 0);

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID inválido.']);
            exit;
        }

        $img_stmt = $conn->prepare("SELECT url_imagem FROM produtos WHERE id = ?");
        $img_stmt->bind_param("i", $id);
        $img_stmt->execute();
        $img_row = $img_stmt->get_result()->fetch_assoc();
        $img_stmt->close();

        if ($img_row && !empty($img_row['url_imagem'])) {
            $path = PROJECT_ROOT . '/' . $img_row['url_imagem'];
            if (file_exists($path)) unlink($path);
        }

        $stmt = $conn->prepare("DELETE FROM produtos WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Produto removido com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao remover produto.']);
        }
        $stmt->close();
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}

// ─── FUNÇÃO DE UPLOAD ─────────────────────────────────────────────────────────
function save_image(array $file): array {
    $allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $max_size      = 5 * 1024 * 1024; // 5MB

    // Valida pelo mime type real do arquivo, não apenas pelo declarado pelo browser
    $finfo     = finfo_open(FILEINFO_MIME_TYPE);
    $mime_real = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime_real, $allowed_types)) {
        return ['error' => "Tipo de imagem inválido ($mime_real). Use JPG, PNG, WEBP ou GIF.", 'path' => null];
    }
    if ($file['size'] > $max_size) {
        return ['error' => 'Imagem muito grande. Máximo 5MB.', 'path' => null];
    }

    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }

    // Usa extensão baseada no mime type real (não no nome do arquivo)
    $ext_map  = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    $ext      = $ext_map[$mime_real];
    $filename = uniqid('prod_', true) . '.' . $ext;
    $dest     = UPLOAD_DIR . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        return ['error' => 'Falha ao mover o arquivo. Verifique as permissões da pasta uploads/.', 'path' => null];
    }

    return ['error' => null, 'path' => UPLOAD_URL . $filename];
}
?>

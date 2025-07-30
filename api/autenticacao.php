<?php
// api/autenticacao.php
include_once '../db_connect.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';

        if ($action === 'login') {
            $email = $data['email'] ?? '';
            $senha = $data['password'] ?? ''; // Renomeado para 'senha'
            $funcao = $data['role'] ?? ''; // Renomeado para 'funcao'

            if (empty($email) || empty($senha) || empty($funcao)) {
                echo json_encode(['success' => false, 'message' => 'Email, senha e função são obrigatórios.']);
                exit;
            }

            $stmt = $conn->prepare("SELECT id, nome, email, senha, funcao FROM usuarios WHERE email = ? AND funcao = ?");
            $stmt->bind_param("ss", $email, $funcao);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $usuario = $result->fetch_assoc();
                // Em um ambiente real, você usaria password_verify()
                if ($senha === $usuario['senha']) { // Apenas para demonstração, use password_verify() em produção
                    $_SESSION['loggedInUser'] = [
                        'id' => $usuario['id'],
                        'nome' => $usuario['nome'],
                        'email' => $usuario['email'],
                        'funcao' => $usuario['funcao']
                    ];
                    echo json_encode(['success' => true, 'user' => ['id' => $usuario['id'], 'name' => $usuario['nome'], 'email' => $usuario['email'], 'role' => $usuario['funcao']]]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Senha inválida.']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Usuário não encontrado ou função incorreta.']);
            }
            $stmt->close();

        } elseif ($action === 'register') {
            $nome = $data['name'] ?? ''; // Renomeado para 'nome'
            $email = $data['email'] ?? '';
            $senha = $data['password'] ?? ''; // Renomeado para 'senha'
            $confirmarSenha = $data['confirmPassword'] ?? ''; // Renomeado para 'confirmarSenha'

            if (empty($nome) || empty($email) || empty($senha) || empty($confirmarSenha)) {
                echo json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios.']);
                exit;
            }
            if ($senha !== $confirmarSenha) {
                echo json_encode(['success' => false, 'message' => 'As senhas não coincidem.']);
                exit;
            }
            if (strlen($senha) < 6) {
                echo json_encode(['success' => false, 'message' => 'A senha deve ter no mínimo 6 caracteres.']);
                exit;
            }

            // Verificar se o email já existe
            $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $stmt->store_result();
            if ($stmt->num_rows > 0) {
                echo json_encode(['success' => false, 'message' => 'Este email já está cadastrado.']);
                $stmt->close();
                exit;
            }
            $stmt->close();

            // Inserir novo cliente
            // Em um ambiente real, você usaria password_hash()
            $senha_hash = $senha; // Apenas para demonstração, use password_hash() em produção
            $funcao = 'cliente';

            $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, funcao) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $nome, $email, $senha_hash, $funcao);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Cadastro realizado com sucesso!']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar: ' . $stmt->error]);
            }
            $stmt->close();

        } elseif ($action === 'add_admin' || $action === 'update_admin') {
            $id = $data['id'] ?? null;
            $nome = $data['name'] ?? '';
            $email = $data['email'] ?? '';
            $senha = $data['password'] ?? '';

            if (empty($nome) || empty($email) || empty($senha)) {
                echo json_encode(['success' => false, 'message' => 'Nome, email e senha são obrigatórios.']);
                exit;
            }
            if (strlen($senha) < 6) {
                echo json_encode(['success' => false, 'message' => 'A senha deve ter no mínimo 6 caracteres.']);
                exit;
            }

            if ($action === 'add_admin') {
                // Verificar se o email já existe
                $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
                $stmt->bind_param("s", $email);
                $stmt->execute();
                $stmt->store_result();
                if ($stmt->num_rows > 0) {
                    echo json_encode(['success' => false, 'message' => 'Já existe um administrador com este email.']);
                    $stmt->close();
                    exit;
                }
                $stmt->close();

                $funcao = 'admin';
                $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, funcao) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("ssss", $nome, $email, $senha, $funcao);
                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Administrador adicionado com sucesso!']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Erro ao adicionar administrador: ' . $stmt->error]);
                }
            } elseif ($action === 'update_admin') {
                if (empty($id)) {
                    echo json_encode(['success' => false, 'message' => 'ID do administrador é obrigatório para atualização.']);
                    exit;
                }
                // Verificar se o novo email já existe para outro usuário
                $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
                $stmt->bind_param("si", $email, $id);
                $stmt->execute();
                $stmt->store_result();
                if ($stmt->num_rows > 0) {
                    echo json_encode(['success' => false, 'message' => 'Já existe outro usuário com este email.']);
                    $stmt->close();
                    exit;
                }
                $stmt->close();

                $stmt = $conn->prepare("UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ? AND funcao = 'admin'");
                $stmt->bind_param("sssi", $nome, $email, $senha, $id);
                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Administrador atualizado com sucesso!']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar administrador: ' . $stmt->error]);
                }
            }
            $stmt->close();

        } elseif ($action === 'delete_admin') {
            $id = $data['id'] ?? null;
            if (empty($id)) {
                echo json_encode(['success' => false, 'message' => 'ID do administrador é obrigatório para exclusão.']);
                exit;
            }

            // Impedir exclusão do último admin
            $stmt = $conn->prepare("SELECT COUNT(*) FROM usuarios WHERE funcao = 'admin'");
            $stmt->execute();
            $stmt->bind_result($count_admins);
            $stmt->fetch();
            $stmt->close();

            if ($count_admins <= 1) {
                echo json_encode(['success' => false, 'message' => 'Não é possível excluir o único administrador.']);
                exit;
            }

            $stmt = $conn->prepare("DELETE FROM usuarios WHERE id = ? AND funcao = 'admin'");
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Administrador excluído com sucesso!']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Erro ao excluir administrador: ' . $stmt->error]);
            }
            $stmt->close();
        }
        break;

    case 'GET':
        $action = $_GET['action'] ?? '';
        if ($action === 'get_admins') {
            $sql = "SELECT id, nome, email, funcao FROM usuarios WHERE funcao = 'admin' ORDER BY nome";
            $result = $conn->query($sql);
            $admins = [];
            while ($row = $result->fetch_assoc()) {
                $admins[] = $row;
            }
            echo json_encode(['success' => true, 'admins' => $admins]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Ação GET inválida.']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
        break;
}

$conn->close();
?>
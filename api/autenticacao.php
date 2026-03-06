<?php
// api/autenticacao.php
// IMPORTANTE: session_start() deve ser a primeira coisa antes de qualquer header

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include_once '../db_connect.php';

// Bloqueia cache para evitar que o browser cache respostas de auth
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate');

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
    exit;
}

$data   = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

// ─── LOGIN ────────────────────────────────────────────────────────────────────
if ($action === 'login') {
    $email    = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $role     = $data['role'] ?? 'cliente';

    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Email e senha são obrigatórios.']);
        exit;
    }

    // Busca usuário apenas pelo email (não filtra por funcao ainda — verifica depois)
    $sql  = "SELECT id, nome, email, senha, funcao FROM usuarios WHERE email = ? LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user   = $result->fetch_assoc();
    $stmt->close();

    if (!$user) {
        // Mensagem genérica para não revelar se o email existe
        echo json_encode(['success' => false, 'message' => 'Email ou senha incorretos.']);
        exit;
    }

    // Verifica senha
    $password_valid = password_verify($password, $user['senha']);

    // Fallback para MD5 legado (migração gradual)
    if (!$password_valid && strlen($user['senha']) === 32) {
        $password_valid = (md5($password) === $user['senha']);
        if ($password_valid) {
            // Atualiza para bcrypt automaticamente
            $new_hash = password_hash($password, PASSWORD_BCRYPT);
            $upd = $conn->prepare("UPDATE usuarios SET senha = ? WHERE id = ?");
            $upd->bind_param("si", $new_hash, $user['id']);
            $upd->execute();
            $upd->close();
        }
    }

    if (!$password_valid) {
        echo json_encode(['success' => false, 'message' => 'Email ou senha incorretos.']);
        exit;
    }

    // Verifica se o papel (role) bate com o que o usuário selecionou na tela
    if ($user['funcao'] !== $role) {
        echo json_encode([
            'success' => false,
            'message' => "Esta conta não tem acesso como '{$role}'. Selecione o perfil correto."
        ]);
        exit;
    }

    // Regenera ID de sessão (previne session fixation)
    // DEVE ser chamado antes de qualquer output de dados sensíveis
    session_regenerate_id(true);

    // Salva dados na sessão server-side
    $_SESSION['user_id']    = $user['id'];
    $_SESSION['user_name']  = $user['nome'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['role']       = $user['funcao'];

    echo json_encode([
        'success' => true,
        'user' => [
            'id'   => $user['id'],
            'name' => $user['nome'],
            'role' => $user['funcao'],
        ]
    ]);
    exit;
}

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
if ($action === 'register') {
    $name            = trim($data['name'] ?? '');
    $email           = trim($data['email'] ?? '');
    $password        = $data['password'] ?? '';
    $confirmPassword = $data['confirmPassword'] ?? '';

    if (empty($name) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios.']);
        exit;
    }

    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'message' => 'A senha deve ter pelo menos 6 caracteres.']);
        exit;
    }

    if ($password !== $confirmPassword) {
        echo json_encode(['success' => false, 'message' => 'As senhas não coincidem.']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Email inválido.']);
        exit;
    }

    $check = $conn->prepare("SELECT id FROM usuarios WHERE email = ? LIMIT 1");
    $check->bind_param("s", $email);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Este email já está cadastrado.']);
        $check->close();
        exit;
    }
    $check->close();

    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $role = 'cliente';

    $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, funcao) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $name, $email, $hashed_password, $role);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Cadastro realizado com sucesso! Faça o login.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao cadastrar. Tente novamente.']);
    }
    $stmt->close();
    exit;
}

echo json_encode(['success' => false, 'message' => 'Ação inválida.']);
?>

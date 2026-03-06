<?php
// setup.php
// Execute UMA VEZ após importar o banco de dados para criar o admin padrão.
// APAGUE este arquivo do servidor após usar!

require_once 'db_connect.php';

// Impede execução se já existir um admin
$check = $conn->prepare("SELECT id FROM usuarios WHERE funcao = 'admin' LIMIT 1");
$check->execute();
$check->store_result();
$admin_exists = $check->num_rows > 0;
$check->close();

$message = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$admin_exists) {
    $nome     = trim($_POST['nome'] ?? '');
    $email    = trim($_POST['email'] ?? '');
    $senha    = $_POST['senha'] ?? '';
    $confirma = $_POST['confirma'] ?? '';

    if (empty($nome) || empty($email) || empty($senha)) {
        $message = 'Preencha todos os campos.';
    } elseif ($senha !== $confirma) {
        $message = 'As senhas não coincidem.';
    } elseif (strlen($senha) < 6) {
        $message = 'A senha deve ter pelo menos 6 caracteres.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = 'Email inválido.';
    } else {
        $hash = password_hash($senha, PASSWORD_BCRYPT);
        $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, funcao) VALUES (?, ?, ?, 'admin')");
        $stmt->bind_param("sss", $nome, $email, $hash);
        if ($stmt->execute()) {
            $success = true;
            $message = "Admin criado com sucesso! Apague o arquivo setup.php agora.";
        } else {
            $message = 'Erro ao criar admin: ' . $conn->error;
        }
        $stmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="ico/icone.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="ico/icone.png">
    <link rel="apple-touch-icon" sizes="180x180" href="ico/icone-180.png">
    <title>Setup - Studio Transformese</title>
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/login.css">
    <style>
        .alert { padding: .9rem 1.2rem; border-radius: 8px; margin-bottom: 1rem; font-size: .9rem; }
        .alert-success { background: #DCFCE7; color: #15803D; border: 1px solid #BBF7D0; }
        .alert-danger  { background: #FEE2E2; color: #B91C1C; border: 1px solid #FECACA; }
        .alert-warning { background: #FEF9C3; color: #854D0E; border: 1px solid #FDE047; }
        code { background: #F3F4F6; padding: .1rem .4rem; border-radius: 4px; font-size: .85rem; }
    </style>
</head>
<body>
<div class="login-container">
    <div class="login-box">
        <h1>⚙️ Setup Inicial</h1>
        <p>Crie a conta de administrador do sistema</p>

        <?php if ($admin_exists): ?>
            <div class="alert alert-warning">
                <strong>Admin já existe.</strong> Este script não pode ser executado novamente.<br>
                <a href="index.php">← Ir para o login</a>
            </div>
        <?php elseif ($success): ?>
            <div class="alert alert-success">
                ✅ <?= htmlspecialchars($message) ?><br><br>
                <strong>⚠️ Apague o arquivo <code>setup.php</code> agora!</strong><br><br>
                <a href="index.php">← Ir para o login</a>
            </div>
        <?php else: ?>
            <?php if ($message): ?>
                <div class="alert alert-danger"><?= htmlspecialchars($message) ?></div>
            <?php endif; ?>

            <div class="alert alert-warning">
                ⚠️ Execute este script <strong>apenas uma vez</strong> e apague-o do servidor após uso.
            </div>

            <form method="POST">
                <div class="form-group">
                    <label for="nome">Nome do Admin</label>
                    <input type="text" name="nome" id="nome" required value="<?= htmlspecialchars($_POST['nome'] ?? '') ?>">
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" name="email" id="email" required value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
                </div>
                <div class="form-group">
                    <label for="senha">Senha</label>
                    <input type="password" name="senha" id="senha" required placeholder="Mínimo 6 caracteres">
                </div>
                <div class="form-group">
                    <label for="confirma">Confirmar Senha</label>
                    <input type="password" name="confirma" id="confirma" required>
                </div>
                <button type="submit" class="btn-login">Criar Admin</button>
            </form>
        <?php endif; ?>
    </div>
</div>
</body>
</html>

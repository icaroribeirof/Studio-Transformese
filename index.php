<?php
require_once 'db_connect.php';
if (isset($_SESSION['user_id'])) {
    header('Location: ' . ($_SESSION['role'] === 'admin' ? 'admin.php' : 'cliente.php'));
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="ico/icone.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="ico/icone.png">
    <link rel="apple-touch-icon" sizes="180x180" href="ico/icone-180.png">
    <title>Studio Transformese — Login</title>
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/login.css">
</head>
<body>
<div class="login-page">

    <!-- Painel de branding -->
    <div class="login-branding">
        <img src="ico/icone.png" alt="Studio Transformese" class="branding-logo-img">
        <h1 class="branding-title">Studio Transformese</h1>
        <p class="branding-subtitle">Especialistas em tranças e cuidados capilares afro</p>
        <div class="branding-features">
            <div class="branding-feature">
                <div class="branding-feature-icon">📅</div>
                Agendamentos online
            </div>
            <div class="branding-feature">
                <div class="branding-feature-icon">💜</div>
                Serviços personalizados
            </div>
            <div class="branding-feature">
                <div class="branding-feature-icon">🛒</div>
                Produtos exclusivos
            </div>
        </div>
    </div>

    <!-- Painel do formulário -->
    <div class="login-form-panel">
        <button class="login-theme-toggle" id="themeToggle" title="Alternar tema" aria-label="Alternar tema claro/escuro">🌙</button>

        <div class="login-box">
            <div class="login-box-header">
                <h2>Bem-vinda de volta 👋</h2>
                <p>Entre com sua conta para continuar</p>
            </div>

            <div class="role-selector">
                <button class="role-button active" id="clienteBtn">👤 Cliente</button>
                <button class="role-button" id="adminBtn">⚙️ Admin</button>
            </div>

            <form id="loginForm">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" placeholder="seu@email.com" required autocomplete="email">
                </div>
                <div class="form-group">
                    <label for="password">Senha</label>
                    <input type="password" id="password" placeholder="••••••••" required autocomplete="current-password">
                </div>
                <button type="submit" class="btn-login" id="submitLoginBtn">Entrar como Cliente</button>
            </form>

            <div class="login-footer" id="cadastroButtonContainer">
                Não tem conta? <a href="cadcliente.php">Cadastre-se grátis</a>
            </div>
        </div>
    </div>
</div>
<script src="js/theme.js"></script>
<script src="js/login.js"></script>
</body>
</html>

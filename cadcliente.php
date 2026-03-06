<?php
require_once 'db_connect.php';
if (isset($_SESSION['user_id'])) { header('Location: cliente.php'); exit; }
?>
<!DOCTYPE html>
<html lang="pt-BR" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="ico/icone.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="ico/icone.png">
    <link rel="apple-touch-icon" sizes="180x180" href="ico/icone-180.png">
    <title>Cadastro — Studio Transformese</title>
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/login.css">
</head>
<body>
<div class="login-page">
    <div class="login-branding">
        <img src="ico/icone.png" alt="Studio Transformese" class="branding-logo-img">
        <h1 class="branding-title">Studio Transformese</h1>
        <p class="branding-subtitle">Crie sua conta e comece a agendar seus atendimentos</p>
    </div>

    <div class="login-form-panel">
        <button class="login-theme-toggle" id="themeToggle" title="Alternar tema" aria-label="Alternar tema">🌙</button>

        <div class="login-box">
            <div class="login-box-header">
                <h2>Crie sua conta ✨</h2>
                <p>Preencha seus dados para se cadastrar</p>
            </div>

            <form id="cadastroClienteForm">
                <div class="form-group">
                    <label for="cadNome">Nome completo</label>
                    <input type="text" id="cadNome" placeholder="Seu nome" required autocomplete="name">
                </div>
                <div class="form-group">
                    <label for="cadEmail">Email</label>
                    <input type="email" id="cadEmail" placeholder="seu@email.com" required autocomplete="email">
                </div>
                <div class="form-group">
                    <label for="cadPassword">Senha</label>
                    <input type="password" id="cadPassword" placeholder="Mínimo 6 caracteres" required autocomplete="new-password">
                </div>
                <div class="form-group">
                    <label for="cadConfirmPassword">Confirmar senha</label>
                    <input type="password" id="cadConfirmPassword" placeholder="Repita a senha" required autocomplete="new-password">
                </div>
                <button type="submit" class="btn-login">Criar conta</button>
            </form>

            <div class="login-footer">
                Já tem conta? <a href="index.php">Faça login</a>
            </div>
        </div>
    </div>
</div>
<script src="js/theme.js"></script>
<script src="js/login.js"></script>
</body>
</html>

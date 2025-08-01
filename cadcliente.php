<?php
session_start(); // Inicia a sessão para que o script.js possa usar sessionStorage
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro de Cliente - Studio Transformese</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/cadcliente.css">
</head>
<body>
    <div class="cadastro-container">
        <div class="cadastro-box">
            <div class="logo-container">
                <!-- Substitua '6.png' pela sua imagem de logo, se houver -->
                <!-- <img src="6.png" alt="Logo Studio Transformese" class="login-logo"> -->
            </div>
            <h2>Crie sua Conta de Cliente</h2>
            <form id="cadastroClienteForm">
                <div class="form-group">
                    <label for="cadNome">Nome Completo</label>
                    <input type="text" id="cadNome" placeholder="Seu nome" required>
                </div>
                <div class="form-group">
                    <label for="cadEmail">Email</label>
                    <input type="email" id="cadEmail" placeholder="seu@email.com" required>
                </div>
                <div class="form-group">
                    <label for="cadPassword">Senha (mín. 6 caracteres)</label>
                    <input type="password" id="cadPassword" placeholder="********" minlength="6" required>
                </div>
                <div class="form-group">
                    <label for="cadConfirmPassword">Confirme a Senha</label>
                    <input type="password" id="cadConfirmPassword" placeholder="********" required>
                </div>
                <button type="submit" class="btn-primary" id="submitCadastroBtn">Cadastrar</button>
            </form>
            <button class="btn-link" onclick="window.location.href='index.php'">Já tenho conta. Fazer login.</button>
        </div>
    </div>
    <script src="js/script.js"></script>
</body>
</html>
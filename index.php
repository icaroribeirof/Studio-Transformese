<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Studio Transformese</title>
    <link rel="stylesheet" href="css/style.css">
</head>

<body>
    <div class="login-container">
        <div class="login-box">
            <h1>Studio Transformese</h1>
            <p>Faça login para acessar sua conta</p>

            <div class="role-selector">
                <button class="role-button active" id="clienteBtn">Cliente</button>
                <button class="role-button" id="adminBtn">Admin
                </button>
            </div>

            <form id="loginForm">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" placeholder="seu@email.com" required>
                </div>
                <div class="form-group">
                    <label for="password">Senha</label>
                    <input type="password" id="password" placeholder="********" required>
                </div>
                <button type="submit" class="btn-login" id="submitLoginBtn">Entrar como Cliente</button>
            </form>
            <!-- Novo botão de registro -->
            <div id="cadastroButtonContainer">
                <button class="btn-link" onclick="window.location.href='cadcliente.html'">Não tem conta?
                    Cadastre-se</button>
            </div>

        </div>
    </div>
    <script src="js/script.js"></script>
</body>

</html>
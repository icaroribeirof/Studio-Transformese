<?php
session_start();
if (!isset($_SESSION['loggedInUser']) || $_SESSION['loggedInUser']['funcao'] !== 'admin') { // 'funcao' em vez de 'role'
    header('Location: index.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurações - Studio Transformese</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/configadmin.css">
</head>
<body>
    <header class="dashboard-header admin-header">
        <div class="header-content">
            <h1 id="adminHeaderTitle">Configurações Admin</h1>
            <div class="header-actions">
                <button class="btn-back" onclick="window.location.href='admin.php'">
                Voltar
                </button>
                <button class="btn-logout" onclick="logout()">Sair</button>
            </div>
        </div>
    </header>

    <div class="config-container">
        <nav class="config-nav">
            <button class="nav-button active" id="adminUsersTab">Administradores</button>
            <button class="nav-button" id="productCategoriesTab">Categorias de Produtos</button>
            <button class="nav-button" id="servicesTab">Serviços</button>
        </nav>

        <div class="config-content">
            <div id="adminUsersSection" class="tab-section active">
                <h2>Gerenciar Administradores</h2>
                <form id="adminUserForm" class="add-form">
                    <input type="hidden" id="adminUserId">
                    <div class="form-group">
                        <label for="adminUserName">Nome do Administrador</label> <input type="text" id="adminUserName" placeholder="Nome Completo" required>
                    </div>
                    <div class="form-group">
                        <label for="adminUserEmail">Email do Administrador</label>
                        <input type="email" id="adminUserEmail" placeholder="admin@email.com" required>
                    </div>
                    <div class="form-group">
                        <label for="adminUserPassword">Senha (mín. 6 caracteres)</label>
                        <input type="password" id="adminUserPassword" placeholder="********" minlength="6" required>
                    </div>
                    <button type="submit" class="btn-primary" id="saveAdminUserBtn">Adicionar Administrador</button>
                </form>
                <div class="list-container">
                    <h3>Administradores Cadastrados</h3>
                    <ul id="adminUsersList" class="item-list">
                    </ul>
                </div>
            </div>

            <div id="productCategoriesSection" class="tab-section hidden">
                <h2>Gerenciar Categorias de Produtos</h2>
                <form id="productCategoryForm" class="add-form">
                    <input type="hidden" id="productCategoryId">
                    <div class="form-group">
                        <label for="productCategoryName">Nome da Categoria</label>
                        <input type="text" id="productCategoryName" placeholder="Ex: Óleos Capilares" required>
                    </div>
                    <button type="submit" class="btn-primary" id="saveProductCategoryBtn">Adicionar Categoria</button>
                </form>
                <div class="list-container">
                    <h3>Categorias Cadastradas</h3>
                    <ul id="productCategoriesList" class="item-list">
                    </ul>
                </div>
            </div>

            <div id="servicesSection" class="tab-section hidden">
                <h2>Gerenciar Serviços</h2>
                <form id="serviceForm" class="add-form">
                    <input type="hidden" id="serviceId">
                    <div class="form-group">
                        <label for="serviceName">Nome do Serviço</label>
                        <input type="text" id="serviceName" placeholder="Ex: Trança Nagô" required>
                    </div>
                    <div class="form-group">
                        <label for="servicePrice">Preço (R$)</label>
                        <input type="number" id="servicePrice" step="0.01" value="0.00" required>
                    </div>
                    <div class="form-group full-width">
                        <label for="serviceDescription">Descrição do Serviço</label>
                        <textarea id="serviceDescription" placeholder="Detalhes do serviço..."></textarea>
                    </div>
                    <button type="submit" class="btn-primary" id="saveServiceBtn">Adicionar Serviço</button>
                </form>
                <div class="list-container">
                    <h3>Serviços Cadastrados</h3>
                    <ul id="servicesList" class="item-list">
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <script src="js/script.js"></script>
    <script src="js/configadmin.js"></script>
</body>
</html>
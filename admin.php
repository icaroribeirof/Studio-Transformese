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
    <title>Painel Administrativo - Studio Transformese</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header class="dashboard-header admin-header">
        <div class="header-content">
            <h1 id="adminWelcomeMessage">Bem-vinda, Admin!</h1>
            <div class="header-actions">
                <button class="btn-settings" onclick="window.location.href='configadmin.php'">
                    <img src="img/config.png" alt="Configurações">
                </button>
                <button class="btn-logout" onclick="logout()">Sair</button>
            </div>
        </div>
    </header>

    <div class="dashboard-container">
        <div class="admin-summary">
            <div class="summary-card">
                <h3>Total de Agendamentos</h3>
                <p id="totalAppointments">0</p>
            </div>
            <div class="summary-card">
                <h3>Agendamentos Pendentes</h3>
                <p id="pendingAppointments">0</p>
            </div>
            <div class="summary-card">
                <h3>Produtos Anunciados</h3>
                <p id="totalProducts">0</p>
            </div>
            <div class="summary-card">
                <h3>Valor Total - Produtos</h3>
                <p id="totalRevenue">R$ 0.00</p>
            </div>
        </div>

        <nav class="dashboard-nav">
            <button class="nav-button active" id="adminAgendamentosTab">Agendamentos</button>
            <button class="nav-button" id="adminProdutosTab">Produtos</button>
        </nav>

        <div class="dashboard-content">
            <div id="adminAgendamentosSection" class="tab-section active">
                <h2>Gerenciar Agendamentos</h2>
                <div id="adminAppointmentsList" class="appointments-list">
                    </div>
            </div>

            <div id="adminProdutosSection" class="tab-section hidden">
                <h2>Gerenciar Produtos</h2>
                <button class="btn-add-product" id="openAddProductModal">+ Novo Produto</button>
                <div class="product-list" id="adminProductList">
                    </div>
            </div>
        </div>
    </div>

    <div id="addProductModal" class="modal">
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2>Adicionar Novo Produto</h2>
            <p>Preencha as informações do produto</p>
            <form id="productForm">
                <input type="hidden" id="productId">
                <div class="form-group">
                    <label for="productName">Nome do Produto</label>
                    <input type="text" id="productName" placeholder="Ex: Óleo de Coco Natural" required>
                </div>
                <div class="form-group">
                    <label for="productCategory">Categoria</label>
                    <select id="productCategory" required>
                        <option value="">Selecione uma categoria</option>
                        </select>
                </div>
                <div class="form-group">
                    <label for="productPrice">Preço (R$)</label>
                    <input type="number" id="productPrice" step="0.01" value="0.00" required>
                </div>
                <div class="form-group">
                    <label for="productImage">Imagem do Produto</label>
                    <input type="file" id="productImage" accept="image/*">
                    <img id="productImagePreview" alt="Pré-visualização da Imagem" style="max-width: 100px; max-height: 100px; margin-top: 10px; border-radius: 5px;">
                </div>
                <div class="form-group full-width">
                    <label for="productDescription">Descrição</label>
                    <textarea id="productDescription" placeholder="Descreva o produto..."></textarea>
                </div>
                <button type="submit" class="btn-primary" id="saveProductBtn">Adicionar Produto</button>
            </form>
        </div>
    </div>

    <script src="js/script.js"></script>
</body>
</html>
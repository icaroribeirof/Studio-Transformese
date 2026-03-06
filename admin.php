<?php
require_once 'db_connect.php';
require_once 'auth_check.php';
check_auth('admin');
$admin_name = htmlspecialchars($_SESSION['user_name']);
?>
<!DOCTYPE html>
<html lang="pt-BR" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin — Studio Transformese</title>
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/dashboard.css">
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
<header class="dashboard-header">
    <div class="header-content">
        <div class="header-brand">
            <span class="header-brand-icon">✂️</span>
            Studio Transformese
        </div>
        <div class="header-greeting">
            Olá, <strong><?= $admin_name ?></strong> — Painel Admin
        </div>
        <div class="header-actions">
            <a href="configadmin.php" class="btn-header-link">⚙️ Configurações</a>
            <button class="theme-toggle" id="themeToggle" title="Alternar tema" aria-label="Alternar tema">🌙</button>
            <button class="btn-logout" onclick="logout()">Sair</button>
        </div>
    </div>
</header>

<div class="dashboard-container">

    <!-- Métricas -->
    <div class="summary-cards">
        <div class="metric-card">
            <div class="metric-icon">📅</div>
            <div class="metric-label">Total de Agendamentos</div>
            <div class="metric-value" id="totalAppointments">—</div>
        </div>
        <div class="metric-card">
            <div class="metric-icon">⏳</div>
            <div class="metric-label">Pendentes</div>
            <div class="metric-value" id="pendingAppointments">—</div>
        </div>
        <div class="metric-card">
            <div class="metric-icon">📦</div>
            <div class="metric-label">Produtos Cadastrados</div>
            <div class="metric-value" id="totalProducts">—</div>
        </div>
        <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-label">Receita Realizada</div>
            <div class="metric-value brand" id="totalRevenue">—</div>
        </div>
    </div>

    <!-- Navegação -->
    <nav class="dashboard-nav">
        <button class="nav-button active" id="adminAgendamentosTab">📅 Agendamentos</button>
        <button class="nav-button" id="adminProdutosTab">📦 Produtos</button>
        <button class="nav-button" id="adminServicosTab">✂️ Serviços</button>
    </nav>

    <!-- Agendamentos -->
    <div id="adminAgendamentosSection" class="tab-section">
        <div class="section-header">
            <div>
                <div class="section-title">Todos os Agendamentos</div>
                <div class="section-subtitle">Gerencie e atualize o status dos atendimentos</div>
            </div>
        </div>
        <div id="adminAppointmentsList"></div>
    </div>

    <!-- Produtos -->
    <div id="adminProdutosSection" class="tab-section hidden">
        <div class="section-header">
            <div>
                <div class="section-title">Produtos Cadastrados</div>
                <div class="section-subtitle">Gerencie o catálogo de produtos</div>
            </div>
            <button class="btn-primary" id="openAddProductModal">+ Novo Produto</button>
        </div>
        <div id="adminProductList"></div>
    </div>

    <!-- Serviços -->
    <div id="adminServicosSection" class="tab-section hidden">
        <div class="section-header">
            <div>
                <div class="section-title">Serviços Cadastrados</div>
                <div class="section-subtitle">Gerencie os serviços disponíveis para agendamento</div>
            </div>
            <button class="btn-primary" id="openAddServiceModal">+ Novo Serviço</button>
        </div>
        <div id="adminServiceList"></div>
    </div>
</div>

<!-- Modal Produto -->
<div id="addProductModal" class="modal" style="display:none;">
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="productModalTitle">Novo Produto</h2>
            <button class="close-button" id="closeProductModal" aria-label="Fechar">✕</button>
        </div>
        <div class="modal-body">
            <form id="productForm">
                <input type="hidden" id="productId">
                <div class="form-group">
                    <label for="productName">Nome do Produto</label>
                    <input type="text" id="productName" placeholder="Ex: Shampoo hidratante" required>
                </div>
                <div class="form-group">
                    <label for="productCategory">Categoria</label>
                    <select id="productCategory" required>
                        <option value="">Selecione uma categoria</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="productPrice">Preço (R$)</label>
                    <input type="number" id="productPrice" step="0.01" min="0.01" placeholder="0,00" required>
                </div>
                <div class="form-group">
                    <label for="productDescription">Descrição</label>
                    <textarea id="productDescription" placeholder="Descreva o produto..." required></textarea>
                </div>
                <div class="form-group">
                    <label for="productImage">Imagem (JPG, PNG, WEBP — máx. 5MB)</label>
                    <input type="file" id="productImage" accept="image/*">
                    <img id="productImagePreview" src="" alt="Preview" style="display:none;">
                </div>
                <button type="submit" class="btn-primary" id="saveProductBtn" style="width:100%">Adicionar Produto</button>
            </form>
        </div>
    </div>
</div>

<!-- Modal Serviço -->
<div id="addServiceModal" class="modal" style="display:none;">
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="serviceModalTitle">Novo Serviço</h2>
            <button class="close-button" id="closeServiceModal" aria-label="Fechar">✕</button>
        </div>
        <div class="modal-body">
            <form id="serviceForm">
                <input type="hidden" id="serviceId">
                <div class="form-group">
                    <label for="serviceName">Nome do Serviço</label>
                    <input type="text" id="serviceName" placeholder="Ex: Box Braids" required>
                </div>
                <div class="form-group">
                    <label for="servicePrice">Preço (R$)</label>
                    <input type="number" id="servicePrice" step="0.01" min="0.01" placeholder="0,00" required>
                </div>
                <div class="form-group">
                    <label for="serviceDescription">Descrição</label>
                    <textarea id="serviceDescription" placeholder="Descreva o serviço..."></textarea>
                </div>
                <button type="submit" class="btn-primary" id="saveServiceBtn" style="width:100%">Adicionar Serviço</button>
            </form>
        </div>
    </div>
</div>

<script>
window.SESSION_USER = {
    id:   <?= (int)$_SESSION['user_id'] ?>,
    name: <?= json_encode($_SESSION['user_name']) ?>,
    role: 'admin'
};
</script>
<script src="js/theme.js"></script>
<script src="js/common.js"></script>
<script src="js/admin.js"></script>
</body>
</html>

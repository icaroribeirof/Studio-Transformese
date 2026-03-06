<?php
require_once 'db_connect.php';
require_once 'auth_check.php';
check_auth('admin');
?>
<!DOCTYPE html>
<html lang="pt-BR" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="ico/icone.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="ico/icone.png">
    <link rel="apple-touch-icon" sizes="180x180" href="ico/icone-180.png">
    <title>Configurações — Studio Transformese</title>
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/dashboard.css">
    <link rel="stylesheet" href="css/configadmin.css">
</head>
<body>
<header class="dashboard-header">
    <div class="header-content">
        <div class="header-brand">
            <img src="ico/icone.png" alt="Studio Transformese" class="header-brand-icon-img">
            Studio Transformese
        </div>
        <div class="header-actions">
            <a href="admin.php" class="btn-header-link">← Voltar ao Painel</a>
            <button class="theme-toggle" id="themeToggle" title="Alternar tema" aria-label="Alternar tema">🌙</button>
            <button class="btn-logout" onclick="logout()">Sair</button>
        </div>
    </div>
</header>

<div class="dashboard-container">
    <nav class="dashboard-nav">
        <button class="nav-button active" id="categoriasTab">🏷️ Categorias</button>
        <button class="nav-button" id="horariosTab">🕐 Horários</button>
    </nav>

    <div id="categoriasSection" class="tab-section">
        <div class="section-header">
            <div>
                <div class="section-title">Categorias de Produto</div>
                <div class="section-subtitle">Organize os produtos por categoria</div>
            </div>
            <button class="btn-primary" id="openAddCategoryModal">+ Nova Categoria</button>
        </div>
        <div id="categoryList"></div>
    </div>

    <div id="horariosSection" class="tab-section hidden">
        <div class="section-header">
            <div>
                <div class="section-title">Horários de Atendimento</div>
                <div class="section-subtitle">Configure os horários disponíveis</div>
            </div>
        </div>
        <div class="empty-state">
            <div class="empty-state-icon">🕐</div>
            <span>Configuração de horários em breve.</span>
        </div>
    </div>
</div>

<!-- Modal Categoria -->
<div id="addCategoryModal" class="modal" style="display:none;">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Nova Categoria</h2>
            <button class="close-button" id="closeCategoryModal" aria-label="Fechar">✕</button>
        </div>
        <div class="modal-body">
            <form id="categoryForm">
                <input type="hidden" id="categoryId">
                <div class="form-group">
                    <label for="categoryName">Nome da Categoria</label>
                    <input type="text" id="categoryName" placeholder="Ex: Cuidados com os Cabelos" required>
                </div>
                <button type="submit" class="btn-primary" style="width:100%">Salvar Categoria</button>
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
<script src="js/configadmin.js"></script>
</body>
</html>

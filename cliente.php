<?php
require_once 'db_connect.php';
require_once 'auth_check.php';
check_auth('cliente');
$user_name = htmlspecialchars($_SESSION['user_name']);
?>
<!DOCTYPE html>
<html lang="pt-BR" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="ico/icone.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="ico/icone.png">
    <link rel="apple-touch-icon" sizes="180x180" href="ico/icone-180.png">
    <title>Meu Painel — Studio Transformese</title>
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/dashboard.css">
    <link rel="stylesheet" href="css/cliente.css">
</head>
<body>

<header class="dashboard-header">
    <div class="header-content">
        <div class="header-brand">
            <img src="ico/icone.png" alt="Studio Transformese" class="header-brand-icon-img">
            Studio Transformese
        </div>
        <div class="header-greeting">
            Olá, <strong><?= $user_name ?></strong> 👋
        </div>
        <div class="header-actions">
            <button class="cart-header-btn" id="openCartBtn" title="Ver carrinho">
                <span class="cart-header-icon">🛒</span>
                <span class="cart-badge hidden" id="cartBadge">0</span>
            </button>
            <button class="theme-toggle" id="themeToggle" title="Alternar tema">🌙</button>
            <button class="btn-logout" onclick="logout()">Sair</button>
        </div>
    </div>
</header>

<div class="dashboard-container">

    <nav class="dashboard-nav">
        <button class="nav-button active" id="agendamentosTab">📅 Meus Agendamentos</button>
        <button class="nav-button" id="produtosTab">🛒 Produtos</button>
    </nav>

    <!-- Agendamentos -->
    <div id="agendamentosSection" class="tab-section">
        <div class="section-header">
            <div>
                <div class="section-title">Agendar Atendimento</div>
                <div class="section-subtitle">Escolha o serviço, data e horário</div>
            </div>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label for="service">Serviço</label>
                <select id="service"><option value="">Carregando...</option></select>
            </div>
            <div class="form-group">
                <label for="date">Data</label>
                <input type="date" id="date">
            </div>
            <div class="form-group">
                <label for="time">Horário</label>
                <select id="time" disabled>
                    <option value="">Selecione uma data primeiro</option>
                </select>
            </div>
            <div class="form-group full-width">
                <label for="observations">Observações</label>
                <textarea id="observations" placeholder="Alguma preferência especial?"></textarea>
            </div>
            <div class="full-width">
                <button class="btn-primary" id="scheduleAppointmentBtn" style="width:100%">
                    📅 Confirmar Agendamento
                </button>
            </div>
        </div>

        <div class="section-header" style="margin-top:.5rem">
            <div>
                <div class="section-title">Meus Agendamentos</div>
                <div class="section-subtitle">Histórico e próximos atendimentos</div>
            </div>
        </div>
        <div id="noAppointments" class="empty-state hidden">
            <div class="empty-state-icon">📅</div>
            <span>Você ainda não tem agendamentos.<br>Que tal marcar o seu primeiro?</span>
        </div>
        <div id="appointmentsList"></div>
    </div>

    <!-- Produtos -->
    <div id="produtosSection" class="tab-section hidden">
        <div class="section-header">
            <div>
                <div class="section-title">Produtos Disponíveis</div>
                <div class="section-subtitle">Conheça nossos produtos para cuidados capilares</div>
            </div>
        </div>
        <div id="availableProducts" class="products-grid"></div>
    </div>
</div>

<!-- Toast de feedback -->
<div id="cartToast" class="cart-toast hidden">
    <span class="cart-toast-icon">✅</span>
    <span id="cartToastMsg">Produto adicionado!</span>
</div>

<!-- Modal Carrinho -->
<div id="cartModal" class="modal" style="display:none;">
    <div class="modal-content modal-cart">
        <div class="modal-header">
            <div>
                <h2>🛒 Carrinho</h2>
                <p class="cart-subtitle" id="cartSubtitle">0 itens</p>
            </div>
            <button class="close-button" id="closeCartModal" aria-label="Fechar">✕</button>
        </div>
        <div class="modal-body">

            <!-- Estado vazio -->
            <div class="cart-empty-state" id="cartEmpty">
                <div class="cart-empty-icon">🛒</div>
                <p class="cart-empty-title">Carrinho vazio</p>
                <p class="cart-empty-desc">Adicione produtos para continuar</p>
            </div>

            <!-- Lista de itens -->
            <div id="cartItemsList" class="hidden"></div>

            <!-- Rodapé com total e checkout -->
            <div id="cartFooter" class="cart-footer hidden">
                <div class="cart-summary">
                    <div class="cart-summary-row">
                        <span>Subtotal (<span id="cartItemCount">0</span> itens)</span>
                        <span id="cartSubtotalValue">R$ 0,00</span>
                    </div>
                </div>
                <button class="btn-checkout" id="checkoutBtn">
                    Finalizar Pedido · <span id="cartTotalValue">R$ 0,00</span>
                </button>
                <button class="btn-clear-cart" id="clearCartBtn">Esvaziar carrinho</button>
            </div>

        </div>
    </div>
</div>

<!-- Modal Confirmação de Pedido -->
<div id="checkoutModal" class="modal" style="display:none;">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Confirmar Pedido</h2>
            <button class="close-button" id="closeCheckoutModal" aria-label="Fechar">✕</button>
        </div>
        <div class="modal-body">
            <div id="checkoutSummary"></div>
            <div class="checkout-actions">
                <button class="btn-checkout" id="confirmOrderBtn">✅ Confirmar Pedido</button>
                <button class="btn-ghost" id="cancelOrderBtn" style="width:100%;margin-top:.5rem">Voltar ao Carrinho</button>
            </div>
        </div>
    </div>
</div>

<script>
window.SESSION_USER = {
    id:   <?= (int)$_SESSION['user_id'] ?>,
    name: <?= json_encode($_SESSION['user_name']) ?>,
    role: 'cliente'
};
</script>
<script src="js/theme.js"></script>
<script src="js/common.js"></script>
<script src="js/cliente.js"></script>
</body>
</html>

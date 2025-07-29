<?php
session_start();
if (!isset($_SESSION['loggedInUser']) || $_SESSION['loggedInUser']['funcao'] !== 'cliente') { // 'funcao' em vez de 'role'
    header('Location: index.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel do Cliente - Studio Transformese</title>
    <link rel="stylesheet" href="css/style.css">
</head>

<body>
    <header class="dashboard-header">
        <div class="header-content">
            <h1 id="welcomeMessage">Olá, Cliente!</h1>
            <button class="btn-logout" onclick="logout()">Sair</button>
        </div>
    </header>

    <div class="dashboard-container">
        <nav class="dashboard-nav">
            <button class="nav-button active" id="agendamentosTab">Meus Agendamentos</button>
            <button class="nav-button" id="produtosTab">Produtos</button>
        </nav>

        <div class="dashboard-content">
            <div id="agendamentosSection" class="tab-section active">
                <h2>Novo Agendamento</h2>
                <p>Agende seu próximo atendimento.</p>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="service">Serviço</label>
                        <select id="service">
                            <option value="">Selecione um serviço</option>
                            <!-- Opções serão carregadas via JS do banco de dados -->
                        </select>
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
                        <textarea id="observations" placeholder="Alguma observação especial?"></textarea>
                    </div>
                    <button class="btn-primary full-width" id="scheduleAppointmentBtn">Agendar Atendimento</button>
                </div>

                <h2>Seus Agendamentos</h2>
                <div id="noAppointments" class="empty-state">
                    <p>Você ainda não tem agendamentos.</p>
                </div>
                <div id="appointmentsList" class="appointments-list">
                </div>
            </div>

            <div id="produtosSection" class="tab-section hidden">
                <h2>Produtos Disponíveis</h2>
                <div class="product-list" id="availableProducts">
                </div>
            </div>
        </div>
    </div>
    <script src="js/script.js"></script>
</body>

</html>
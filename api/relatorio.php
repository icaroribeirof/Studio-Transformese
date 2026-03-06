<?php
// api/relatorio.php
// Retorna dados reais para o painel do admin (receita, totais)
include_once '../db_connect.php';
include_once 'api_auth_check.php';

header('Content-Type: application/json');

api_require_auth('admin');

// Total de agendamentos
$total_ag = $conn->query("SELECT COUNT(*) AS total FROM agendamentos")->fetch_assoc()['total'];

// Agendamentos pendentes
$pending  = $conn->query("SELECT COUNT(*) AS total FROM agendamentos WHERE status = 'Agendado'")->fetch_assoc()['total'];

// Total de produtos
$total_prod = $conn->query("SELECT COUNT(*) AS total FROM produtos")->fetch_assoc()['total'];

// Receita REAL: soma dos preços dos serviços com status 'Concluído'
$receita_stmt = $conn->prepare("
    SELECT COALESCE(SUM(s.preco), 0) AS receita
    FROM agendamentos a
    JOIN servicos s ON s.nome = a.nome_servico
    WHERE a.status = 'Concluído'
");
$receita_stmt->execute();
$receita = $receita_stmt->get_result()->fetch_assoc()['receita'];
$receita_stmt->close();

echo json_encode([
    'success'              => true,
    'total_agendamentos'   => (int)$total_ag,
    'pending_agendamentos' => (int)$pending,
    'total_produtos'       => (int)$total_prod,
    'receita_realizada'    => (float)$receita,
]);
?>

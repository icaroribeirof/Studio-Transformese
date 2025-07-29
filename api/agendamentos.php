<?php
// api/agendamentos.php
include_once '../db_connect.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $id_usuario = $_GET['id_usuario'] ?? null; // Renomeado para 'id_usuario'
        $funcao = $_GET['role'] ?? null; // Renomeado para 'funcao'

        if ($funcao === 'admin') {
            $sql = "SELECT a.*, u.email AS email_cliente FROM agendamentos a JOIN usuarios u ON a.id_usuario = u.id ORDER BY data_agendamento DESC, hora_agendamento DESC";
            $stmt = $conn->prepare($sql);
        } elseif ($funcao === 'cliente' && $id_usuario) {
            $sql = "SELECT a.*, u.email AS email_cliente FROM agendamentos a JOIN usuarios u ON a.id_usuario = u.id WHERE a.id_usuario = ? ORDER BY data_agendamento DESC, hora_agendamento DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id_usuario);
        } else {
            echo json_encode(['success' => false, 'message' => 'Parâmetros inválidos para buscar agendamentos.']);
            exit;
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $agendamentos = [];
        while ($row = $result->fetch_assoc()) {
            $agendamentos[] = $row;
        }
        echo json_encode(['success' => true, 'agendamentos' => $agendamentos]);
        $stmt->close();
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $id_usuario = $data['userId'] ?? null; // Renomeado para 'id_usuario'
        $nome_servico = $data['service'] ?? ''; // Renomeado para 'nome_servico'
        $data_agendamento = $data['date'] ?? ''; // Renomeado para 'data_agendamento'
        $hora_agendamento = $data['time'] ?? ''; // Renomeado para 'hora_agendamento'
        $observacoes = $data['observations'] ?? ''; // Renomeado para 'observacoes'

        if (empty($id_usuario) || empty($nome_servico) || empty($data_agendamento) || empty($hora_agendamento)) {
            echo json_encode(['success' => false, 'message' => 'Todos os campos obrigatórios devem ser preenchidos.']);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO agendamentos (id_usuario, nome_servico, data_agendamento, hora_agendamento, observacoes) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("issss", $id_usuario, $nome_servico, $data_agendamento, $hora_agendamento, $observacoes);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Agendamento realizado com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao agendar: ' . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        $status = $data['status'] ?? '';

        if (empty($id) || empty($status)) {
            echo json_encode(['success' => false, 'message' => 'ID e status são obrigatórios.']);
            exit;
        }

        $stmt = $conn->prepare("UPDATE agendamentos SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $status, $id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Status do agendamento atualizado com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar status: ' . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        // Não implementado no JS original, mas seria similar
        echo json_encode(['success' => false, 'message' => 'Método DELETE não implementado para agendamentos.']);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
        break;
}

$conn->close();
?>
<?php
// api/agendamentos.php
include_once '../db_connect.php';
include_once 'api_auth_check.php';

header('Content-Type: application/json');

$session_user = api_require_auth(); // Requer usuário logado
$method       = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ─── GET ──────────────────────────────────────────────────────────────────
    case 'GET':
        $action = $_GET['action'] ?? null;

        // Busca horários ocupados para uma data
        if ($action === 'get_available_times') {
            $data_agendamento = $_GET['date'] ?? null;
            if (empty($data_agendamento)) {
                echo json_encode(['success' => false, 'message' => 'Data é obrigatória.']);
                exit;
            }

            $sql  = "SELECT hora_agendamento FROM agendamentos WHERE data_agendamento = ? AND status IN ('Agendado', 'Concluído')";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $data_agendamento);
            $stmt->execute();
            $result         = $stmt->get_result();
            $occupied_times = [];
            while ($row = $result->fetch_assoc()) {
                $occupied_times[] = $row['hora_agendamento'];
            }
            $stmt->close();
            echo json_encode(['success' => true, 'occupied_times' => $occupied_times]);
            exit;
        }

        // Busca agendamentos — admin vê todos, cliente vê só os seus
        if ($session_user['role'] === 'admin') {
            $sql  = "SELECT a.*, u.nome AS nome_cliente, u.email AS email_cliente
                     FROM agendamentos a
                     JOIN usuarios u ON a.id_usuario = u.id
                     ORDER BY a.data_agendamento DESC, a.hora_agendamento DESC";
            $stmt = $conn->prepare($sql);
        } else {
            // Cliente só pode ver seus próprios agendamentos (usa ID da sessão, não do GET)
            $id_usuario = $session_user['id'];
            $sql  = "SELECT a.*, u.nome AS nome_cliente, u.email AS email_cliente
                     FROM agendamentos a
                     JOIN usuarios u ON a.id_usuario = u.id
                     WHERE a.id_usuario = ?
                     ORDER BY a.data_agendamento DESC, a.hora_agendamento DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id_usuario);
        }

        $stmt->execute();
        $result       = $stmt->get_result();
        $agendamentos = [];
        while ($row = $result->fetch_assoc()) {
            $agendamentos[] = $row;
        }
        $stmt->close();
        echo json_encode(['success' => true, 'agendamentos' => $agendamentos]);
        break;

    // ─── POST ─────────────────────────────────────────────────────────────────
    case 'POST':
        $data             = json_decode(file_get_contents('php://input'), true);
        $nome_servico     = trim($data['service'] ?? '');
        $data_agendamento = $data['date'] ?? '';
        $hora_agendamento = $data['time'] ?? '';
        $observacoes      = trim($data['observations'] ?? '');

        // Usa o ID da sessão — cliente não pode agendar por outro
        $id_usuario = $session_user['id'];

        if (empty($nome_servico) || empty($data_agendamento) || empty($hora_agendamento)) {
            echo json_encode(['success' => false, 'message' => 'Serviço, data e horário são obrigatórios.']);
            exit;
        }

        // Verifica se o horário já está ocupado (race condition prevention)
        $check = $conn->prepare("SELECT id FROM agendamentos WHERE data_agendamento = ? AND hora_agendamento = ? AND status IN ('Agendado', 'Concluído') LIMIT 1");
        $check->bind_param("ss", $data_agendamento, $hora_agendamento);
        $check->execute();
        $check->store_result();
        if ($check->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Este horário já foi reservado. Escolha outro.']);
            $check->close();
            exit;
        }
        $check->close();

        $status = 'Agendado';
        $stmt   = $conn->prepare("INSERT INTO agendamentos (id_usuario, nome_servico, data_agendamento, hora_agendamento, observacoes, status) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssss", $id_usuario, $nome_servico, $data_agendamento, $hora_agendamento, $observacoes, $status);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Agendamento realizado com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao salvar agendamento.']);
        }
        $stmt->close();
        break;

    // ─── PUT ──────────────────────────────────────────────────────────────────
    case 'PUT':
        // Apenas admin pode alterar status
        api_require_auth('admin');

        $data      = json_decode(file_get_contents('php://input'), true);
        $id        = (int)($data['id'] ?? 0);
        $newStatus = $data['status'] ?? '';

        $allowed_statuses = ['Agendado', 'Concluído', 'Cancelado'];
        if (!$id || !in_array($newStatus, $allowed_statuses)) {
            echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
            exit;
        }

        $stmt = $conn->prepare("UPDATE agendamentos SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $newStatus, $id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => "Status atualizado para '$newStatus'."]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar status.']);
        }
        $stmt->close();
        break;

    // ─── DELETE ───────────────────────────────────────────────────────────────
    case 'DELETE':
        // Apenas admin pode deletar
        api_require_auth('admin');

        $data = json_decode(file_get_contents('php://input'), true);
        $id   = (int)($data['id'] ?? 0);

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID inválido.']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM agendamentos WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Agendamento removido.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao remover agendamento.']);
        }
        $stmt->close();
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
?>

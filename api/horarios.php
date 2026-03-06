<?php
// api/horarios.php
if (session_status() === PHP_SESSION_NONE) session_start();
include_once '../db_connect.php';
include_once 'api_auth_check.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

// GET — público (cliente precisa ver os horários disponíveis)
if ($method === 'GET') {
    $stmt = $conn->prepare(
        "SELECT dia_semana, hora_inicio, hora_fim, intervalo, ativo
         FROM horarios_config ORDER BY dia_semana ASC"
    );
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    // Mapeia para objeto indexado por dia
    $config = [];
    foreach ($rows as $r) {
        $config[$r['dia_semana']] = [
            'dia_semana'  => (int)$r['dia_semana'],
            'hora_inicio' => substr($r['hora_inicio'], 0, 5),
            'hora_fim'    => substr($r['hora_fim'], 0, 5),
            'intervalo'   => (int)$r['intervalo'],
            'ativo'       => (bool)$r['ativo'],
        ];
    }
    echo json_encode(['success' => true, 'horarios' => $config]);
    exit;
}

// PUT — somente admin (salva todos os dias de uma vez)
if ($method === 'PUT') {
    api_require_auth('admin');

    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['horarios']) || !is_array($data['horarios'])) {
        echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
        exit;
    }

    $stmt = $conn->prepare(
        "INSERT INTO horarios_config (dia_semana, hora_inicio, hora_fim, intervalo, ativo)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
             hora_inicio = VALUES(hora_inicio),
             hora_fim    = VALUES(hora_fim),
             intervalo   = VALUES(intervalo),
             ativo       = VALUES(ativo)"
    );

    foreach ($data['horarios'] as $dia) {
        $dia_semana  = (int)($dia['dia_semana'] ?? 0);
        $ativo       = (int)(!empty($dia['ativo']));
        $hora_inicio = $ativo ? ($dia['hora_inicio'] ?? '09:00') : '00:00';
        $hora_fim    = $ativo ? ($dia['hora_fim']    ?? '18:00') : '00:00';
        $intervalo   = (int)($dia['intervalo'] ?? 30);

        // Valida formato HH:MM
        if (!preg_match('/^\d{2}:\d{2}$/', $hora_inicio)) $hora_inicio = '09:00';
        if (!preg_match('/^\d{2}:\d{2}$/', $hora_fim))    $hora_fim    = '18:00';
        if ($intervalo < 15 || $intervalo > 120)           $intervalo   = 30;
        if ($dia_semana < 0 || $dia_semana > 6)            continue;

        $stmt->bind_param("issii", $dia_semana, $hora_inicio, $hora_fim, $intervalo, $ativo);
        $stmt->execute();
    }
    $stmt->close();

    echo json_encode(['success' => true, 'message' => 'Horários salvos com sucesso!']);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
?>

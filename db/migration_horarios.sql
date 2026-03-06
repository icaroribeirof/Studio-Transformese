-- Migração: adiciona tabela de configuração de horários
-- Execute se já tiver o banco instalado e quiser adicionar essa funcionalidade

USE studio_transformese;

CREATE TABLE IF NOT EXISTS horarios_config (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    dia_semana  TINYINT      NOT NULL,
    hora_inicio TIME         NOT NULL,
    hora_fim    TIME         NOT NULL,
    intervalo   SMALLINT     NOT NULL DEFAULT 30,
    ativo       TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uq_dia (dia_semana)
) ENGINE=InnoDB;

INSERT IGNORE INTO horarios_config (dia_semana, hora_inicio, hora_fim, intervalo, ativo) VALUES
    (1, '09:00:00', '18:00:00', 30, 1),
    (2, '09:00:00', '18:00:00', 30, 1),
    (3, '09:00:00', '18:00:00', 30, 1),
    (4, '09:00:00', '18:00:00', 30, 1),
    (5, '09:00:00', '18:00:00', 30, 1),
    (6, '09:00:00', '13:00:00', 30, 1),
    (0, '00:00:00', '00:00:00', 30, 0);

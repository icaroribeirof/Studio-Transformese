-- ============================================================
-- Studio Transformese — Schema do banco de dados
-- Execute este arquivo no seu MySQL/MariaDB:
--   mysql -u root -p < db/studio_transformese.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS studio_transformese
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE studio_transformese;

-- ── USUÁRIOS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    nome      VARCHAR(120)  NOT NULL,
    email     VARCHAR(180)  NOT NULL UNIQUE,
    senha     VARCHAR(255)  NOT NULL,
    funcao    ENUM('cliente','admin') NOT NULL DEFAULT 'cliente',
    criado_em DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- ── CATEGORIAS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
    id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(80)  NOT NULL UNIQUE,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT IGNORE INTO categorias (nome) VALUES
    ('Cuidados com os Cabelos'),
    ('Acessórios'),
    ('Tratamentos');

-- ── PRODUTOS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS produtos (
    id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    nome         VARCHAR(120)  NOT NULL,
    id_categoria INT UNSIGNED,
    preco        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    descricao    TEXT,
    url_imagem   VARCHAR(300),
    criado_em    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── SERVIÇOS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS servicos (
    id        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    nome      VARCHAR(120)  NOT NULL UNIQUE,
    preco     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    descricao TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT IGNORE INTO servicos (nome, preco, descricao) VALUES
    ('Trança Nagô',    150.00, 'Trança nagô tradicional'),
    ('Box Braids',     200.00, 'Box braids pequenas ou médias'),
    ('Crochet Braids', 180.00, 'Crochet braids com cabelo sintético');

-- ── AGENDAMENTOS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agendamentos (
    id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_usuario       INT UNSIGNED NOT NULL,
    nome_servico     VARCHAR(120) NOT NULL,
    data_agendamento DATE         NOT NULL,
    hora_agendamento TIME         NOT NULL,
    observacoes      TEXT,
    status           ENUM('Agendado','Concluído','Cancelado') NOT NULL DEFAULT 'Agendado',
    criado_em        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_data_hora (data_agendamento, hora_agendamento),
    INDEX idx_usuario   (id_usuario)
) ENGINE=InnoDB;

-- ── ADMIN PADRÃO ─────────────────────────────────────────────────────────────
-- O admin é criado pelo setup.php para garantir o hash bcrypt correto.
-- Execute http://localhost/Studio%20Transformese/setup.php após importar este SQL.

-- ── MIGRAÇÃO: limpa imagens base64 antigas do banco ──────────────────────────
-- Se você veio de uma versão anterior que salvava base64 no campo url_imagem,
-- execute este comando para limpar os valores inválidos:
-- UPDATE produtos SET url_imagem = NULL WHERE url_imagem LIKE 'data:%' OR LENGTH(url_imagem) > 500;

-- ==========================================
-- Script para criar tabelas de Empresa e Cliente
-- ==========================================

-- ==========================================
-- TABELA: Empresa
-- ==========================================
CREATE TABLE Empresa (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    -- Endereço (opcionais)
    logradouro VARCHAR(255) NULL,
    numero VARCHAR(20) NULL,
    complemento VARCHAR(100) NULL,
    bairro VARCHAR(100) NULL,
    cidade VARCHAR(100) NULL,
    estado VARCHAR(2) NULL,
    cep VARCHAR(10) NULL,
    -- Contato (opcionais)
    celular VARCHAR(20) NULL,
    email VARCHAR(150) NULL,
    -- Controle
    dt_inclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_usuario INT,
    fl_ativo TINYINT(1) DEFAULT 1,
    INDEX idx_cnpj (cnpj),
    INDEX idx_nome (nome),
    INDEX idx_fl_ativo (fl_ativo),
    INDEX idx_id_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: Cliente
-- ==========================================
CREATE TABLE Cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    -- Endereço (opcionais)
    logradouro VARCHAR(255) NULL,
    numero VARCHAR(20) NULL,
    complemento VARCHAR(100) NULL,
    bairro VARCHAR(100) NULL,
    cidade VARCHAR(100) NULL,
    estado VARCHAR(2) NULL,
    cep VARCHAR(10) NULL,
    -- Contato (opcionais)
    celular VARCHAR(20) NULL,
    email VARCHAR(150) NULL,
    -- Controle
    dt_inclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_usuario INT,
    fl_ativo TINYINT(1) DEFAULT 1,
    INDEX idx_cnpj (cnpj),
    INDEX idx_nome (nome),
    INDEX idx_fl_ativo (fl_ativo),
    INDEX idx_id_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- CHAVES ESTRANGEIRAS
-- ==========================================

-- Chave estrangeira para tabela Empresa
ALTER TABLE Empresa
ADD CONSTRAINT fk_empresa_usuario
FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

-- Chave estrangeira para tabela Cliente
ALTER TABLE Cliente
ADD CONSTRAINT fk_cliente_usuario
FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

-- ==========================================
-- COMENTÁRIOS DAS TABELAS
-- ==========================================
ALTER TABLE Empresa COMMENT = 'Tabela de empresas que solicitam produção';
ALTER TABLE Cliente COMMENT = 'Tabela de clientes destinatários da produção';

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================


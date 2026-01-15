-- Criar a Base de Dados
CREATE DATABASE sistema_gestao_atec;
USE sistema_gestao_atec;

-- 1. ÁREAS DE FORMAÇÃO
-- Necessário para estatísticas de cursos por área
CREATE TABLE areas (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

CREATE TABLE tipo_utilizadores (
	id_tipo_utilizador INT AUTO_INCREMENT PRIMARY KEY,
    tipo_utilizador varchar(50) NOT NULL
);

-- 2. UTILIZADORES
-- Suporta login via Email, Google e Facebook com ativação
CREATE TABLE utilizadores (
    id_utilizador INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    id_google VARCHAR(255),
    id_facebook VARCHAR(255),
    id_tipo_utilizador INT NOT NULL DEFAULT 5,
    -- tipo_utilizador ENUM('admin', 'formador', 'formando', 'administrativo') NOT NULL, -- criar tabela
    status_ativacao BOOLEAN DEFAULT FALSE,
    token_ativacao VARCHAR(255),
    FOREIGN KEY (id_tipo_utilizador) REFERENCES tipo_utilizadores(id_tipo_utilizador)
);

-- 3. MÓDULOS
-- Inclui identificação UFCD/UC e horas totais para controlo de carga horária
CREATE TABLE modulos (
    id_modulo INT AUTO_INCREMENT PRIMARY KEY,
    codigo_identificacao VARCHAR(20) UNIQUE, -- Ex: UFCD001 ou UC00600
    nome VARCHAR(100) NOT NULL,
    horas_totais INT NOT NULL, -- Ex: 50 / 25
    creditos DECIMAL(4,2) NOT NULL
);

-- 4. SALAS
CREATE TABLE salas (
    id_sala INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(50) NOT NULL,
    num_max_alunos INT NOT NULL CHECK(num_max_alunos >= 5)
);

-- 5. CURSOS (Plano de estudos)
CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    id_area INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_area) REFERENCES areas(id_area)
);

-- MATRIZ DO CURSO (Plano de Estudos)
CREATE TABLE cursos_modulos (
	id_curso_modulo INT AUTO_INCREMENT PRIMARY KEY,
    id_curso INT NOT NULL,
    id_modulo INT NOT NULL,
	prioridade INT NOT NULL, 
	FOREIGN KEY (id_curso) REFERENCES cursos(id_curso),
    FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo)
);

-- 6. TURMAS (Execução do curso com datas específicas)
CREATE TABLE turmas (
    id_turma INT AUTO_INCREMENT PRIMARY KEY,
    id_curso INT NOT NULL,
    nome_turma VARCHAR(50) NOT NULL, -- Ex: TPSI-PAL-0525
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
);

-- 7. FORMADORES E FORMANDOS
-- Inclui fotografia e anexos para exportação PDF
CREATE TABLE formadores (
    id_formador INT AUTO_INCREMENT PRIMARY KEY,
    id_utilizador INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    nif VARCHAR(9) UNIQUE NOT NULL,
    telefone VARCHAR(13), 
    data_nascimento DATE NOT NULL,
    fotografia MEDIUMBLOB,
    anexo_ficheiro MEDIUMBLOB,
    FOREIGN KEY (id_utilizador) REFERENCES utilizadores(id_utilizador)
);

CREATE TABLE formandos (
    id_formando INT AUTO_INCREMENT PRIMARY KEY,
    id_utilizador INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    nif VARCHAR(9) UNIQUE NOT NULL,
    telefone VARCHAR(13), 
    data_nascimento DATE NOT NULL,
    morada VARCHAR(100) NOT NULL,
    fotografia MEDIUMBLOB,
    anexo_ficheiro MEDIUMBLOB,
    FOREIGN KEY (id_utilizador) REFERENCES utilizadores(id_utilizador)
);

-- TABELA DE PLANEAMENTO (Quem dá o quê em cada turma)
CREATE TABLE turma_alocacoes (
    id_alocacao INT AUTO_INCREMENT PRIMARY KEY,
    id_turma INT NOT NULL,
    id_modulo INT NOT NULL,
    id_formador INT NOT NULL,
    FOREIGN KEY (id_turma) REFERENCES turmas(id_turma),
    FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo),
    FOREIGN KEY (id_formador) REFERENCES formadores(id_formador)
);

-- 8. INSCRIÇÕES (Ligação Formando <-> Turma)
-- Essencial para o histórico de cursos realizados e avaliação
CREATE TABLE inscricoes (
    id_inscricao INT AUTO_INCREMENT PRIMARY KEY,
    id_formando INT NOT NULL,
    id_turma INT NOT NULL,
    data_inscricao DATE DEFAULT (CURRENT_DATE) NOT NULL,
    estado ENUM('Ativo', 'Concluido', 'Desistente', 'Congelado') DEFAULT 'Ativo',
    nota_final DECIMAL(4,2) CHECK (nota_final BETWEEN 0.0 AND 20.0),
    FOREIGN KEY (id_formando) REFERENCES formandos(id_formando),
    FOREIGN KEY (id_turma) REFERENCES turmas(id_turma)
);

-- 9. AVALIAÇÕES (Notas por Módulo)
-- Exportação de avaliação por curso realizado
CREATE TABLE avaliacoes (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    id_inscricao INT NOT NULL,
    id_modulo INT NOT NULL,
    nota DECIMAL(4,2) CHECK (nota BETWEEN 0.0 AND 20.0),
    data_avaliacao DATE,
    FOREIGN KEY (id_inscricao) REFERENCES inscricoes(id_inscricao),
    FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo)
);

-- 10. DISPONIBILIDADE FLEXÍVEL (Calendário por Data)
CREATE TABLE disponibilidade_formadores (
    id_disp_formador INT AUTO_INCREMENT PRIMARY KEY,
    id_formador INT NOT NULL,
    data_disponivel DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    FOREIGN KEY (id_formador) REFERENCES formadores(id_formador)
);

CREATE TABLE disponibilidade_salas (
    id_disp_sala INT AUTO_INCREMENT PRIMARY KEY,
    id_sala INT NOT NULL,
    data_disponivel DATE NOT NULL, -- DATE e não DATETIME ?
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    FOREIGN KEY (id_sala) REFERENCES salas(id_sala)
);

-- 11. HORÁRIOS (Garante não sobreposição)
CREATE TABLE horarios (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    id_turma INT NOT NULL,
    id_modulo INT NOT NULL,
    id_formador INT NOT NULL,
    id_sala INT NOT NULL,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    -- Restrições para evitar conflitos técnicos
    UNIQUE (id_sala, data, hora_inicio), 
    UNIQUE (id_formador, data, hora_inicio),
    -- ...
    FOREIGN KEY (id_turma) REFERENCES turmas(id_turma),
    FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo),
    FOREIGN KEY (id_formador) REFERENCES formadores(id_formador),
    FOREIGN KEY (id_sala) REFERENCES salas(id_sala)
);

INSERT INTO areas (nome) VALUES
('Informática'),
('Gestão'),
('Saúde'),
('Indústria');

INSERT INTO tipo_utilizadores (tipo_utilizador) VALUES
('admin'),
('formador'),
('formando'),
('administrativo'),
('geral');

INSERT INTO utilizadores (email, password_hash, id_tipo_utilizador, status_ativacao) VALUES
('admin@atec.pt', 'hash_admin', 1, TRUE),
('joao.formador@atec.pt', 'hash_formador', 2, TRUE),
('ana.formadora@atec.pt', 'hash_formador', 2, TRUE),
('maria.formando@atec.pt', 'hash_formando', 3, TRUE),
('pedro.formando@atec.pt', 'hash_formando', 3, TRUE);

INSERT INTO modulos (codigo_identificacao, nome, horas_totais, creditos) VALUES
('UFCD001', 'Programação em Python', 50, 4.0),
('UFCD002', 'Bases de Dados', 50, 4.0),
('UFCD003', 'Desenvolvimento Web', 75, 6.0),
('UFCD004', 'Redes de Computadores', 25, 2.0);

INSERT INTO salas (descricao, num_max_alunos) VALUES
('Sala A1', 20),
('Sala B2', 25),
('Laboratório Informática', 18);

INSERT INTO cursos (id_area, nome) VALUES
(1, 'Técnico de Programação de Sistemas de Informação'),
(1, 'Desenvolvedor Web');

INSERT INTO cursos_modulos (id_curso, id_modulo, prioridade) VALUES
(1, 1, 1),
(1, 2, 2),
(1, 4, 3),
(2, 3, 1),
(2, 2, 2);

INSERT INTO turmas (id_curso, nome_turma, data_inicio, data_fim) VALUES
(1, 'TPSI-PAL-0125', '2025-01-15', '2025-07-15'),
(2, 'WEB-LIS-0225', '2025-02-01', '2025-06-30');

INSERT INTO formadores (id_utilizador, nome, nif, data_nascimento) VALUES
(2, 'João Silva', '123456789', '1985-04-12'),
(3, 'Ana Costa', '987654321', '1990-09-30');

INSERT INTO formandos (id_utilizador, nome, nif, data_nascimento, morada) VALUES
(4, 'Maria Fernandes', '111222333', '2000-05-20', 'Rua das Flores, Lisboa'),
(5, 'Pedro Rocha', '444555666', '1998-11-10', 'Av. Central, Porto');

INSERT INTO turma_alocacoes (id_turma, id_modulo, id_formador) VALUES
(1, 1, 1),
(1, 2, 2),
(2, 3, 2);

INSERT INTO inscricoes (id_formando, id_turma, estado) VALUES
(1, 1, 'Ativo'),
(2, 1, 'Ativo'),
(1, 2, 'Ativo');

INSERT INTO avaliacoes (id_inscricao, id_modulo, nota, data_avaliacao) VALUES
(1, 1, 15.5, '2025-03-10'),
(1, 2, 16.0, '2025-04-20'),
(2, 1, 14.0, '2025-03-10');

INSERT INTO disponibilidade_formadores (id_formador, data_disponivel, hora_inicio, hora_fim) VALUES
(1, '2025-03-15', '09:00', '13:00'),
(2, '2025-03-15', '14:00', '18:00');

INSERT INTO horarios (id_turma, id_modulo, id_formador, id_sala, data, hora_inicio, hora_fim) VALUES
(1, 1, 1, 3, '2025-03-15', '09:00', '12:00'),
(1, 2, 2, 1, '2025-03-15', '14:00', '17:00');

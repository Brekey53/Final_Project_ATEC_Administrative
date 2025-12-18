-- Criar a Base de Dados
CREATE DATABASE sistema_gestao_atec;
USE sistema_gestao_atec;

-- 1. UTILIZADOREs
CREATE TABLE utilizadores (
    id_utilizador INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(255),
    facebook_id VARCHAR(255),
    tipo_utilizador ENUM('admin', 'formador', 'formando') NOT NULL,
    status_ativacao BOOLEAN DEFAULT FALSE
);

-- 2. SALAS
CREATE TABLE salas (
    id_sala INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(50) NOT NULL
);

-- 3. MODULOS (Unidades Curriculares)
CREATE TABLE modulos (
    id_modulo INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

-- 4. CURSOS
CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    area VARCHAR(50), -- Ex: Informática, Robótica, Electrónica
    data_inicio DATE,
    data_fim DATE
);

-- 5. FORMADORES (Corpo Docente)
CREATE TABLE formadores (
    id_formador INT AUTO_INCREMENT PRIMARY KEY,
    utilizador_id INT,
    nome VARCHAR(50) NOT NULL,
    nif INT UNIQUE,
    data_nascimento DATE,
    morada VARCHAR(50),
    fotografia VARCHAR(255),
    anexo_ficheiro VARCHAR(255),
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id_utilizador)
);

-- 6. FORMANDOS (Alunos)
CREATE TABLE formandos (
    id_formando INT AUTO_INCREMENT PRIMARY KEY,
    utilizador_id INT,
    nome VARCHAR(50) NOT NULL,
    nif INT UNIQUE,
    data_nascimento DATE,
    morada VARCHAR(50),
    fotografia VARCHAR(255),
    anexo_ficheiro VARCHAR(255),
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id_utilizador)
);

-- 7. CURSO_MODULO
CREATE TABLE curso_modulo (
    id_curso_modulo INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT,
    modulo_id INT,
    formador_id INT,
    sala_id INT,
    sequencia_ordem INT,
    FOREIGN KEY (curso_id) REFERENCES cursos(id_curso),
    FOREIGN KEY (modulo_id) REFERENCES modulos(id_modulo),
    FOREIGN KEY (formador_id) REFERENCES formadores(id_formador),
    FOREIGN KEY (sala_id) REFERENCES salas(id_sala)
);

-- 8. INSCRIÇÕES (Histórico Escolar)
CREATE TABLE inscricoes (
    id_inscricao INT AUTO_INCREMENT PRIMARY KEY,
    formando_id INT,
    curso_id INT,
    data_inscricao DATE,
    estado VARCHAR(50), -- Ativo, Concluído, Desistente
    nota_final DECIMAL(4,2),
    FOREIGN KEY (formando_id) REFERENCES formandos(id_formando),
    FOREIGN KEY (curso_id) REFERENCES cursos(id_curso)
);

-- 9. AVALIAÇÕES (Notas por Módulo)
CREATE TABLE avaliacoes (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    inscricao_id INT, -- Substitui formando_id e curso_id
    modulo_id INT,
    nota DECIMAL(4,2),
    data_avaliacao DATE,
    FOREIGN KEY (inscricao_id) REFERENCES inscricoes(id_inscricao),
    FOREIGN KEY (modulo_id) REFERENCES modulos(id_modulo)
);

-- 10. HORÁRIOS 
CREATE TABLE horarios (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT,
    modulo_id INT,
    formador_id INT,
    sala_id INT,
    data DATE,
    hora_inicio TIME,
    hora_fim TIME,
    UNIQUE KEY (sala_id, data, hora_inicio), -- Impede duas aulas na mesma sala
    UNIQUE KEY (formador_id, data, hora_inicio), -- Impede formador em duas aulas
    FOREIGN KEY (curso_id) REFERENCES cursos(id_curso),
    FOREIGN KEY (modulo_id) REFERENCES modulos(id_modulo),
    FOREIGN KEY (formador_id) REFERENCES formadores(id_formador),
    FOREIGN KEY (sala_id) REFERENCES salas(id_sala)
);

-- 11. DISPONIBILIDADE_FORMADORES
CREATE TABLE disponibilidade_formadores (
    id_disp_formador INT AUTO_INCREMENT PRIMARY KEY,
    formador_id INT,
    dia_semana INT, -- 1-7
    hora_inicio TIME,
    hora_fim TIME,
    FOREIGN KEY (formador_id) REFERENCES formadores(id_formador)
);

-- 12. DISPONIBILIDADE_SALAS (Auxílio à Geração Automática)
CREATE TABLE disponibilidade_salas (
    id_disp_sala INT AUTO_INCREMENT PRIMARY KEY,
    sala_id INT,
    dia_semana INT, -- 1-7
    hora_inicio TIME,
    hora_fim TIME,
    FOREIGN KEY (sala_id) REFERENCES salas(id_sala)
);
-- Criar a Base de Dados
CREATE DATABASE sistema_gestao_atec;
USE sistema_gestao_atec;

-- 1. ÁREAS DE FORMAÇÃO
-- Necessário para estatísticas de cursos por área
CREATE TABLE areas (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

-- 2. UTILIZADORES
-- Suporta login via Email, Google e Facebook com ativação
CREATE TABLE utilizadores (
    id_utilizador INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255), 
    id_google VARCHAR(255),
    id_facebook VARCHAR(255),
    tipo_utilizador ENUM('admin', 'formador', 'formando') NOT NULL,
    status_ativacao BOOLEAN DEFAULT FALSE
);

-- 3. MÓDULOS
-- Inclui identificação UFCD/UC e horas totais para controlo de carga horária
CREATE TABLE modulos (
    id_modulo INT AUTO_INCREMENT PRIMARY KEY,
    codigo_identificacao VARCHAR(20) UNIQUE, -- Ex: UFCD001 ou UC00600
    nome VARCHAR(100) NOT NULL,
    horas_totais INT NOT NULL, -- Ex: 50 / 25
    creditos DECIMAL(4,2)
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
    id_area INT,
    nome VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_area) REFERENCES areas(id_area)
);

-- 6. TURMAS (Execução do curso com datas específicas)
CREATE TABLE turmas (
    id_turma INT AUTO_INCREMENT PRIMARY KEY,
    id_curso INT,
    nome_turma VARCHAR(50) NOT NULL, -- Ex: TPSI-PAL-0525
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
);

-- 7. FORMADORES E FORMANDOS
-- Inclui fotografia e anexos para exportação PDF
CREATE TABLE formadores (
    id_formador INT AUTO_INCREMENT PRIMARY KEY,
    id_utilizador INT,
    nome VARCHAR(100) NOT NULL,
    nif VARCHAR(9) UNIQUE,
    data_nascimento DATE,
    fotografia VARCHAR(255),
    anexo_ficheiro VARCHAR(255),
    FOREIGN KEY (id_utilizador) REFERENCES utilizadores(id_utilizador)
);

CREATE TABLE formandos (
    id_formando INT AUTO_INCREMENT PRIMARY KEY,
    id_utilizador INT,
    nome VARCHAR(100) NOT NULL,
    nif VARCHAR(9) UNIQUE,
    data_nascimento DATE,
    morada VARCHAR(100),
    fotografia VARCHAR(255),
    anexo_ficheiro VARCHAR(255),
    FOREIGN KEY (id_utilizador) REFERENCES utilizadores(id_utilizador)
);

-- 8. INSCRIÇÕES (Ligação Formando <-> Turma)
-- Essencial para o histórico de cursos realizados e avaliação
CREATE TABLE inscricoes (
    id_inscricao INT AUTO_INCREMENT PRIMARY KEY,
    id_formando INT,
    id_turma INT,
    data_inscricao DATE DEFAULT (CURRENT_DATE),
    estado ENUM('Ativo', 'Concluido', 'Desistente') DEFAULT 'Ativo',
    nota_final DECIMAL(4,2),
    FOREIGN KEY (id_formando) REFERENCES formandos(id_formando),
    FOREIGN KEY (id_turma) REFERENCES turmas(id_turma)
);

-- 9. AVALIAÇÕES (Notas por Módulo)
-- Exportação de avaliação por curso realizado
CREATE TABLE avaliacoes (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    id_inscricao INT,
    id_modulo INT,
    nota DECIMAL(4,2) CHECK (nota BETWEEN 0.0 AND 20.0),
    data_avaliacao DATE,
    FOREIGN KEY (id_inscricao) REFERENCES inscricoes(id_inscricao),
    FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo)
);

-- 10. DISPONIBILIDADE FLEXÍVEL ???? (Calendário por Data)
CREATE TABLE disponibilidade_formadores (
    id_disp_formador INT AUTO_INCREMENT PRIMARY KEY,
    id_formador INT,
    data_disponivel DATE NOT NULL, -- DATE e não DATETIME
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    FOREIGN KEY (id_formador) REFERENCES formadores(id_formador)
);

CREATE TABLE disponibilidade_salas (
    id_disp_sala INT AUTO_INCREMENT PRIMARY KEY,
    id_sala INT,
    data_disponivel DATE NOT NULL, -- DATE e não DATETIME ?
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    FOREIGN KEY (id_sala) REFERENCES salas(id_sala)
);

-- 11. HORÁRIOS (Garante não sobreposição)
CREATE TABLE horarios (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    id_turma INT,
    id_modulo INT,
    id_formador INT,
    id_sala INT,
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
-- Criar a Base de Dados
CREATE DATABASE sistema_gestao_atec;
USE sistema_gestao_atec;

-- ESTRUTURA DE APOIO
CREATE TABLE areas (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

CREATE TABLE tipo_utilizadores (
    id_tipo_utilizador INT AUTO_INCREMENT PRIMARY KEY,
    tipo_utilizador VARCHAR(50) NOT NULL
);

-- escolaridades
CREATE TABLE escolaridades (
    id_escolaridade INT AUTO_INCREMENT PRIMARY KEY,
    nivel VARCHAR(100) NOT NULL
);

-- UTILIZADORES (Centralização de Auth e Perfil Básico)
CREATE TABLE utilizadores (
    id_utilizador INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    nif VARCHAR(9) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    morada VARCHAR(255),
    telefone VARCHAR(20),
    sexo ENUM('Masculino', 'Feminino'),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    id_google VARCHAR(255),
    id_facebook VARCHAR(255),
    id_tipo_utilizador INT NOT NULL DEFAULT 5,
    status_ativacao BOOLEAN DEFAULT FALSE,
    token_ativacao VARCHAR(255),
    FOREIGN KEY (id_tipo_utilizador) REFERENCES tipo_utilizadores(id_tipo_utilizador)
);

-- MÓDULOS (UFCD/UC)
CREATE TABLE modulos (
    id_modulo INT AUTO_INCREMENT PRIMARY KEY,
    codigo_identificacao VARCHAR(20) UNIQUE,
    nome VARCHAR(100) NOT NULL,
    horas_totais INT NOT NULL,
    creditos DECIMAL(4,2) NOT NULL
);

-- SALAS
CREATE TABLE salas (
    id_sala INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(50) NOT NULL,
    num_max_alunos INT NOT NULL CHECK(num_max_alunos >= 5)
);

-- CURSOS E MATRIZ
CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    id_area INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    FOREIGN KEY (id_area) REFERENCES areas(id_area)
);

CREATE TABLE cursos_modulos (
    id_curso_modulo INT AUTO_INCREMENT PRIMARY KEY,
    id_curso INT NOT NULL,
    id_modulo INT NOT NULL,
    prioridade INT NOT NULL, 
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso),
    FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo)
);

-- TURMAS
CREATE TABLE turmas (
    id_turma INT AUTO_INCREMENT PRIMARY KEY,
    id_curso INT NOT NULL,
    nome_turma VARCHAR(50) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
);

-- PERFIS ESPECÍFICOS
CREATE TABLE formadores (
    id_formador INT AUTO_INCREMENT PRIMARY KEY,
    id_utilizador INT NOT NULL,
    iban VARCHAR(20),
    qualificacoes VARCHAR(255),
    fotografia MEDIUMBLOB,
    anexo_ficheiro MEDIUMBLOB,
    FOREIGN KEY (id_utilizador) REFERENCES utilizadores(id_utilizador)
);

CREATE TABLE formandos (
    id_formando INT AUTO_INCREMENT PRIMARY KEY,
    id_utilizador INT NOT NULL,
    id_escolaridade INT,
    fotografia MEDIUMBLOB,
    anexo_ficheiro MEDIUMBLOB,
    FOREIGN KEY (id_utilizador) REFERENCES utilizadores(id_utilizador),
    FOREIGN KEY (id_escolaridade) REFERENCES escolaridades(id_escolaridade)
);

-- PLANEAMENTO E INSCRIÇÕES
CREATE TABLE turma_alocacoes (
    id_alocacao INT AUTO_INCREMENT PRIMARY KEY,
    id_turma INT NOT NULL,
    id_modulo INT NOT NULL,
    id_formador INT NOT NULL,
    FOREIGN KEY (id_turma) REFERENCES turmas(id_turma),
    FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo),
    FOREIGN KEY (id_formador) REFERENCES formadores(id_formador)
);

CREATE TABLE inscricoes (
    id_inscricao INT AUTO_INCREMENT PRIMARY KEY,
    id_formando INT NOT NULL,
    id_turma INT NOT NULL,
    data_inscricao DATE DEFAULT (CURRENT_DATE) NOT NULL,
    estado ENUM('Ativo', 'Concluido', 'Desistente', 'Congelado', 'Suspenso') DEFAULT 'Suspenso',
    nota_final DECIMAL(4,2) CHECK (nota_final BETWEEN 0.0 AND 20.0),
    FOREIGN KEY (id_formando) REFERENCES formandos(id_formando),
    FOREIGN KEY (id_turma) REFERENCES turmas(id_turma)
);

-- AVALIAÇÕES
CREATE TABLE avaliacoes (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    id_inscricao INT NOT NULL,
    id_modulo INT NOT NULL,
    nota DECIMAL(4,2) CHECK (nota BETWEEN 0.0 AND 20.0),
    data_avaliacao DATE,
    FOREIGN KEY (id_inscricao) REFERENCES inscricoes(id_inscricao),
    FOREIGN KEY (id_modulo) REFERENCES modulos(id_modulo)
);

-- DISPONIBILIDADES 
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
    data_disponivel DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    FOREIGN KEY (id_sala) REFERENCES salas(id_sala)
);

-- HORÁRIOS
CREATE TABLE horarios (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    id_turma INT NOT NULL,
    id_curso_modulo INT NOT NULL,
    id_formador INT NOT NULL,
    id_sala INT NOT NULL,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    -- Garante que a sala ou formador não têm duas marcações à mesma hora/dia
    UNIQUE (id_sala, data, hora_inicio), 
    UNIQUE (id_formador, data, hora_inicio),
    FOREIGN KEY (id_turma) REFERENCES turmas(id_turma),
    FOREIGN KEY (id_curso_modulo) REFERENCES cursos_modulos(id_curso_modulo),
    FOREIGN KEY (id_formador) REFERENCES formadores(id_formador),
    FOREIGN KEY (id_sala) REFERENCES salas(id_sala)
);

-- ÁREAS
INSERT INTO areas (nome) VALUES ('Informática'), ('Mecânica'), ('Eletrónica'), ('Gestão'), ('Automação');

-- TIPOS DE UTILIZADOR
INSERT INTO tipo_utilizadores (tipo_utilizador) VALUES ('admin'), ('formador'), ('formando'), ('administrativo'), ('geral');

-- ESCOLARIDADES
INSERT INTO escolaridades (nivel) VALUES ('9º Ano'), ('12º Ano'), ('CTeSP'), ('Licenciatura'), ('Mestrado');

-- UTILIZADORES (5 para Formadores, 5 para Formandos)
INSERT INTO utilizadores (nome, nif, data_nascimento, morada, email, password_hash, id_tipo_utilizador, status_ativacao) VALUES 
('Carlos Professor', '111222333', '1975-03-10', 'Palmela', 'carlos@atec.pt', 'hash123', 2, 1),
('Ana Docente', '222333444', '1982-07-22', 'Setúbal', 'ana@atec.pt', 'hash123', 2, 1),
('Leonor Joaquim', '333444555', '1978-11-05', 'Lisboa', 'bruno@atec.pt', 'hash123', 2, 1),
('Daniela Instrutora', '444555666', '1985-01-30', 'Azeitão', 'daniela@atec.pt', 'hash123', 2, 1),
('Eduardo Formador', '555666777', '1980-12-12', 'Pinhal Novo', 'eduardo@atec.pt', 'hash123', 2, 1),
('Maria Aluna', '999888777', '2001-05-20', 'Palmela', 'maria@student.pt', 'hash123', 3, 1),
('José Silva', '888777666', '2000-09-15', 'Moita', 'jose@student.pt', 'hash123', 3, 1),
('Sara Santos', '777666555', '1999-02-28', 'Montijo', 'sara@student.pt', 'hash123', 3, 1),
('Pedro Rocha', '666555444', '2002-11-11', 'Palmela', 'pedro@student.pt', 'hash123', 3, 1),
('Inês Costa', '555444333', '2001-08-05', 'Setúbal', 'ines@student.pt', 'hash123', 3, 1);

-- FORMADORES (Ligar aos primeiros 5 utilizadores)
INSERT INTO formadores (id_utilizador, iban, qualificacoes) VALUES 
(1, 'PT500001', 'Mestre em Engenharia'), (2, 'PT500002', 'Licenciada em Matemática'),
(3, 'PT500003', 'Especialista Redes'), (4, 'PT500004', 'Doutorada em IA'), (5, 'PT500005', 'Certificação Cisco');

-- FORMANDOS (Ligar aos restantes 5 utilizadores)
INSERT INTO formandos (id_utilizador, id_escolaridade) VALUES 
(6, 2), (7, 2), (8, 3), (9, 2), (10, 4);

-- MÓDULOS (UFCDs comuns)
INSERT INTO modulos (codigo_identificacao, nome, horas_totais, creditos) VALUES 
('UFCD0778', 'Algoritmos', 50, 4.5), ('UFCD0782', 'SQL', 50, 4.5), 
('UFCD5412', 'Sistemas Operativos', 25, 2.5), ('UFCD0804', 'Algoritmos Avançados', 50, 4.5),
('UFCD0123', 'Ética Profissional', 25, 2.0);

-- CURSOS
INSERT INTO cursos (id_area, nome, descricao) VALUES 
(1, 'TPSI - Programação', 'Especialista em Tecnologias e Programação'), (1, 'Cibersegurança', 'Gestão de Redes'),
(2, 'Mecânica Industrial', 'Manutenção Automóvel'), (3, 'Eletrónica Aplicada', 'Circuitos'), (4, 'Gestão Escolar', 'Secretariado');

-- MATRIZ DE CURSOS
INSERT INTO cursos_modulos (id_curso, id_modulo, prioridade) VALUES 
(1, 1, 1), (1, 2, 2), (1, 3, 3), (2, 2, 1), (2, 3, 2);

-- TURMAS
INSERT INTO turmas (id_curso, nome_turma, data_inicio, data_fim) VALUES 
(1, 'TPSI-PAL-0525', '2025-11-03', '2026-07-15'), (1, 'TPSI-PAL-0626', '2026-01-10', '2026-09-20'),
(2, 'CIBER-2025', '2025-09-01', '2026-06-30'), (3, 'MEC-01', '2026-02-01', '2026-12-15'),
(4, 'ELET-01', '2025-10-01', '2026-05-30');

-- SALAS
INSERT INTO salas (descricao, num_max_alunos) VALUES 
('Lab 01', 20), ('Lab 02', 15), ('Sala Teórica 10', 25), ('Lab Eletrónica', 12), ('Auditório', 50);

-- ALOCAÇÕES (Quem dá o quê em cada turma)
INSERT INTO turma_alocacoes (id_turma, id_modulo, id_formador) VALUES 
(1, 1, 1), (1, 2, 2), (2, 1, 3), (3, 2, 4), (5, 4, 5);

-- INSCRIÇÕES
INSERT INTO inscricoes (id_formando, id_turma, data_inscricao, estado) VALUES 
(1, 1, '2025-10-01', 'Ativo'), (2, 1, '2025-10-05', 'Ativo'),
(3, 1, '2025-10-06', 'Ativo'), (4, 2, '2025-12-01', 'Ativo'), (5, 3, '2025-08-15', 'Ativo');

-- HORÁRIOS (Aulas marcadas para Janeiro 2026)
INSERT INTO horarios (id_turma, id_curso_modulo, id_formador, id_sala, data, hora_inicio, hora_fim) VALUES 
(1, 1, 1, 1, '2026-01-26', '09:00:00', '13:00:00'),
(1, 2, 2, 2, '2026-01-27', '14:00:00', '18:00:00'),
(3, 4, 4, 1, '2026-01-26', '14:00:00', '18:00:00'),
(5, 5, 5, 3, '2026-01-28', '09:00:00', '13:00:00'),
(1, 3, 1, 1, '2026-01-29', '09:00:00', '11:00:00');
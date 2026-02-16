DROP DATABASE sistema_gestao_hawk_portal;

CREATE DATABASE sistema_gestao_hawk_portal;
USE sistema_gestao_hawk_portal;

-- ESTRUTURA DE APOIO
CREATE TABLE areas (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

-- Tabela para ter salas para tipos de matérias
CREATE TABLE tipo_salas (
    id_tipo_sala INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

CREATE TABLE tipo_utilizadores (
    id_tipo_utilizador INT AUTO_INCREMENT PRIMARY KEY,
    tipo_utilizador VARCHAR(50) NOT NULL
);

CREATE TABLE escolaridades (
    id_escolaridade INT AUTO_INCREMENT PRIMARY KEY,
    nivel VARCHAR(100) NOT NULL
);

-- TIPO DE MATÉRIAS
CREATE TABLE tipo_materias (
    id_tipo_materia INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL
);

-- Tabela de ligação: Que tipos de matéria funcionam em que tipos de sala
CREATE TABLE materia_sala_compatibilidade (
    id_tipo_materia INT NOT NULL,
    id_tipo_sala INT NOT NULL,
    PRIMARY KEY (id_tipo_materia, id_tipo_sala),
    FOREIGN KEY (id_tipo_materia) REFERENCES tipo_materias(id_tipo_materia),
    FOREIGN KEY (id_tipo_sala) REFERENCES tipo_salas(id_tipo_sala)
);

-- UTILIZADORES (SOFT DELETE)
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
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_desativacao DATETIME NULL,
    FOREIGN KEY (id_tipo_utilizador) REFERENCES tipo_utilizadores(id_tipo_utilizador)
);

-- MÓDULOS (SOFT DELETE)
CREATE TABLE modulos (
    id_modulo INT AUTO_INCREMENT PRIMARY KEY,
    codigo_identificacao VARCHAR(20) UNIQUE,
    nome VARCHAR(100) NOT NULL,
    horas_totais INT NOT NULL,
    creditos DECIMAL(4,2) NOT NULL,
    id_tipo_materia INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_desativacao DATETIME NULL,
    FOREIGN KEY (id_tipo_materia) REFERENCES tipo_materias(id_tipo_materia)
);

-- SALAS
CREATE TABLE salas (
    id_sala INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(50) NOT NULL,
    num_max_alunos INT NOT NULL CHECK (num_max_alunos >= 5),
    id_tipo_sala INT NOT NULL,
    FOREIGN KEY (id_tipo_sala) REFERENCES tipo_salas(id_tipo_sala)
);

-- CURSOS (SOFT DELETE)
CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    id_area INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_desativacao DATETIME NULL,
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

CREATE TABLE metodologias_horarios (
    id_metodologia INT AUTO_INCREMENT PRIMARY KEY,
    nome ENUM('Diurno', 'Pós-Laboral') NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    pausa_refeicao_inicio TIME NOT NULL,
    pausa_refeicao_fim TIME NOT NULL
);

-- TURMAS (SOFT DELETE)
CREATE TABLE turmas (
    id_turma INT AUTO_INCREMENT PRIMARY KEY,
    id_curso INT NOT NULL,
    nome_turma VARCHAR(50) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_desativacao DATETIME NULL,
    id_metodologia INT NOT NULL,
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso),
    FOREIGN KEY (id_metodologia) REFERENCES metodologias_horarios(id_metodologia)
);

-- FORMADORES (SOFT DELETE)
CREATE TABLE formadores (
    id_formador INT AUTO_INCREMENT PRIMARY KEY,
    id_utilizador INT NOT NULL,
    iban VARCHAR(20),
    qualificacoes VARCHAR(255),
    fotografia MEDIUMBLOB,
    anexo_ficheiro MEDIUMBLOB,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_desativacao DATETIME NULL,
    FOREIGN KEY (id_utilizador) REFERENCES utilizadores(id_utilizador)
);

-- N:N FORMADORES <-> TIPO_MATÉRIAS
CREATE TABLE formadores_tipo_materias (
    id_formador INT NOT NULL,
    id_tipo_materia INT NOT NULL,
    PRIMARY KEY (id_formador, id_tipo_materia),
    FOREIGN KEY (id_formador) REFERENCES formadores(id_formador),
    FOREIGN KEY (id_tipo_materia) REFERENCES tipo_materias(id_tipo_materia)
);

-- FORMANDOS (SOFT DELETE)
CREATE TABLE formandos (
    id_formando INT AUTO_INCREMENT PRIMARY KEY,
    id_utilizador INT NOT NULL,
    id_escolaridade INT,
    fotografia MEDIUMBLOB,
    anexo_ficheiro MEDIUMBLOB,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_desativacao DATETIME NULL,
    FOREIGN KEY (id_utilizador) REFERENCES utilizadores(id_utilizador),
    FOREIGN KEY (id_escolaridade) REFERENCES escolaridades(id_escolaridade)
);

-- PLANEAMENTO
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

-- DISPONIBILIDADE DE FORMADORES
CREATE TABLE disponibilidade_formadores (
    id_disp_formador INT AUTO_INCREMENT PRIMARY KEY,
    id_formador INT NOT NULL,
    data_disponivel DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    FOREIGN KEY (id_formador) REFERENCES formadores(id_formador)
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
    UNIQUE (id_formador, data, hora_inicio),
    FOREIGN KEY (id_turma) REFERENCES turmas(id_turma),
    FOREIGN KEY (id_curso_modulo) REFERENCES cursos_modulos(id_curso_modulo),
    FOREIGN KEY (id_formador) REFERENCES formadores(id_formador),
    FOREIGN KEY (id_sala) REFERENCES salas(id_sala)
);

-- ÁREAS
INSERT INTO areas (nome) VALUES
('Informática'),
('Mecânica'),
('Eletrónica'),
('Gestão'),
('Automação');

-- Tipos de Salas
INSERT INTO tipo_salas (nome) VALUES
('Laboratório Informática'),
('Laboratório Técnico'),
('Sala Teórica'),
('Oficina'),
('Auditório'),
('Sala Polivalente'),
('Biblioteca'),
('Sala Reuniões'),
('Ginásio'),
('Online');

-- TIPOS DE UTILIZADOR
INSERT INTO tipo_utilizadores (tipo_utilizador) VALUES
('admin'),
('formador'),
('formando'),
('administrativo'),
('geral'),
('superadmin');

-- ESCOLARIDADES
INSERT INTO escolaridades (nivel) VALUES
('9º Ano'),
('12º Ano'),
('CTeSP'),
('Licenciatura'),
('Mestrado');

-- TIPO DE MATÉRIAS
INSERT INTO tipo_materias (tipo) VALUES
('Programação'),
('Redes'),
('Sistemas'),
('Bases de Dados'),
('Segurança'),
('Gestão'),
('Cloud & DevOps'),
('IA & Data Science'),
('Design & Multimédia'),
('Governança & Qualidade'),
('Gerais (ex: Linguas, Matemática, Inglês)');

INSERT INTO metodologias_horarios (nome, horario_inicio, horario_fim, pausa_refeicao_inicio, pausa_refeicao_fim) VALUES
('Diurno', '09:00:00', '16:00:00', '12:00:00', '13:00:00'),
('Pós-Laboral', '16:00:00', '23:00:00', '19:00:00', '20:00:00');

-- Ligaçao tipos de materia com tipos de sala
INSERT INTO materia_sala_compatibilidade (id_tipo_materia, id_tipo_sala) VALUES
(1, 1), (1, 10),
(2, 1), (2, 2), (2, 10),
(3, 1), (3, 10),
(4, 1), (4, 10),
(5, 1), (5, 2), (5, 10),
(6, 3), (6, 5), (6, 6), (6, 8), (6, 10),
(7, 1), (7, 10),
(8, 1), (8, 10),
(9, 1), (9, 5), (9, 10),
(10, 3), (10, 5), (10, 7), (10, 8), (10, 10),
(11, 3), (11 , 10);

-- UTILIZADORES
INSERT INTO utilizadores
(nome, nif, data_nascimento, morada, telefone, sexo, email, password_hash, id_google, id_facebook, id_tipo_utilizador, status_ativacao, token_ativacao, ativo, data_desativacao)
VALUES
('SuperAdmin','999666555','1975-03-10','Palmela','999456123','Masculino','superadmin@atec.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,6,1,'tok_001',TRUE,NULL),
('Admin','999666554','1975-03-10','Palmela','999456122','Masculino','admin@atec.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,1,1,'tok_001',TRUE,NULL),
('Carlos Professor','111222333','1975-03-10','Palmela','912300001','Masculino','carlos@atec.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,2,1,'tok_001',TRUE,NULL),
('Ana Docente','222333444','1982-07-22','Setúbal','912300002','Feminino','ana@atec.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,2,1,'tok_002',TRUE,NULL),
('Leonor Joaquim','333444555','1978-11-05','Lisboa','912300003','Feminino','bruno@atec.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,2,1,'tok_003',TRUE,NULL),
('Daniela Instrutora','444555666','1985-01-30','Azeitão','912300004','Feminino','daniela@atec.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,2,1,'tok_004',TRUE,NULL),
('Eduardo Formador','555666777','1980-12-12','Pinhal Novo','912300005','Masculino','eduardo@atec.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,2,1,'tok_005',TRUE,NULL),
('Maria Aluna','999888777','2001-05-20','Palmela','913400001','Feminino','maria@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_006',TRUE,NULL),
('José Silva','888777666','2000-09-15','Moita','913400002','Masculino','jose@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_007',TRUE,NULL),
('Sara Santos','777666555','1999-02-28','Montijo','913400003','Feminino','sara@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_008',TRUE,NULL), 
('Pedro Rocha','666555444','2002-11-11','Palmela','913400004','Masculino','pedro@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_009',TRUE,NULL), 
('Inês Costa','555444333','2001-08-05','Setúbal','913400005','Feminino','ines@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_010',TRUE,NULL),
('André Ferreira','700000001','2002-01-01','Setúbal','913400006','Masculino','andre.1@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_011',TRUE,NULL),
('Beatriz Gomes','700000002','2001-02-02','Moita','913400007','Feminino','beatriz.2@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_012',TRUE,NULL),
('Cláudio Lima','700000003','2000-03-03','Montijo','913400008','Masculino','claudio.3@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_013',TRUE,NULL),
('Diana Santos','700000004','2002-04-04','Barreiro','913400009','Feminino','diana.4@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_014',TRUE,NULL),
('Eduardo Silva','700000005','2001-05-05','Almada','913400010','Masculino','eduardo.5@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_015',TRUE,NULL),
('Francisca Costa','700000006','2000-06-06','Seixal','913400011','Feminino','francisca.6@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_016',TRUE,NULL),
('Gabriel Rodrigues','700000007','2002-07-07','Setúbal','913400012','Masculino','gabriel.7@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_017',TRUE,NULL),
('Helena Martins','700000008','2001-08-08','Moita','913400013','Feminino','helena.8@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_018',TRUE,NULL),
('Igor Pereira','700000009','2000-09-09','Montijo','913400014','Masculino','igor.9@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_019',TRUE,NULL), 
('Joana Alves','700000010','2002-10-10','Barreiro','913400015','Feminino','joana.10@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_020',TRUE,NULL),
('Kevin Sousa','700000011','2001-11-11','Almada','913400016','Masculino','kevin.11@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_021',TRUE,NULL),
('Laura Fernandes','700000012','2000-12-12','Seixal','913400017','Feminino','laura.12@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_022',TRUE,NULL),
('Miguel Oliveira','700000013','2002-01-13','Setúbal','913400018','Masculino','miguel.13@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_023',TRUE,NULL),
('Nádia Ribeiro','700000014','2001-02-14','Moita','913400019','Feminino','nadia.14@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_024',TRUE,NULL),
('Orlando Carvalho','700000015','2000-03-15','Montijo','913400020','Masculino','orlando.15@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_025',TRUE,NULL),
('Paula Teixeira','700000016','2002-04-16','Barreiro','913400021','Feminino','paula.16@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_026',TRUE,NULL),
('Quintino Lopes','700000017','2001-05-17','Almada','913400022','Masculino','quintino.17@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_027',TRUE,NULL),
('Rita Mendes','700000018','2000-06-18','Seixal','913400023','Feminino','rita.18@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_028',TRUE,NULL),
('Sérgio Pinto','700000019','2002-07-19','Setúbal','913400024','Masculino','sergio.19@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_029',TRUE,NULL), 
('Tatiana Moreira','700000020','2001-08-20','Moita','913400025','Feminino','tatiana.20@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_030',TRUE,NULL),
('Ulisses Nunes','700000021','2000-09-21','Montijo','913400026','Masculino','ulisses.21@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_031',TRUE,NULL),
('Vera Correia','700000022','2002-10-22','Barreiro','913400027','Feminino','vera.22@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_032',TRUE,NULL),
('Wagner Dias','700000023','2001-11-23','Almada','913400028','Masculino','wagner.23@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_033',TRUE,NULL),
('Xavier Barros','700000024','2000-12-24','Seixal','913400029','Masculino','xavier.24@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_034',TRUE,NULL),
('Yara Azevedo','700000025','2002-01-25','Setúbal','913400030','Feminino','yara.25@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_035',TRUE,NULL),
('Zélia Campos','700000026','2001-02-26','Moita','913400031','Feminino','zelia.26@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_036',TRUE,NULL),
('Afonso Ramos','700000027','2000-03-27','Montijo','913400032','Masculino','afonso.27@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_037',TRUE,NULL),
('Bruna Freitas','700000028','2002-04-28','Barreiro','913400033','Feminino','bruna.28@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_038',TRUE,NULL),
('Carlos Machado','700000029','2001-05-29','Almada','913400034','Masculino','carlos.29@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_039',TRUE,NULL),
('Daniela Duarte','700000030','2000-06-30','Seixal','913400035','Feminino','daniela.30@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_040',TRUE,NULL),
('Ernesto Vieira','700000031','2002-07-01','Setúbal','913400036','Masculino','ernesto.31@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_041',TRUE,NULL),
('Fátima Castro','700000032','2001-08-02','Moita','913400037','Feminino','fatima.32@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_042',TRUE,NULL),
('Gonçalo Cunha','700000033','2000-09-03','Montijo','913400038','Masculino','goncalo.33@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_043',TRUE,NULL),
('Hugo Monteiro','700000034','2002-10-04','Barreiro','913400039','Masculino','hugo.34@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_044',TRUE,NULL),
('Inês Marques','700000035','2001-11-05','Almada','913400040','Feminino','ines.35@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_045',TRUE,NULL),
('Jorge Simões','700000036','2000-12-06','Seixal','913400041','Masculino','jorge.36@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_046',TRUE,NULL),
('Karina Batista','700000037','2002-01-07','Setúbal','913400042','Feminino','karina.37@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,3,1,'tok_047',TRUE,NULL),
('Luís Fonseca','700000038','2001-02-08','Moita','913400043','Masculino','luis.38@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,2,1,'tok_048',TRUE,NULL),
('Mariana Coelho','700000039','2000-03-09','Montijo','913400044','Feminino','mariana.39@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,2,1,'tok_049',TRUE,NULL),
('Nelson Pires','700000040','2002-04-10','Barreiro','913400045','Masculino','nelson.40@student.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,2,1,'tok_050',TRUE,NULL),
('Rui Matos','666777888','1976-04-12','Lisboa','914500001','Masculino','rui.matos@atec.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,2,1,'tok_051',TRUE,NULL), 
('Sofia Pacheco','777888999','1984-09-18','Setúbal','914500002','Feminino','sofia.pacheco@atec.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,2,1,'tok_052',TRUE,NULL),
('Miguel Correia','888999000','1979-06-25','Almada','914500003','Masculino','miguel.correia@atec.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,2,1,'tok_053',TRUE,NULL),
('Patrícia Lopes','999000111','1987-02-14','Barreiro','914500004','Feminino','patricia.lopes@atec.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,2,1,'tok_054',TRUE,NULL),
('João Neves','111000222','1974-12-03','Montijo','914500005','Masculino','joao.neves@atec.pt','$2a$11$3G0SkkSZ4nd/dom.qeEpRuUJtqamKATGYVC4JD5j6v2.SnKwfmqne',NULL,NULL,2,1,'tok_055',TRUE,NULL);

-- FORMADORES (Ligar aos primeiros 7 utilizadores)
INSERT INTO formadores (id_utilizador, iban, qualificacoes) VALUES 
(3, 'PT500003', 'Especialista Redes'),
(4, 'PT500004', 'Doutorada em IA'),
(5, 'PT500005', 'Certificação Cisco'),
(6, 'PT500006', 'Licenciado em Informática'),
(7, 'PT500007', 'Especialista em Bases de Dados'),
(50, 'PT600001', 'Especialista DevOps'),
(51, 'PT600001', 'Especialista Cloud'),
(52, 'PT600003', 'Engenheiro de Software'),
(53, 'PT600004', 'Especialista WebDesign'),
(54, 'PT600004', 'Especialista Desenvolvimento Web'),
(55, 'PT600004', 'Especialista Desenvolvimento Software'),
(56, 'PT600004', 'Especialista Cibersegurança'),
(57, 'PT600005', 'Administrador de Sistemas');

-- FORMANDOS
INSERT INTO formandos (id_utilizador, id_escolaridade) VALUES 
(8, 2), (9, 2), (10, 3), (11, 2), (12, 4),
(13, 2), (14, 3), (15, 2), (16, 4), (17, 2),
(18, 3), (19, 2), (20, 4), (21, 2), (22, 3),
(23, 2), (24, 4), (25, 2), (26, 3), (27, 2),
(28, 4), (29, 2), (30, 3), (31, 2), (32, 4),
(33, 2), (34, 3), (35, 2), (36, 4), (37, 2),
(38, 3), (39, 2), (40, 4), (41, 2), (42, 3),
(43, 2), (44, 4), (45, 2), (46, 3), (47, 2),
(48, 4), (49, 2);

-- MÓDULOS (UFCDs comuns)
INSERT INTO modulos (codigo_identificacao, nome, horas_totais, creditos, id_tipo_materia) VALUES
-- Programação
('UFCD0778','Algoritmos',50,4.5,1),
('UFCD0804','Algoritmos Avançados',50,4.5,1),
('UFCD0785','Programação Orientada a Objetos',50,4.5,1),
('UFCD0786','Estruturas de Dados',50,4.5,1),
('UFCD0789','Desenvolvimento Web',50,4.5,1),
('UFCD0807','Programação Python',50,4.5,1),
('UFCD0808','Programação Java',50,4.5,1),
('UFCD0809','Programação C#',50,4.5,1),
('UFCD0810','JavaScript Avançado',50,4.5,1),
('UFCD0813','API REST',25,2.5,1),

-- Bases de Dados
('UFCD0782','SQL',50,4.5,4),
('UFCD0790','Bases de Dados',50,4.5,4),
('UFCD0831','Modelação de Dados',25,2.5,4),
('UFCD0832','Data Warehousing',50,4.5,4),
('UFCD0833','ETL Processes',25,2.5,4),
('UFCD0834','NoSQL Databases',50,4.5,4),
('UFCD0835','MongoDB',25,2.5,4),
('UFCD0836','Redis',25,2.5,4),

-- Sistemas
('UFCD5412','Sistemas Operativos',25,2.5,3),
('UFCD0818','Linux Avançado',50,4.5,3),
('UFCD0819','Windows Server',50,4.5,3),
('UFCD0820','Virtualização',25,2.5,3),

-- Redes
('UFCD0787','Redes de Computadores',50,4.5,2),
('UFCD0821','Administração de Redes',50,4.5,2),
('UFCD0822','Firewall e VPN',25,2.5,2),

-- Segurança
('UFCD0788','Segurança Informática',50,4.5,5),
('UFCD0823','Ethical Hacking',50,4.5,5),
('UFCD0824','Forense Digital',25,2.5,5),
('UFCD0825','GDPR e Proteção de Dados',25,2.0,5),
('UFCD0879','ISO 27001',25,2.0,5),

-- Cloud & DevOps
('UFCD0796','Cloud Computing',50,4.5,7),
('UFCD0797','DevOps',50,4.5,7),
('UFCD0815','Docker e Containers',25,2.5,7),
('UFCD0816','Kubernetes',25,2.5,7),

-- IA & Data
('UFCD0798','Machine Learning',50,4.5,8),
('UFCD0799','Big Data',50,4.5,8),
('UFCD0826','Análise de Dados',50,4.5,8),
('UFCD0827','Data Mining',50,4.5,8),
('UFCD0828','Business Intelligence',50,4.5,8),
('UFCD0844','Deep Learning',50,4.5,8),

-- Design & Multimédia
('UFCD0801','Interface Design',25,2.5,9),
('UFCD0857','Fotografia Digital',25,2.5,9),
('UFCD0858','Adobe Photoshop',25,2.5,9),
('UFCD0859','Adobe Illustrator',25,2.5,9),
('UFCD0862','UX/UI Design',50,4.5,9),

-- Gestão 
('UFCD0123','Ética Profissional',25,2.0,6),
('UFCD0795','Gestão de Projetos',25,2.5,6),
('UFCD0874','Scrum',25,2.5,6),
('UFCD0875','Agile',25,2.5,6),
('UFCD0876','Kanban',25,2.0,6),
('UFCD0877','ITIL',25,2.5,10),
('UFCD0878','COBIT',25,2.5,10),
('UFCD0880','Auditoria de Sistemas',50,4.5,10),
('UFCD0881','Compliance',25,2.0,10),
('UFCD0882','Governança de TI',25,2.5,10);


-- N:N FORMANDOS <-> TIPO_MATÉRIAS
INSERT INTO formadores_tipo_materias (id_formador, id_tipo_materia) VALUES
-- Carlos Professor
(1,1),(1,2),(1,3),(1,4),

-- Ana Docente
(2,1),(2,2),(2,3),(2,4),

-- Leonor Joaquim
(3,2),(3,3),(3,1),(3,4),(3,5),

-- Daniela Instrutora
(4,1),(4,2),(4,3),(4,4),(4,5),(4,6),(4,7),(4,8),

-- Eduardo Formador
(5,1),(5,2),(5,3),(5,4),(5,5),(5,6),(5,7),(5,8),(5,9),(5,10),(5,11),

-- Luís Fonseca
(6,1),(6,2),(6,3),(6,4),(6,5),(6,6),(6,7),(6,8),

-- Mariana Coelho
(7,1),(7,2),(7,3),(7,4),(7,5),(7,6),(7,7),(7,8),

-- Nelson Pires
(8,4),(8,5),(8,6),(8,7),(8,8),(8,9),(8,10),(8,11),

-- Rui Matos
(9,4),(9,5),(9,6),(9,7),(9,8),(9,9),(9,10),(9,11),

-- Sofia Pacheco
(10,4),(10,5),(10,6),(10,7),(10,8),(10,9),(10,10),(10,11),

-- Miguel Correia
(11,4),(11,5),(11,6),(11,7),(11,8),(11,9),(11,10),(11,11),

-- Patricia Lopes
(12,7),(12,8),(12,9),(12,10),(12,11),

-- João Neves
(13,8),(13,9),(13,10),(13,11);

-- CURSOS
INSERT INTO cursos (id_area, nome, descricao) VALUES 
(1, 'TPSI - Programação', 'Especialista em Tecnologias e Programação'),
(1, 'Cibersegurança', 'Gestão de Redes'),
(2, 'Mecânica Industrial', 'Manutenção Automóvel'), 
(3, 'Eletrónica Aplicada', 'Circuitos'), 
(4, 'Gestão Escolar', 'Secretariado'),
(5, 'Automação - Máquinas', 'Gerir circuitos de máquinas');

-- MATRIZ DE CURSOS
INSERT INTO cursos_modulos (id_curso, id_modulo, prioridade) VALUES 
-- CURSO 1: TPSI - Programação
(1, 1, 1),
(1, 2, 1),
(1, 3, 2),
(1, 4, 1),
(1, 5, 4),
(1, 6, 2),
(1, 7, 2),
(1, 8, 3),
(1, 9, 5),
(1, 10, 1),
(1, 11, 1),
(1, 12, 2),
(1, 13, 2),
(1, 14, 3),
(1, 15, 2),
(1, 16, 3),
(1, 17, 2),
(1, 18, 2),
(1, 19, 3),
(1, 20, 3),
(1, 21, 2),
(1, 22, 2),

-- CURSO 2: Cibersegurança
(2, 2, 1),
(2, 8, 1),
(2, 9, 1),
(2, 22, 2),
(2, 23, 2),
(2, 24, 2),
(2, 25, 2),
(2, 26, 2),
(2, 27, 3),
(2, 28, 3),
(2, 29, 4),
(2, 30, 5),

-- CURSO 3: Mecânica Industrial
(3, 3, 1),
(3, 5, 1),
(3, 12, 2),
(3, 40, 2),
(3, 41, 2),
(3, 42, 2),
(3, 43, 3),
(3, 44, 3),
(3, 45, 3),

-- CURSO 4: Eletrónica Aplicada
(4, 3, 1),
(4, 4, 1),
(4, 5, 1),
(4, 12, 1),
(4, 38, 2),
(4, 39, 2),
(4, 40, 3),
(4, 41, 4),
(4, 42, 4),

-- CURSO 5: Gestão Escolar
(5, 5, 1),
(5, 15, 1),
(5, 16, 2),
(5, 17, 3),
(5, 18, 3),
(5, 19, 3),
(5, 20, 4);


-- TURMAS
INSERT INTO turmas (id_curso, nome_turma, data_inicio, data_fim, id_metodologia) VALUES 
(1, 'TPSI-PAL-0525', '2025-11-03', '2026-07-15', 1), 
(1, 'TPSI-PAL-0626', '2026-01-10', '2026-09-20', 1),
(2, 'CIBER-2025', '2025-09-01', '2026-06-30', 1), 
(3, 'MEC-01', '2026-02-01', '2026-12-15', 1),
(1, 'TPSI-PAL-0726', '2026-02-17', '2028-01-30', 2),
(2, 'CIBER-2026', '2026-03-01', '2028-03-30', 2),
(3, 'MEC-02', '2026-03-01', '2028-05-30', 2),
(4, 'Gestão-01', '2026-04-01', '2028-05-30', 2);

-- SALAS
INSERT INTO salas (descricao, num_max_alunos, id_tipo_sala) VALUES 
-- Laboratórios Informática
('Lab 01', 20, 1),
('Lab 02', 20, 1),
('Lab 03', 18, 1),
('Lab 04', 22, 1),

-- Laboratórios Técnicos
('Lab Redes e Sistemas', 16, 2),
('Lab Hardware', 15, 2),
('Lab Eletrónica', 12, 2),
('Lab Robótica', 14, 2),
('Lab Automação', 12, 2),
('Lab Química', 16, 2),
('Lab Física', 18, 2),
('Atelier Design', 15, 2),
('Estúdio Multimédia', 14, 2),

-- Oficinas
('Oficina Soldadura', 10, 4),
('Oficina Mecânica', 12, 4),

-- Salas Teóricas
('Sala Teórica 01', 30, 3),
('Sala Teórica 02', 30, 3),
('Sala Teórica 03', 28, 3),
('Sala Teórica 04', 25, 3),
('Sala Teórica 05', 25, 3),
('Sala Teórica 06', 32, 3),
('Sala Teórica 07', 28, 3),
('Sala Teórica 08', 30, 3),

-- Espaços grandes
('Auditório', 50, 5),
('Sala Polivalente', 35, 6),

-- Apoio
('Sala Reuniões', 12, 8),
('Biblioteca', 40, 7),
('Sala Estudo', 20, 7),
('Sala Tutoria', 8, 8),

-- Outros
('Ginásio', 25, 9),
('Online', 200, 10);


-- ALOCAÇÕES (Quem dá o quê em cada turma)
INSERT INTO turma_alocacoes (id_turma, id_modulo, id_formador) VALUES 
(1, 1, 1),
(1, 2, 2),
(1, 3, 3),
(1, 4, 4),
(1, 5, 5),
(1, 6, 1),
(1, 7, 2),
(1, 8, 3),
(1, 9, 4),
(1, 10, 5),
(1, 11, 1),
(1, 12, 2),
(1, 13, 3),
(1, 14, 4),
(1, 15, 5),
(1, 16, 6),
(1, 17, 7),
(1, 18, 1),
(1, 19, 2),
(1, 20, 3),
(1, 21, 4),
(1, 22, 5),

(2, 1, 3),
(2, 2, 4),
(2, 3, 5),
(2, 4, 6),
(2, 5, 7),
(2, 6, 3),
(2, 7, 4),
(2, 8, 5),
(2, 9, 6),
(2, 10, 7),
(2, 11, 3),
(2, 12, 4),
(2, 13, 5),
(2, 14, 6),
(2, 15, 7),
(2, 16, 1),
(2, 17, 2),
(2, 18, 3),
(2, 19, 4),
(2, 20, 5),
(2, 21, 6),
(2, 22, 7),

(3, 2, 2),
(3, 8, 3),
(3, 9, 4),
(3, 22, 5),
(3, 23, 6),
(3, 24, 7),
(3, 25, 1),
(3, 26, 3),
(3, 27, 4),
(3, 28, 5),
(3, 29, 6),
(3, 30, 7),

(4, 3, 1),
(4, 5, 5),
(4, 12, 2),
(4, 40, 11),
(4, 41, 8),
(4, 42, 9),
(4, 43, 10),
(4, 44, 11),
(4, 45, 12),

(5, 3, 2),
(5, 4, 4),
(5, 5, 5),
(5, 12, 1),
(5, 38, 7),
(5, 39, 8),
(5, 40, 9),
(5, 41, 13),
(5, 42, 12),
(5, 43, 11),
(5, 44, 10),
(5, 45, 9);

-- INSCRIÇÕES
INSERT INTO inscricoes (id_formando, id_turma, data_inscricao, estado) VALUES 
-- Turma 1: TPSI-PAL-0525
(1, 1, '2025-10-01', 'Ativo'),
(2, 1, '2025-10-02', 'Ativo'),
(3, 1, '2025-10-03', 'Ativo'),
(4, 1, '2025-10-04', 'Ativo'),
(5, 1, '2025-10-05', 'Ativo'),
(6, 1, '2025-10-06', 'Ativo'),
(7, 1, '2025-10-07', 'Ativo'),
(8, 1, '2025-10-08', 'Ativo'),
(9, 1, '2025-10-09', 'Ativo'),
(10, 1, '2025-10-10', 'Ativo'),

-- Turma 2: TPSI-PAL-0626
(11, 2, '2025-10-11', 'Ativo'),
(12, 2, '2025-10-12', 'Ativo'),
(13, 2, '2025-10-13', 'Ativo'),
(14, 2, '2025-10-14', 'Ativo'),
(15, 2, '2025-10-15', 'Ativo'),
(16, 2, '2025-12-01', 'Ativo'),
(17, 2, '2025-12-02', 'Ativo'),
(18, 2, '2025-12-03', 'Ativo'),
(19, 2, '2025-12-04', 'Ativo'),
(20, 2, '2025-12-05', 'Ativo'),
(21, 2, '2025-12-06', 'Ativo'),

-- Turma 3: CIBER-2025
(22, 3, '2025-12-07', 'Ativo'),
(23, 3, '2025-12-08', 'Ativo'),
(24, 3, '2025-12-09', 'Ativo'),
(25, 3, '2025-12-10', 'Ativo'),
(26, 3, '2025-12-11', 'Ativo'),
(27, 3, '2025-12-12', 'Ativo'),
(28, 3, '2025-08-01', 'Ativo'),
(29, 3, '2025-08-02', 'Ativo'),
(30, 3, '2025-08-03', 'Ativo'),
(31, 3, '2025-08-04', 'Ativo'),
(32, 3, '2025-08-05', 'Ativo'),

-- Turma 4: MEC-01 
(33, 4, '2025-08-06', 'Ativo'),
(34, 4, '2025-08-07', 'Ativo'),
(35, 4, '2025-08-08', 'Ativo'),
(36, 4, '2025-08-09', 'Ativo'),
(37, 4, '2025-08-10', 'Ativo'),
(38, 4, '2025-08-11', 'Ativo'),
(39, 4, '2025-08-12', 'Ativo'),
(40, 4, '2025-08-13', 'Ativo'),
(41, 4, '2026-01-10', 'Ativo'),
(42, 4, '2026-01-11', 'Ativo');

-- HORÁRIOS
INSERT INTO horarios (id_turma, id_curso_modulo, id_formador, id_sala, data, hora_inicio, hora_fim) VALUES
-- TURMA 1
(1, 1, 1, 1, '2026-01-26', '09:00:00', '13:00:00'),
(1, 2, 2, 2, '2026-01-26', '14:00:00', '18:00:00'),

-- TURMA 2
(2, 3, 3, 4, '2026-01-28', '09:00:00', '13:00:00'),
(2, 3, 3, 4, '2026-01-29', '09:00:00', '13:00:00'),
(2, 3, 3, 4, '2026-01-30', '09:00:00', '13:00:00'),
(2, 4, 4, 5, '2026-02-02', '14:00:00', '18:00:00'),

-- TURMA 3
(3, 5, 2, 7, '2026-01-26', '09:00:00', '13:00:00'),
(3, 6, 1, 8, '2026-01-26', '14:00:00', '18:00:00'),

-- TURMA 5
(5, 7, 7, 20, '2026-01-26', '09:00:00', '13:00:00'),
(5, 8, 5, 21, '2026-01-26', '14:00:00', '18:00:00'),

-- FEVEREIRO
(1, 9, 8, 1, '2026-02-16', '09:00:00', '13:00:00'),
(1, 9, 8, 1, '2026-02-17', '09:00:00', '13:00:00'),
(1, 10, 9, 2, '2026-02-18', '14:00:00', '18:00:00'),
(1, 10, 9, 2, '2026-02-19', '14:00:00', '18:00:00'),

(2, 11, 11, 3, '2026-02-16', '09:00:00', '13:00:00'),
(2, 11, 11, 3, '2026-02-17', '09:00:00', '13:00:00'),
(2, 12, 12, 4, '2026-02-18', '14:00:00', '18:00:00'),

(3, 13, 9, 5, '2026-02-16', '09:00:00', '13:00:00'),
(3, 14, 10, 6, '2026-02-17', '14:00:00', '18:00:00'),
(3, 15, 11, 7, '2026-02-18', '09:00:00', '13:00:00');


-- AVALIAÇÕES
INSERT INTO avaliacoes (`id_avaliacao`, `id_inscricao`, `id_modulo`, `nota`, `data_avaliacao`) VALUES 
-- Turma 1: TPSI-PAL-0525 - Formando 1
('1', '1', '1', '17.50', '2025-11-15'),
('2', '1', '2', '16.75', '2025-11-20'),
('3', '1', '3', '18.00', '2025-11-25'),
('4', '1', '4', '15.50', '2025-12-02'),
('5', '1', '5', '17.25', '2025-12-10'),

-- Turma 1: TPSI-PAL-0525 - Formando 2
('6', '2', '1', '14.80', '2025-11-15'),
('7', '2', '2', '16.00', '2025-11-20'),
('8', '2', '3', '15.50', '2025-11-25'),
('9', '2', '4', '17.00', '2025-12-02'),
('10', '2', '5', '16.50', '2025-12-10'),

-- Turma 1: TPSI-PAL-0525 - Formando 3
('11', '3', '1', '19.00', '2025-11-15'),
('12', '3', '2', '18.50', '2025-11-20'),
('13', '3', '3', '19.25', '2025-11-25'),
('14', '3', '4', '18.75', '2025-12-02'),
('15', '3', '5', '19.50', '2025-12-10'),

-- Turma 1: TPSI-PAL-0525 - Formando 4
('16', '4', '1', '13.50', '2025-11-15'),
('17', '4', '2', '14.25', '2025-11-20'),
('18', '4', '3', '12.75', '2025-11-25'),
('19', '4', '4', '15.00', '2025-12-02'),
('20', '4', '5', '14.50', '2025-12-10'),

-- Turma 1: TPSI-PAL-0525 - Formando 5
('21', '5', '1', '16.25', '2025-11-15'),
('22', '5', '2', '17.50', '2025-11-20'),
('23', '5', '3', '16.75', '2025-11-25'),
('24', '5', '4', '18.00', '2025-12-02'),
('25', '5', '5', '17.00', '2025-12-10'),

-- Turma 1: TPSI-PAL-0525 - Formando 6
('26', '6', '1', '15.75', '2025-11-15'),
('27', '6', '2', '16.50', '2025-11-20'),
('28', '6', '3', '17.25', '2025-11-25'),
('29', '6', '4', '16.00', '2025-12-02'),
('30', '6', '5', '15.50', '2025-12-10'),

-- Turma 1: TPSI-PAL-0525 - Formando 7
('31', '7', '1', '18.50', '2025-11-15'),
('32', '7', '2', '19.00', '2025-11-20'),
('33', '7', '3', '18.75', '2025-11-25'),
('34', '7', '4', '19.25', '2025-12-02'),
('35', '7', '5', '18.00', '2025-12-10'),

-- Turma 1: TPSI-PAL-0525 - Formando 8
('36', '8', '1', '12.50', '2025-11-15'),
('37', '8', '2', '13.75', '2025-11-20'),
('38', '8', '3', '14.00', '2025-11-25'),
('39', '8', '4', '13.25', '2025-12-02'),
('40', '8', '5', '12.75', '2025-12-10'),

-- Turma 1: TPSI-PAL-0525 - Formando 9
('41', '9', '1', '17.00', '2025-11-15'),
('42', '9', '2', '16.25', '2025-11-20'),
('43', '9', '3', '17.50', '2025-11-25'),
('44', '9', '4', '16.75', '2025-12-02'),
('45', '9', '5', '18.00', '2025-12-10'),

-- Turma 1: TPSI-PAL-0525 - Formando 10
('46', '10', '1', '14.00', '2025-11-15'),
('47', '10', '2', '15.50', '2025-11-20'),
('48', '10', '3', '14.75', '2025-11-25'),
('49', '10', '4', '15.25', '2025-12-02'),
('50', '10', '5', '16.00', '2025-12-10'),

-- Turma 2: TPSI-PAL-0626 - Formando 16
('51', '16', '1', '16.50', '2026-01-20'),
('52', '16', '2', '17.25', '2026-01-25'),
('53', '16', '3', '16.00', '2026-01-28'),

-- Turma 2: TPSI-PAL-0626 - Formando 17
('54', '17', '1', '18.75', '2026-01-20'),
('55', '17', '2', '19.00', '2026-01-25'),
('56', '17', '3', '18.50', '2026-01-28'),

-- Turma 2: TPSI-PAL-0626 - Formando 18
('57', '18', '1', '15.25', '2026-01-20'),
('58', '18', '2', '14.75', '2026-01-25'),
('59', '18', '3', '16.00', '2026-01-28'),

-- Turma 2: TPSI-PAL-0626 - Formando 19
('60', '19', '1', '17.50', '2026-01-20'),
('61', '19', '2', '18.00', '2026-01-25'),
('62', '19', '3', '17.25', '2026-01-28'),

-- Turma 2: TPSI-PAL-0626 - Formando 20
('63', '20', '1', '13.75', '2026-01-20'),
('64', '20', '2', '14.50', '2026-01-25'),
('65', '20', '3', '13.25', '2026-01-28'),

-- Turma 3: CIBER-2025 - Formando 28
('66', '28', '2', '18.00', '2025-09-15'),
('67', '28', '8', '17.50', '2025-09-20'),
('68', '28', '9', '19.00', '2025-09-25'),
('69', '28', '22', '18.25', '2025-10-05'),

-- Turma 3: CIBER-2025 - Formando 29
('70', '29', '2', '16.50', '2025-09-15'),
('71', '29', '8', '17.00', '2025-09-20'),
('72', '29', '9', '16.25', '2025-09-25'),
('73', '29', '22', '17.50', '2025-10-05'),

-- Turma 3: CIBER-2025 - Formando 30
('74', '30', '2', '19.50', '2025-09-15'),
('75', '30', '8', '19.00', '2025-09-20'),
('76', '30', '9', '18.75', '2025-09-25'),
('77', '30', '22', '19.25', '2025-10-05'),

-- Turma 3: CIBER-2025 - Formando 31
('78', '31', '2', '14.75', '2025-09-15'),
('79', '31', '8', '15.50', '2025-09-20'),
('80', '31', '9', '14.25', '2025-09-25'),
('81', '31', '22', '15.00', '2025-10-05'),

-- Turma 3: CIBER-2025 - Formando 32
('82', '32', '2', '17.25', '2025-09-15'),
('83', '32', '8', '18.00', '2025-09-20'),
('84', '32', '9', '17.75', '2025-09-25'),
('85', '32', '22', '16.50', '2025-10-05');


-- DISPONIBILIDADE DE FORMADORES
INSERT INTO disponibilidade_formadores (id_formador, data_disponivel, hora_inicio, hora_fim) VALUES 
-- Formador 1 
(1, '2026-02-19', '09:00:00', '13:00:00'),
(1, '2026-02-19', '14:00:00', '18:00:00'),
(1, '2026-02-20', '09:00:00', '13:00:00'),
(1, '2026-02-20', '09:00:00', '11:00:00'),
(1, '2026-02-23', '14:00:00', '18:00:00'),
(1, '2026-02-23', '14:00:00', '18:00:00'),
(1, '2026-02-24', '14:00:00', '18:00:00'),
(1, '2026-02-24', '14:00:00', '18:00:00'),
(1, '2026-02-25', '09:00:00', '13:00:00'),
(1, '2026-02-26', '09:00:00', '11:00:00'),
(1, '2026-02-26', '09:00:00', '13:00:00'),
(1, '2026-02-27', '09:00:00', '13:00:00'),
(1, '2026-02-27', '09:00:00', '13:00:00'),
(1, '2026-03-02', '14:00:00', '18:00:00'),
(1, '2026-03-02', '09:00:00', '13:00:00'),
(1, '2026-03-03', '09:00:00', '13:00:00'),
(1, '2026-03-03', '14:00:00', '18:00:00'),

-- Formador 4
(4, '2026-02-19', '09:00:00', '13:00:00'),
(4, '2026-02-19', '14:00:00', '18:00:00'),
(4, '2026-02-20', '09:00:00', '13:00:00'),
(4, '2026-02-20', '09:00:00', '11:00:00'),
(4, '2026-02-23', '14:00:00', '18:00:00'),
(4, '2026-02-23', '14:00:00', '18:00:00'),
(4, '2026-02-24', '14:00:00', '18:00:00'),
(4, '2026-02-24', '14:00:00', '18:00:00'),
(4, '2026-02-25', '09:00:00', '13:00:00'),
(4, '2026-02-26', '09:00:00', '11:00:00'),
(4, '2026-02-26', '09:00:00', '13:00:00'),
(4, '2026-02-27', '09:00:00', '13:00:00'),
(4, '2026-02-27', '09:00:00', '13:00:00'),
(4, '2026-03-02', '14:00:00', '18:00:00'),
(4, '2026-03-02', '09:00:00', '13:00:00'),
(4, '2026-03-03', '09:00:00', '13:00:00'),
(4, '2026-03-03', '14:00:00', '18:00:00'),


-- Formador 9
(9, '2026-02-19', '09:00:00', '13:00:00'),
(9, '2026-02-19', '14:00:00', '18:00:00'),
(9, '2026-02-20', '09:00:00', '13:00:00'),
(9, '2026-02-20', '09:00:00', '11:00:00'),
(9, '2026-02-23', '14:00:00', '18:00:00'),
(9, '2026-02-23', '14:00:00', '18:00:00'),
(9, '2026-02-24', '14:00:00', '18:00:00'),
(9, '2026-02-24', '14:00:00', '18:00:00'),
(9, '2026-02-25', '09:00:00', '13:00:00'),
(9, '2026-02-26', '09:00:00', '11:00:00'),
(9, '2026-02-26', '09:00:00', '13:00:00'),
(9, '2026-02-27', '09:00:00', '13:00:00'),
(9, '2026-02-27', '09:00:00', '13:00:00'),
(9, '2026-03-02', '14:00:00', '18:00:00'),
(9, '2026-03-02', '09:00:00', '13:00:00'),
(9, '2026-03-03', '09:00:00', '13:00:00'),
(9, '2026-03-03', '14:00:00', '18:00:00');

-- Restantes formadores com disponoblidade colocada até 30/12/2026

SET SESSION cte_max_recursion_depth = 50000;

INSERT IGNORE INTO disponibilidade_formadores (id_formador, data_disponivel, hora_inicio, hora_fim)
WITH RECURSIVE gerador_datas AS (
    -- 1. Ponto de partida (Data de início)
    SELECT CAST('2026-01-01' AS DATE) AS data_dia
    UNION ALL
    -- 2. Condição de paragem (Data de fim)
    SELECT DATE_ADD(data_dia, INTERVAL 1 DAY)
    FROM gerador_datas
    WHERE data_dia < '2026-12-30'
)
SELECT 
    f.id_formador, 
    d.data_dia, 
    '08:00:00', -- hora_inicio padrão
    '12:00:00'  -- hora_fim padrão
FROM gerador_datas d
CROSS JOIN (
    -- 3. Lista aqui os IDs dos formadores que queres preencher
    SELECT id_formador FROM formadores 
    WHERE id_formador IN (2, 3, 5, 6, 7, 8, 10, 11, 12) 
) f
-- 4. Filtro pedagógico: Apenas dias de semana (2=Segunda, 6=Sexta)
WHERE DAYOFWEEK(d.data_dia) BETWEEN 2 AND 6;

INSERT IGNORE INTO disponibilidade_formadores (id_formador, data_disponivel, hora_inicio, hora_fim)
WITH RECURSIVE gerador_datas AS (
    -- 1. Ponto de partida (Data de início)
    SELECT CAST('2026-01-01' AS DATE) AS data_dia
    UNION ALL
    -- 2. Condição de paragem (Data de fim)
    SELECT DATE_ADD(data_dia, INTERVAL 1 DAY)
    FROM gerador_datas
    WHERE data_dia < '2026-12-30'
)
SELECT 
    f.id_formador, 
    d.data_dia, 
    '13:00:00', -- hora_inicio padrão
    '19:00:00'  -- hora_fim padrão
FROM gerador_datas d
CROSS JOIN (
    -- 3. Lista aqui os IDs dos formadores que queres preencher
    SELECT id_formador FROM formadores 
    WHERE id_formador IN (2, 3, 5, 6, 7, 8, 10, 11, 12) 
) f
-- 4. Filtro pedagógico: Apenas dias de semana (2=Segunda, 6=Sexta)
WHERE DAYOFWEEK(d.data_dia) BETWEEN 2 AND 6;

INSERT IGNORE INTO disponibilidade_formadores (id_formador, data_disponivel, hora_inicio, hora_fim)
WITH RECURSIVE gerador_datas AS (
    -- 1. Ponto de partida (Data de início)
    SELECT CAST('2026-01-01' AS DATE) AS data_dia
    UNION ALL
    -- 2. Condição de paragem (Data de fim)
    SELECT DATE_ADD(data_dia, INTERVAL 1 DAY)
    FROM gerador_datas
    WHERE data_dia < '2026-12-30'
)
SELECT 
    f.id_formador, 
    d.data_dia, 
    '20:00:00', -- hora_inicio padrão
    '23:00:00'  -- hora_fim padrão
FROM gerador_datas d
CROSS JOIN (
    -- 3. Lista aqui os IDs dos formadores que queres preencher
    SELECT id_formador FROM formadores 
    WHERE id_formador IN (2, 3, 5, 6, 7, 8, 10, 11, 12) 
) f
-- 4. Filtro pedagógico: Apenas dias de semana (2=Segunda, 6=Sexta)
WHERE DAYOFWEEK(d.data_dia) BETWEEN 2 AND 6;
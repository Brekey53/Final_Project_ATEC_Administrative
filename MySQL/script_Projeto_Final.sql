DROP DATABASE sistema_gestao_atec;
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
('Inês Costa', '555444333', '2001-08-05', 'Setúbal', 'ines@student.pt', 'hash123', 3, 1),
('André Ferreira', '700000001', '2002-01-01', 'Setúbal', 'andre.1@student.pt', 'hash123', 3, 1),
('Beatriz Gomes', '700000002', '2001-02-02', 'Moita', 'beatriz.2@student.pt', 'hash123', 3, 1),
('Cláudio Lima', '700000003', '2000-03-03', 'Montijo', 'claudio.3@student.pt', 'hash123', 3, 1),
('Diana Santos', '700000004', '2002-04-04', 'Barreiro', 'diana.4@student.pt', 'hash123', 3, 1),
('Eduardo Silva', '700000005', '2001-05-05', 'Almada', 'eduardo.5@student.pt', 'hash123', 3, 1),
('Francisca Costa', '700000006', '2000-06-06', 'Seixal', 'francisca.6@student.pt', 'hash123', 3, 1),
('Gabriel Rodrigues', '700000007', '2002-07-07', 'Setúbal', 'gabriel.7@student.pt', 'hash123', 3, 1),
('Helena Martins', '700000008', '2001-08-08', 'Moita', 'helena.8@student.pt', 'hash123', 3, 1),
('Igor Pereira', '700000009', '2000-09-09', 'Montijo', 'igor.9@student.pt', 'hash123', 3, 1),
('Joana Alves', '700000010', '2002-10-10', 'Barreiro', 'joana.10@student.pt', 'hash123', 3, 1),
('Kevin Sousa', '700000011', '2001-11-11', 'Almada', 'kevin.11@student.pt', 'hash123', 3, 1),
('Laura Fernandes', '700000012', '2000-12-12', 'Seixal', 'laura.12@student.pt', 'hash123', 3, 1),
('Miguel Oliveira', '700000013', '2002-01-13', 'Setúbal', 'miguel.13@student.pt', 'hash123', 3, 1),
('Nádia Ribeiro', '700000014', '2001-02-14', 'Moita', 'nadia.14@student.pt', 'hash123', 3, 1),
('Orlando Carvalho', '700000015', '2000-03-15', 'Montijo', 'orlando.15@student.pt', 'hash123', 3, 1),
('Paula Teixeira', '700000016', '2002-04-16', 'Barreiro', 'paula.16@student.pt', 'hash123', 3, 1),
('Quintino Lopes', '700000017', '2001-05-17', 'Almada', 'quintino.17@student.pt', 'hash123', 3, 1),
('Rita Mendes', '700000018', '2000-06-18', 'Seixal', 'rita.18@student.pt', 'hash123', 3, 1),
('Sérgio Pinto', '700000019', '2002-07-19', 'Setúbal', 'sergio.19@student.pt', 'hash123', 3, 1),
('Tatiana Moreira', '700000020', '2001-08-20', 'Moita', 'tatiana.20@student.pt', 'hash123', 3, 1),
('Ulisses Nunes', '700000021', '2000-09-21', 'Montijo', 'ulisses.21@student.pt', 'hash123', 3, 1),
('Vera Correia', '700000022', '2002-10-22', 'Barreiro', 'vera.22@student.pt', 'hash123', 3, 1),
('Wagner Dias', '700000023', '2001-11-23', 'Almada', 'wagner.23@student.pt', 'hash123', 3, 1),
('Xavier Barros', '700000024', '2000-12-24', 'Seixal', 'xavier.24@student.pt', 'hash123', 3, 1),
('Yara Azevedo', '700000025', '2002-01-25', 'Setúbal', 'yara.25@student.pt', 'hash123', 3, 1),
('Zélia Campos', '700000026', '2001-02-26', 'Moita', 'zelia.26@student.pt', 'hash123', 3, 1),
('Afonso Ramos', '700000027', '2000-03-27', 'Montijo', 'afonso.27@student.pt', 'hash123', 3, 1),
('Bruna Freitas', '700000028', '2002-04-28', 'Barreiro', 'bruna.28@student.pt', 'hash123', 3, 1),
('Carlos Machado', '700000029', '2001-05-29', 'Almada', 'carlos.29@student.pt', 'hash123', 3, 1),
('Daniela Duarte', '700000030', '2000-06-30', 'Seixal', 'daniela.30@student.pt', 'hash123', 3, 1),
('Ernesto Vieira', '700000031', '2002-07-01', 'Setúbal', 'ernesto.31@student.pt', 'hash123', 3, 1),
('Fátima Castro', '700000032', '2001-08-02', 'Moita', 'fatima.32@student.pt', 'hash123', 3, 1),
('Gonçalo Cunha', '700000033', '2000-09-03', 'Montijo', 'goncalo.33@student.pt', 'hash123', 3, 1),
('Hugo Monteiro', '700000034', '2002-10-04', 'Barreiro', 'hugo.34@student.pt', 'hash123', 3, 1),
('Inês Marques', '700000035', '2001-11-05', 'Almada', 'ines.35@student.pt', 'hash123', 3, 1),
('Jorge Simões', '700000036', '2000-12-06', 'Seixal', 'jorge.36@student.pt', 'hash123', 3, 1),
('Karina Batista', '700000037', '2002-01-07', 'Setúbal', 'karina.37@student.pt', 'hash123', 3, 1),
('Luís Fonseca', '700000038', '2001-02-08', 'Moita', 'luis.38@student.pt', 'hash123', 3, 1),
('Mariana Coelho', '700000039', '2000-03-09', 'Montijo', 'mariana.39@student.pt', 'hash123', 3, 1),
('Nelson Pires', '700000040', '2002-04-10', 'Barreiro', 'nelson.40@student.pt', 'hash123', 3, 1),
('Olívia Tavares', '700000041', '2001-05-11', 'Almada', 'olivia.41@student.pt', 'hash123', 3, 1),
('Pedro Rocha', '700000042', '2000-06-12', 'Seixal', 'pedro.42@student.pt', 'hash123', 3, 1),
('Quitéria Araújo', '700000043', '2002-07-13', 'Setúbal', 'quiteria.43@student.pt', 'hash123', 3, 1),
('Ricardo Brito', '700000044', '2001-08-14', 'Moita', 'ricardo.44@student.pt', 'hash123', 3, 1),
('Sofia Melo', '700000045', '2000-09-15', 'Montijo', 'sofia.45@student.pt', 'hash123', 3, 1),
('Tiago Cardoso', '700000046', '2002-10-16', 'Barreiro', 'tiago.46@student.pt', 'hash123', 3, 1),
('Úrsula Morais', '700000047', '2001-11-17', 'Almada', 'ursula.47@student.pt', 'hash123', 3, 1),
('Vítor Antunes', '700000048', '2000-12-18', 'Seixal', 'vitor.48@student.pt', 'hash123', 3, 1),
('Wilma Gonçalves', '700000049', '2002-01-19', 'Setúbal', 'wilma.49@student.pt', 'hash123', 3, 1),
('Xico Henriques', '700000050', '2001-02-20', 'Moita', 'xico.50@student.pt', 'hash123', 3, 1),
('Yvone Nascimento', '700000051', '2000-03-21', 'Montijo', 'yvone.51@student.pt', 'hash123', 3, 1),
('Zacarias Vaz', '700000052', '2002-04-22', 'Barreiro', 'zacarias.52@student.pt', 'hash123', 3, 1),
('Alice Reis', '700000053', '2001-05-23', 'Almada', 'alice.53@student.pt', 'hash123', 3, 1),
('Bruno Sá', '700000054', '2000-06-24', 'Seixal', 'bruno.54@student.pt', 'hash123', 3, 1),
('Catarina Cruz', '700000055', '2002-07-25', 'Setúbal', 'catarina.55@student.pt', 'hash123', 3, 1);

-- FORMADORES (Ligar aos primeiros 7 utilizadores)
INSERT INTO formadores (id_utilizador, iban, qualificacoes) VALUES 
(1, 'PT500001', 'Mestre em Engenharia'),
(2, 'PT500002', 'Licenciada em Matemática'),
(3, 'PT500003', 'Especialista Redes'),
(4, 'PT500004', 'Doutorada em IA'),
(5, 'PT500005', 'Certificação Cisco'),
(6, 'PT500006', 'Licenciado em Informática'),
(7, 'PT500007', 'Especialista em Bases de Dados');

-- FORMANDOS (Ligar aos restantes 5 utilizadores)
INSERT INTO formandos (id_utilizador, id_escolaridade) VALUES 
(8, 2), (9, 2), (10, 3), (11, 2), (12, 4),
(13, 2), (14, 3), (15, 2), (16, 4), (17, 2),
(18, 3), (19, 2), (20, 4), (21, 2), (22, 3),
(23, 2), (24, 4), (25, 2), (26, 3), (27, 2),
(28, 4), (29, 2), (30, 3), (31, 2), (32, 4),
(33, 2), (34, 3), (35, 2), (36, 4), (37, 2),
(38, 3), (39, 2), (40, 4), (41, 2), (42, 3),
(43, 2), (44, 4), (45, 2), (46, 3), (47, 2),
(48, 4), (49, 2), (50, 3), (51, 2), (52, 4),
(53, 2), (54, 3), (55, 2), (56, 4), (57, 2),
(58, 3), (59, 2), (60, 4), (61, 2), (62, 3),
(63, 2), (64, 4), (65, 2);

-- MÓDULOS (UFCDs comuns)
INSERT INTO modulos (codigo_identificacao, nome, horas_totais, creditos) VALUES 
('UFCD0778', 'Algoritmos', 50, 4.5),
('UFCD0782', 'SQL', 50, 4.5),
('UFCD5412', 'Sistemas Operativos', 25, 2.5),
('UFCD0804', 'Algoritmos Avançados', 50, 4.5),
('UFCD0123', 'Ética Profissional', 25, 2.0),
('UFCD0785', 'Programação Orientada a Objetos', 50, 4.5),
('UFCD0786', 'Estruturas de Dados', 50, 4.5),
('UFCD0787', 'Redes de Computadores', 50, 4.5),
('UFCD0788', 'Segurança Informática', 50, 4.5),
('UFCD0789', 'Desenvolvimento Web', 50, 4.5),
('UFCD0790', 'Bases de Dados', 50, 4.5),
('UFCD0791', 'Arquitetura de Computadores', 50, 4.5),
('UFCD0792', 'Sistemas Distribuídos', 50, 4.5),
('UFCD0793', 'Inteligência Artificial', 50, 4.5),
('UFCD0794', 'Engenharia de Software', 50, 4.5),
('UFCD0795', 'Gestão de Projetos', 25, 2.5),
('UFCD0796', 'Cloud Computing', 50, 4.5),
('UFCD0797', 'DevOps', 50, 4.5),
('UFCD0798', 'Machine Learning', 50, 4.5),
('UFCD0799', 'Big Data', 50, 4.5),
('UFCD0800', 'Mobile Development', 50, 4.5),
('UFCD0801', 'Interface Design', 25, 2.5),
('UFCD0802', 'Testes de Software', 25, 2.5),
('UFCD0803', 'Qualidade de Software', 25, 2.5),
('UFCD0805', 'Criptografia', 25, 2.5),
('UFCD0806', 'Análise de Sistemas', 50, 4.5),
('UFCD0807', 'Programação Python', 50, 4.5),
('UFCD0808', 'Programação Java', 50, 4.5),
('UFCD0809', 'Programação C#', 50, 4.5),
('UFCD0810', 'JavaScript Avançado', 50, 4.5),
('UFCD0811', 'Frameworks Frontend', 50, 4.5),
('UFCD0812', 'Frameworks Backend', 50, 4.5),
('UFCD0813', 'API REST', 25, 2.5),
('UFCD0814', 'Microserviços', 50, 4.5),
('UFCD0815', 'Docker e Containers', 25, 2.5),
('UFCD0816', 'Kubernetes', 25, 2.5),
('UFCD0817', 'Git e Controlo de Versões', 25, 2.5),
('UFCD0818', 'Linux Avançado', 50, 4.5),
('UFCD0819', 'Windows Server', 50, 4.5),
('UFCD0820', 'Virtualização', 25, 2.5),
('UFCD0821', 'Administração de Redes', 50, 4.5),
('UFCD0822', 'Firewall e VPN', 25, 2.5),
('UFCD0823', 'Ethical Hacking', 50, 4.5),
('UFCD0824', 'Forense Digital', 25, 2.5),
('UFCD0825', 'GDPR e Proteção de Dados', 25, 2.0),
('UFCD0826', 'Análise de Dados', 50, 4.5),
('UFCD0827', 'Data Mining', 50, 4.5),
('UFCD0828', 'Business Intelligence', 50, 4.5),
('UFCD0829', 'Visualização de Dados', 25, 2.5),
('UFCD0830', 'Estatística Aplicada', 50, 4.5),
('UFCD0831', 'Modelação de Dados', 25, 2.5),
('UFCD0832', 'Data Warehousing', 50, 4.5),
('UFCD0833', 'ETL Processes', 25, 2.5),
('UFCD0834', 'NoSQL Databases', 50, 4.5),
('UFCD0835', 'MongoDB', 25, 2.5),
('UFCD0836', 'Redis', 25, 2.5),
('UFCD0837', 'Elasticsearch', 25, 2.5),
('UFCD0838', 'GraphQL', 25, 2.5),
('UFCD0839', 'Blockchain', 50, 4.5),
('UFCD0840', 'IoT - Internet das Coisas', 50, 4.5),
('UFCD0841', 'Robótica', 50, 4.5),
('UFCD0842', 'Visão Computacional', 50, 4.5),
('UFCD0843', 'Processamento de Linguagem Natural', 50, 4.5),
('UFCD0844', 'Deep Learning', 50, 4.5),
('UFCD0845', 'Redes Neurais', 50, 4.5),
('UFCD0846', 'Computação Quântica', 25, 2.5),
('UFCD0847', 'Realidade Virtual', 50, 4.5),
('UFCD0848', 'Realidade Aumentada', 50, 4.5),
('UFCD0849', 'Game Development', 50, 4.5),
('UFCD0850', 'Unity 3D', 50, 4.5),
('UFCD0851', 'Unreal Engine', 50, 4.5),
('UFCD0852', 'Design de Jogos', 25, 2.5),
('UFCD0853', 'Animação 3D', 50, 4.5),
('UFCD0854', 'Modelação 3D', 50, 4.5),
('UFCD0855', 'Motion Graphics', 25, 2.5),
('UFCD0856', 'Edição de Vídeo', 25, 2.5),
('UFCD0857', 'Fotografia Digital', 25, 2.5),
('UFCD0858', 'Adobe Photoshop', 25, 2.5),
('UFCD0859', 'Adobe Illustrator', 25, 2.5),
('UFCD0860', 'Adobe Premiere', 25, 2.5),
('UFCD0861', 'Figma', 25, 2.5),
('UFCD0862', 'UX/UI Design', 50, 4.5),
('UFCD0863', 'Design Thinking', 25, 2.5),
('UFCD0864', 'Prototipagem', 25, 2.5),
('UFCD0865', 'Marketing Digital', 50, 4.5),
('UFCD0866', 'SEO e SEM', 25, 2.5),
('UFCD0867', 'Google Analytics', 25, 2.5),
('UFCD0868', 'Social Media Marketing', 25, 2.5),
('UFCD0869', 'E-commerce', 50, 4.5),
('UFCD0870', 'CRM Systems', 25, 2.5),
('UFCD0871', 'ERP Systems', 50, 4.5),
('UFCD0872', 'SAP', 50, 4.5),
('UFCD0873', 'Salesforce', 25, 2.5),
('UFCD0874', 'Scrum', 25, 2.5),
('UFCD0875', 'Agile', 25, 2.5),
('UFCD0876', 'Kanban', 25, 2.0),
('UFCD0877', 'ITIL', 25, 2.5),
('UFCD0878', 'COBIT', 25, 2.5),
('UFCD0879', 'ISO 27001', 25, 2.0),
('UFCD0880', 'Auditoria de Sistemas', 50, 4.5),
('UFCD0881', 'Compliance', 25, 2.0),
('UFCD0882', 'Governança de TI', 25, 2.5),
('UFCD0883', 'Business Continuity', 25, 2.5),
('UFCD0884', 'Disaster Recovery', 25, 2.5),
('UFCD0885', 'Gestão de Incidentes', 25, 2.5);

-- CURSOS
INSERT INTO cursos (id_area, nome, descricao) VALUES 
(1, 'TPSI - Programação', 'Especialista em Tecnologias e Programação'), (1, 'Cibersegurança', 'Gestão de Redes'),
(2, 'Mecânica Industrial', 'Manutenção Automóvel'), (3, 'Eletrónica Aplicada', 'Circuitos'), (4, 'Gestão Escolar', 'Secretariado');

-- MATRIZ DE CURSOS
INSERT INTO cursos_modulos (id_curso, id_modulo, prioridade) VALUES 
-- CURSO 1: TPSI - Programação (22 módulos)
(1, 1, 1),   -- Algoritmos
(1, 2, 2),   -- SQL
(1, 3, 3),   -- Sistemas Operativos
(1, 4, 4),   -- Algoritmos Avançados
(1, 5, 5),   -- Ética Profissional
(1, 6, 6),   -- Programação Orientada a Objetos
(1, 7, 7),   -- Estruturas de Dados
(1, 8, 8),   -- Redes de Computadores
(1, 9, 9),   -- Segurança Informática
(1, 10, 10), -- Desenvolvimento Web
(1, 11, 11), -- Bases de Dados
(1, 12, 12), -- Arquitetura de Computadores
(1, 13, 13), -- Sistemas Distribuídos
(1, 14, 14), -- Inteligência Artificial
(1, 15, 15), -- Engenharia de Software
(1, 16, 16), -- Gestão de Projetos
(1, 17, 17), -- Cloud Computing
(1, 18, 18), -- DevOps
(1, 19, 19), -- Machine Learning
(1, 20, 20), -- Big Data
(1, 21, 21), -- Mobile Development
(1, 22, 22), -- Interface Design

-- CURSO 2: Cibersegurança (20 módulos)
(2, 2, 1),   -- SQL
(2, 8, 2),   -- Redes de Computadores
(2, 9, 3),   -- Segurança Informática
(2, 22, 4),  -- Interface Design
(2, 23, 5),  -- Testes de Software
(2, 24, 6),  -- Qualidade de Software
(2, 25, 7),  -- Criptografia
(2, 42, 8),  -- Firewall e VPN
(2, 43, 9),  -- Ethical Hacking
(2, 44, 10), -- Forense Digital
(2, 45, 11), -- GDPR e Proteção de Dados
(2, 79, 12), -- ISO 27001
(2, 81, 13), -- Compliance
(2, 82, 14), -- Governança de TI
(2, 97, 15), -- Agile
(2, 98, 16), -- Kanban
(2, 99, 17), -- ITIL
(2, 100, 18), -- COBIT
(2, 79, 19), -- ISO 27001
(2, 80, 20), -- Auditoria de Sistemas

-- CURSO 3: Mecânica Industrial (20 módulos)
(3, 3, 1),   -- Sistemas Operativos
(3, 5, 2),   -- Ética Profissional
(3, 12, 3),  -- Arquitetura de Computadores
(3, 40, 4),  -- Virtualização
(3, 41, 5),  -- Administração de Redes
(3, 50, 6),  -- Estatística Aplicada
(3, 60, 7),  -- Robótica
(3, 61, 8),  -- Visão Computacional
(3, 62, 9),  -- Processamento de Linguagem Natural
(3, 69, 10), -- Game Development
(3, 70, 11), -- Unity 3D
(3, 71, 12), -- Unreal Engine
(3, 72, 13), -- Design de Jogos
(3, 73, 14), -- Animação 3D
(3, 95, 15), -- Gestão de Projetos
(3, 96, 16), -- Cloud Computing
(3, 83, 17), -- Business Continuity
(3, 84, 18), -- Disaster Recovery
(3, 85, 19), -- Gestão de Incidentes
(3, 95, 20), -- Gestão de Incidentes (repetido - ajustar se necessário)

-- CURSO 4: Eletrónica Aplicada (20 módulos)
(4, 3, 1),   -- Sistemas Operativos
(4, 4, 2),   -- Algoritmos Avançados
(4, 5, 3),   -- Ética Profissional
(4, 12, 4),  -- Arquitetura de Computadores
(4, 38, 5),  -- Linux Avançado
(4, 39, 6),  -- Windows Server
(4, 40, 7),  -- Virtualização
(4, 41, 8),  -- Administração de Redes
(4, 42, 9),  -- Firewall e VPN
(4, 50, 10), -- Estatística Aplicada
(4, 51, 11), -- Modelação de Dados
(4, 60, 12), -- Robótica
(4, 95, 13), -- Gestão de Projetos
(4, 96, 14), -- Cloud Computing
(4, 97, 15), -- Agile
(4, 83, 16), -- Business Continuity
(4, 84, 17), -- Business Continuity
(4, 85, 18), -- Disaster Recovery
(4, 86, 19), -- Gestão de Incidentes
(4, 88, 20), -- Gestão de Incidentes

-- CURSO 5: Gestão Escolar (não tem alocações nos dados atuais, mas preparar alguns módulos)
(5, 5, 1),   -- Ética Profissional
(5, 15, 2),  -- Engenharia de Software
(5, 16, 3),  -- Gestão de Projetos
(5, 85, 4),  -- Marketing Digital
(5, 89, 5),  -- E-commerce
(5, 90, 6),  -- CRM Systems
(5, 91, 7),  -- ERP Systems
(5, 92, 8),  -- SAP
(5, 94, 9),  -- Scrum
(5, 95, 10), -- Gestão de Projetos
(5, 97, 11), -- Agile
(5, 98, 12), -- Kanban
(5, 99, 13), -- ITIL
(5, 100, 14), -- COBIT
(5, 102, 15); -- Auditoria de Sistemas

-- TURMAS
INSERT INTO turmas (id_curso, nome_turma, data_inicio, data_fim) VALUES 
(1, 'TPSI-PAL-0525', '2025-11-03', '2026-07-15'), (1, 'TPSI-PAL-0626', '2026-01-10', '2026-09-20'),
(2, 'CIBER-2025', '2025-09-01', '2026-06-30'), (3, 'MEC-01', '2026-02-01', '2026-12-15'),
(4, 'ELET-01', '2025-10-01', '2026-05-30');

-- SALAS
INSERT INTO salas (descricao, num_max_alunos) VALUES 
('Lab Informática 01', 20),
('Lab Informática 02', 20),
('Lab Informática 03', 18),
('Lab Informática 04', 22),
('Lab Redes e Sistemas', 16),
('Lab Hardware', 15),
('Lab Eletrónica', 12),
('Lab Robótica', 14),
('Lab Automação', 12),
('Oficina Soldadura', 10),
('Oficina Mecânica', 12),
('Lab Química', 16),
('Lab Física', 18),
('Atelier Design', 15),
('Estúdio Multimédia', 14),
('Sala Teórica 01', 30),
('Sala Teórica 02', 30),
('Sala Teórica 03', 28),
('Sala Teórica 04', 25),
('Sala Teórica 05', 25),
('Sala Teórica 06', 32),
('Sala Teórica 07', 28),
('Sala Teórica 08', 30),
('Auditório', 50),
('Sala Polivalente', 35),
('Sala Reuniões', 12),
('Biblioteca', 40),
('Sala Estudo', 20),
('Sala Tutoria', 8),
('Ginásio', 25);

-- ALOCAÇÕES (Quem dá o quê em cada turma)
INSERT INTO turma_alocacoes (id_turma, id_modulo, id_formador) VALUES 
-- Turma 1: TPSI-PAL-0525
(1, 1, 1), (1, 2, 2), (1, 3, 3), (1, 4, 4), (1, 5, 5),
(1, 6, 1), (1, 7, 2), (1, 8, 3), (1, 9, 4), (1, 10, 5),
(1, 11, 1), (1, 12, 2), (1, 13, 3), (1, 14, 4), (1, 15, 5),
(1, 16, 6), (1, 17, 7), (1, 18, 1), (1, 19, 2), (1, 20, 3),
(1, 21, 4), (1, 22, 5),

-- Turma 2: TPSI-PAL-0626
(2, 1, 3), (2, 2, 4), (2, 3, 5), (2, 4, 6), (2, 5, 7),
(2, 6, 3), (2, 7, 4), (2, 8, 5), (2, 9, 6), (2, 10, 7),
(2, 11, 3), (2, 12, 4), (2, 13, 5), (2, 14, 6), (2, 15, 7),
(2, 16, 1), (2, 17, 2), (2, 18, 3), (2, 19, 4), (2, 20, 5),
(2, 21, 6), (2, 22, 7),

-- Turma 3: CIBER-2025
(3, 2, 2), (3, 8, 3), (3, 9, 4), (3, 22, 5), (3, 23, 6),
(3, 24, 7), (3, 25, 1), (3, 42, 3), (3, 43, 4), (3, 44, 5),
(3, 45, 6), (3, 79, 7), (3, 81, 1), (3, 82, 2), (3, 97, 3),
(3, 98, 4), (3, 99, 5), (3, 100, 6), (3, 79, 7), (3, 80, 1),

-- Turma 4: MEC-01
(4, 3, 1), (4, 5, 5), (4, 12, 2), (4, 40, 3), (4, 41, 4),
(4, 50, 6), (4, 60, 7), (4, 61, 1), (4, 62, 2), (4, 69, 3),
(4, 70, 4), (4, 71, 5), (4, 72, 6), (4, 73, 7), (4, 95, 1),
(4, 96, 2), (4, 83, 3), (4, 84, 4), (4, 85, 5), (4, 87, 6),

-- Turma 5: ELET-01
(5, 3, 2), (5, 4, 4), (5, 5, 5), (5, 12, 1), (5, 38, 3),
(5, 39, 4), (5, 40, 6), (5, 41, 7), (5, 42, 1), (5, 50, 2),
(5, 51, 3), (5, 60, 4), (5, 95, 5), (5, 96, 6), (5, 97, 7),
(5, 83, 1), (5, 84, 2), (5, 85, 3), (5, 87, 4), (5, 89, 5);

-- INSCRIÇÕES
INSERT INTO inscricoes (id_formando, id_turma, data_inscricao, estado) VALUES 
-- Turma 1: TPSI-PAL-0525 (15 formandos)
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
(11, 1, '2025-10-11', 'Ativo'),
(12, 1, '2025-10-12', 'Ativo'),
(13, 1, '2025-10-13', 'Ativo'),
(14, 1, '2025-10-14', 'Ativo'),
(15, 1, '2025-10-15', 'Ativo'),

-- Turma 2: TPSI-PAL-0626 (12 formandos)
(16, 2, '2025-12-01', 'Ativo'),
(17, 2, '2025-12-02', 'Ativo'),
(18, 2, '2025-12-03', 'Ativo'),
(19, 2, '2025-12-04', 'Ativo'),
(20, 2, '2025-12-05', 'Ativo'),
(21, 2, '2025-12-06', 'Ativo'),
(22, 2, '2025-12-07', 'Ativo'),
(23, 2, '2025-12-08', 'Ativo'),
(24, 2, '2025-12-09', 'Ativo'),
(25, 2, '2025-12-10', 'Ativo'),
(26, 2, '2025-12-11', 'Ativo'),
(27, 2, '2025-12-12', 'Ativo'),

-- Turma 3: CIBER-2025 (13 formandos)
(28, 3, '2025-08-01', 'Ativo'),
(29, 3, '2025-08-02', 'Ativo'),
(30, 3, '2025-08-03', 'Ativo'),
(31, 3, '2025-08-04', 'Ativo'),
(32, 3, '2025-08-05', 'Ativo'),
(33, 3, '2025-08-06', 'Ativo'),
(34, 3, '2025-08-07', 'Ativo'),
(35, 3, '2025-08-08', 'Ativo'),
(36, 3, '2025-08-09', 'Ativo'),
(37, 3, '2025-08-10', 'Ativo'),
(38, 3, '2025-08-11', 'Ativo'),
(39, 3, '2025-08-12', 'Ativo'),
(40, 3, '2025-08-13', 'Ativo'),

-- Turma 4: MEC-01 (10 formandos)
(41, 4, '2026-01-10', 'Ativo'),
(42, 4, '2026-01-11', 'Ativo'),
(43, 4, '2026-01-12', 'Ativo'),
(44, 4, '2026-01-13', 'Ativo'),
(45, 4, '2026-01-14', 'Ativo'),
(46, 4, '2026-01-15', 'Ativo'),
(47, 4, '2026-01-16', 'Ativo'),
(48, 4, '2026-01-17', 'Ativo'),
(49, 4, '2026-01-18', 'Ativo'),
(50, 4, '2026-01-19', 'Ativo'),

-- Turma 5: ELET-01 (8 formandos)
(51, 5, '2025-09-15', 'Ativo'),
(52, 5, '2025-09-16', 'Ativo'),
(53, 5, '2025-09-17', 'Ativo'),
(54, 5, '2025-09-18', 'Ativo'),
(55, 5, '2025-09-19', 'Ativo'),
(56, 5, '2025-09-20', 'Ativo'),
(57, 5, '2025-09-21', 'Ativo'),
(58, 5, '2025-09-22', 'Ativo');

-- HORÁRIOS (Aulas marcadas para Janeiro e Fevereiro 2026)
-- TURMA 1: Sala 1, 2, 3 | Formadores 1, 2, 3
INSERT INTO horarios (id_turma, id_curso_modulo, id_formador, id_sala, data, hora_inicio, hora_fim) VALUES 
(1, 1, 1, 1, '2026-01-26', '09:00:00', '13:00:00'),
(1, 2, 2, 2, '2026-01-26', '14:00:00', '18:00:00');

-- TURMA 2: Sala 4, 5 | Formadores 3, 4
INSERT INTO horarios (id_turma, id_curso_modulo, id_formador, id_sala, data, hora_inicio, hora_fim) VALUES 
(2, 23, 3, 4, '2026-01-26', '09:00:00', '13:00:00'),
(2, 24, 4, 5, '2026-01-26', '14:00:00', '18:00:00');

-- TURMA 3: Sala 7, 8 | Formadores 2, 1
INSERT INTO horarios (id_turma, id_curso_modulo, id_formador, id_sala, data, hora_inicio, hora_fim) VALUES 
(3, 43, 2, 7, '2026-01-26', '09:00:00', '13:00:00'),
(3, 44, 1, 8, '2026-01-26', '14:00:00', '18:00:00');

-- TURMA 5: Sala 20, 21 | Formadores 7, 5 (CORRIGIDO: Formador 7 em vez de 3)
INSERT INTO horarios (id_turma, id_curso_modulo, id_formador, id_sala, data, hora_inicio, hora_fim) VALUES 
(5, 83, 7, 20, '2026-01-26', '09:00:00', '13:00:00'),
(5, 84, 5, 21, '2026-01-26', '14:00:00', '18:00:00');

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
('85', '32', '22', '16.50', '2025-10-05'),

-- Turma 5: ELET-01 - Formando 51
('86', '51', '3', '16.00', '2025-10-15'),
('87', '51', '4', '17.50', '2025-10-20'),
('88', '51', '5', '16.75', '2025-10-25'),

-- Turma 5: ELET-01 - Formando 52
('89', '52', '3', '18.50', '2025-10-15'),
('90', '52', '4', '19.00', '2025-10-20'),
('91', '52', '5', '18.25', '2025-10-25'),

-- Turma 5: ELET-01 - Formando 53
('92', '53', '3', '15.25', '2025-10-15'),
('93', '53', '4', '14.75', '2025-10-20'),
('94', '53', '5', '15.50', '2025-10-25'),

-- Turma 5: ELET-01 - Formando 54
('95', '54', '3', '17.00', '2025-10-15'),
('96', '54', '4', '16.50', '2025-10-20'),
('97', '54', '5', '17.25', '2025-10-25'),

-- Turma 5: ELET-01 - Formando 55
('98', '55', '3', '13.50', '2025-10-15'),
('99', '55', '4', '14.00', '2025-10-20'),
('100', '55', '5', '13.75', '2025-10-25');

-- DISPONIBILIDADE DE FORMADORES
-- Disponibilidades para Janeiro e Fevereiro 2026
-- Cada formador tem disponibilidade em vários dias e horários

INSERT INTO disponibilidade_formadores (id_formador, data_disponivel, hora_inicio, hora_fim) VALUES 
-- Formador 1 (Carlos Professor) - Disponível Seg/Qua/Sex manhãs e tardes
(1, '2026-01-26', '09:00:00', '13:00:00'),
(1, '2026-01-26', '14:00:00', '18:00:00'),
(1, '2026-01-28', '09:00:00', '13:00:00'),
(1, '2026-01-28', '14:00:00', '18:00:00'),
(1, '2026-01-30', '09:00:00', '13:00:00'),
(1, '2026-01-30', '14:00:00', '18:00:00'),
(1, '2026-02-02', '09:00:00', '13:00:00'),
(1, '2026-02-02', '14:00:00', '18:00:00'),
(1, '2026-02-04', '09:00:00', '13:00:00'),
(1, '2026-02-04', '14:00:00', '18:00:00'),
(1, '2026-02-06', '09:00:00', '13:00:00'),
(1, '2026-02-06', '14:00:00', '18:00:00'),
(1, '2026-02-09', '09:00:00', '13:00:00'),
(1, '2026-02-09', '14:00:00', '18:00:00'),
(1, '2026-02-11', '09:00:00', '13:00:00'),
(1, '2026-02-11', '14:00:00', '18:00:00'),
(1, '2026-02-13', '09:00:00', '13:00:00'),
(1, '2026-02-13', '14:00:00', '18:00:00'),

-- Formador 2 (Ana Docente) - Disponível Ter/Qui manhãs e tardes
(2, '2026-01-27', '09:00:00', '13:00:00'),
(2, '2026-01-27', '14:00:00', '18:00:00'),
(2, '2026-01-29', '09:00:00', '13:00:00'),
(2, '2026-01-29', '14:00:00', '18:00:00'),
(2, '2026-02-03', '09:00:00', '13:00:00'),
(2, '2026-02-03', '14:00:00', '18:00:00'),
(2, '2026-02-05', '09:00:00', '13:00:00'),
(2, '2026-02-05', '14:00:00', '18:00:00'),
(2, '2026-02-10', '09:00:00', '13:00:00'),
(2, '2026-02-10', '14:00:00', '18:00:00'),
(2, '2026-02-12', '09:00:00', '13:00:00'),
(2, '2026-02-12', '14:00:00', '18:00:00'),
(2, '2026-01-26', '14:00:00', '18:00:00'),
(2, '2026-01-28', '14:00:00', '18:00:00'),
(2, '2026-02-02', '14:00:00', '18:00:00'),
(2, '2026-02-06', '09:00:00', '13:00:00'),

-- Formador 3 (Leonor Joaquim) - Disponível todos os dias manhãs
(3, '2026-01-26', '09:00:00', '13:00:00'),
(3, '2026-01-27', '09:00:00', '13:00:00'),
(3, '2026-01-28', '09:00:00', '13:00:00'),
(3, '2026-01-29', '09:00:00', '13:00:00'),
(3, '2026-01-30', '09:00:00', '13:00:00'),
(3, '2026-02-02', '09:00:00', '13:00:00'),
(3, '2026-02-03', '09:00:00', '13:00:00'),
(3, '2026-02-04', '09:00:00', '13:00:00'),
(3, '2026-02-05', '09:00:00', '13:00:00'),
(3, '2026-02-06', '09:00:00', '13:00:00'),
(3, '2026-02-09', '09:00:00', '13:00:00'),
(3, '2026-02-10', '09:00:00', '13:00:00'),
(3, '2026-02-11', '09:00:00', '13:00:00'),
(3, '2026-02-12', '09:00:00', '13:00:00'),
(3, '2026-02-13', '09:00:00', '13:00:00'),
(3, '2026-01-26', '14:00:00', '18:00:00'),
(3, '2026-02-02', '14:00:00', '18:00:00'),
(3, '2026-02-06', '14:00:00', '18:00:00'),

-- Formador 4 (Daniela Instrutora) - Disponível Seg/Qua/Sex tardes e Ter/Qui completo
(4, '2026-01-26', '14:00:00', '18:00:00'),
(4, '2026-01-27', '09:00:00', '13:00:00'),
(4, '2026-01-27', '14:00:00', '18:00:00'),
(4, '2026-01-28', '14:00:00', '18:00:00'),
(4, '2026-01-29', '09:00:00', '13:00:00'),
(4, '2026-01-29', '14:00:00', '18:00:00'),
(4, '2026-01-30', '14:00:00', '18:00:00'),
(4, '2026-02-02', '14:00:00', '18:00:00'),
(4, '2026-02-03', '09:00:00', '13:00:00'),
(4, '2026-02-03', '14:00:00', '18:00:00'),
(4, '2026-02-04', '14:00:00', '18:00:00'),
(4, '2026-02-05', '09:00:00', '13:00:00'),
(4, '2026-02-05', '14:00:00', '18:00:00'),
(4, '2026-02-06', '09:00:00', '13:00:00'),
(4, '2026-02-06', '14:00:00', '18:00:00'),
(4, '2026-02-09', '14:00:00', '18:00:00'),
(4, '2026-02-10', '09:00:00', '13:00:00'),
(4, '2026-02-12', '14:00:00', '18:00:00'),

-- Formador 5 (Eduardo Formador) - Disponível manhãs todos os dias e algumas tardes
(5, '2026-01-26', '09:00:00', '11:00:00'),
(5, '2026-01-27', '09:00:00', '11:00:00'),
(5, '2026-01-28', '09:00:00', '11:00:00'),
(5, '2026-01-29', '09:00:00', '11:00:00'),
(5, '2026-01-30', '09:00:00', '13:00:00'),
(5, '2026-01-30', '14:00:00', '18:00:00'),
(5, '2026-02-02', '09:00:00', '13:00:00'),
(5, '2026-02-02', '14:00:00', '18:00:00'),
(5, '2026-02-03', '09:00:00', '11:00:00'),
(5, '2026-02-04', '09:00:00', '11:00:00'),
(5, '2026-02-05', '09:00:00', '13:00:00'),
(5, '2026-02-06', '09:00:00', '13:00:00'),
(5, '2026-02-06', '14:00:00', '18:00:00'),
(5, '2026-02-09', '09:00:00', '13:00:00'),
(5, '2026-02-09', '14:00:00', '18:00:00'),
(5, '2026-02-11', '09:00:00', '13:00:00'),
(5, '2026-02-13', '09:00:00', '13:00:00'),

-- Formador 6 - Disponível tardes principalmente
(6, '2026-01-27', '14:00:00', '18:00:00'),
(6, '2026-01-28', '14:00:00', '18:00:00'),
(6, '2026-01-29', '09:00:00', '13:00:00'),
(6, '2026-01-30', '09:00:00', '13:00:00'),
(6, '2026-02-02', '09:00:00', '13:00:00'),
(6, '2026-02-03', '14:00:00', '18:00:00'),
(6, '2026-02-04', '14:00:00', '18:00:00'),
(6, '2026-02-05', '09:00:00', '13:00:00'),
(6, '2026-02-05', '14:00:00', '18:00:00'),
(6, '2026-02-06', '09:00:00', '13:00:00'),
(6, '2026-02-09', '09:00:00', '13:00:00'),
(6, '2026-02-10', '09:00:00', '13:00:00'),
(6, '2026-02-11', '14:00:00', '18:00:00'),
(6, '2026-02-13', '14:00:00', '18:00:00'),
(6, '2026-01-26', '09:00:00', '13:00:00'),
(6, '2026-02-02', '14:00:00', '18:00:00'),

-- Formador 7 - Disponível flexível
(7, '2026-01-26', '09:00:00', '13:00:00'),
(7, '2026-01-26', '14:00:00', '18:00:00'),
(7, '2026-01-27', '09:00:00', '13:00:00'),
(7, '2026-01-28', '09:00:00', '11:00:00'),
(7, '2026-01-28', '14:00:00', '18:00:00'),
(7, '2026-01-29', '14:00:00', '18:00:00'),
(7, '2026-01-30', '14:00:00', '18:00:00'),
(7, '2026-02-02', '14:00:00', '18:00:00'),
(7, '2026-02-03', '09:00:00', '13:00:00'),
(7, '2026-02-04', '09:00:00', '11:00:00'),
(7, '2026-02-05', '09:00:00', '13:00:00'),
(7, '2026-02-06', '09:00:00', '13:00:00'),
(7, '2026-02-09', '09:00:00', '13:00:00'),
(7, '2026-02-10', '14:00:00', '18:00:00'),
(7, '2026-02-11', '09:00:00', '13:00:00'),
(7, '2026-02-12', '09:00:00', '13:00:00'),
(7, '2026-02-04', '14:00:00', '18:00:00');

-- DISPONIBILIDADE DE SALAS
-- Salas disponíveis durante o horário escolar (09:00-18:00)
-- Janeiro e Fevereiro 2026

INSERT INTO disponibilidade_salas (id_sala, data_disponivel, hora_inicio, hora_fim) VALUES 
-- Laboratórios de Informática (1-4) - Disponíveis todos os dias úteis
(1, '2026-01-26', '09:00:00', '13:00:00'),
(1, '2026-01-26', '14:00:00', '18:00:00'),
(1, '2026-01-27', '09:00:00', '13:00:00'),
(1, '2026-01-27', '14:00:00', '18:00:00'),
(1, '2026-01-28', '09:00:00', '13:00:00'),
(1, '2026-01-28', '14:00:00', '18:00:00'),
(1, '2026-01-29', '09:00:00', '13:00:00'),
(1, '2026-01-29', '14:00:00', '18:00:00'),
(1, '2026-01-30', '09:00:00', '13:00:00'),
(1, '2026-01-30', '14:00:00', '18:00:00'),
(1, '2026-02-02', '09:00:00', '13:00:00'),
(1, '2026-02-02', '14:00:00', '18:00:00'),
(1, '2026-02-03', '09:00:00', '13:00:00'),
(1, '2026-02-03', '14:00:00', '18:00:00'),
(1, '2026-02-04', '09:00:00', '13:00:00'),
(1, '2026-02-04', '14:00:00', '18:00:00'),
(1, '2026-02-05', '09:00:00', '13:00:00'),
(1, '2026-02-05', '14:00:00', '18:00:00'),
(1, '2026-02-06', '09:00:00', '13:00:00'),
(1, '2026-02-06', '14:00:00', '18:00:00'),
(1, '2026-02-09', '09:00:00', '13:00:00'),
(1, '2026-02-09', '14:00:00', '18:00:00'),
(1, '2026-02-10', '09:00:00', '13:00:00'),
(1, '2026-02-10', '14:00:00', '18:00:00'),
(1, '2026-02-11', '09:00:00', '13:00:00'),
(1, '2026-02-11', '14:00:00', '18:00:00'),
(1, '2026-02-12', '09:00:00', '13:00:00'),
(1, '2026-02-12', '14:00:00', '18:00:00'),
(1, '2026-02-13', '09:00:00', '13:00:00'),
(1, '2026-02-13', '14:00:00', '18:00:00'),

(2, '2026-01-26', '09:00:00', '18:00:00'),
(2, '2026-01-27', '09:00:00', '18:00:00'),
(2, '2026-01-28', '09:00:00', '18:00:00'),
(2, '2026-01-29', '09:00:00', '18:00:00'),
(2, '2026-01-30', '09:00:00', '18:00:00'),
(2, '2026-02-02', '09:00:00', '18:00:00'),
(2, '2026-02-03', '09:00:00', '18:00:00'),
(2, '2026-02-04', '09:00:00', '18:00:00'),
(2, '2026-02-05', '09:00:00', '18:00:00'),
(2, '2026-02-06', '09:00:00', '18:00:00'),
(2, '2026-02-09', '09:00:00', '18:00:00'),
(2, '2026-02-10', '09:00:00', '18:00:00'),
(2, '2026-02-11', '09:00:00', '18:00:00'),
(2, '2026-02-12', '09:00:00', '18:00:00'),
(2, '2026-02-13', '09:00:00', '18:00:00'),

(3, '2026-01-26', '09:00:00', '18:00:00'),
(3, '2026-01-27', '09:00:00', '18:00:00'),
(3, '2026-01-28', '09:00:00', '18:00:00'),
(3, '2026-01-29', '09:00:00', '18:00:00'),
(3, '2026-01-30', '09:00:00', '18:00:00'),
(3, '2026-02-02', '09:00:00', '18:00:00'),
(3, '2026-02-03', '09:00:00', '18:00:00'),
(3, '2026-02-04', '09:00:00', '18:00:00'),
(3, '2026-02-05', '09:00:00', '18:00:00'),
(3, '2026-02-06', '09:00:00', '18:00:00'),
(3, '2026-02-09', '09:00:00', '18:00:00'),
(3, '2026-02-10', '09:00:00', '18:00:00'),
(3, '2026-02-11', '09:00:00', '18:00:00'),
(3, '2026-02-12', '09:00:00', '18:00:00'),
(3, '2026-02-13', '09:00:00', '18:00:00'),

(4, '2026-01-26', '09:00:00', '18:00:00'),
(4, '2026-01-27', '09:00:00', '18:00:00'),
(4, '2026-01-28', '09:00:00', '18:00:00'),
(4, '2026-01-29', '09:00:00', '18:00:00'),
(4, '2026-01-30', '09:00:00', '18:00:00'),
(4, '2026-02-02', '09:00:00', '18:00:00'),
(4, '2026-02-03', '09:00:00', '18:00:00'),
(4, '2026-02-04', '09:00:00', '18:00:00'),
(4, '2026-02-05', '09:00:00', '18:00:00'),
(4, '2026-02-06', '09:00:00', '18:00:00'),
(4, '2026-02-09', '09:00:00', '18:00:00'),
(4, '2026-02-10', '09:00:00', '18:00:00'),
(4, '2026-02-11', '09:00:00', '18:00:00'),
(4, '2026-02-12', '09:00:00', '18:00:00'),
(4, '2026-02-13', '09:00:00', '18:00:00'),

-- Lab Redes e Sistemas (5)
(5, '2026-01-26', '09:00:00', '18:00:00'),
(5, '2026-01-27', '09:00:00', '18:00:00'),
(5, '2026-01-28', '09:00:00', '18:00:00'),
(5, '2026-01-29', '09:00:00', '18:00:00'),
(5, '2026-01-30', '09:00:00', '18:00:00'),
(5, '2026-02-02', '09:00:00', '18:00:00'),
(5, '2026-02-03', '09:00:00', '18:00:00'),
(5, '2026-02-04', '09:00:00', '18:00:00'),
(5, '2026-02-05', '09:00:00', '18:00:00'),
(5, '2026-02-06', '09:00:00', '18:00:00'),
(5, '2026-02-09', '09:00:00', '18:00:00'),
(5, '2026-02-10', '09:00:00', '18:00:00'),
(5, '2026-02-11', '09:00:00', '18:00:00'),
(5, '2026-02-12', '09:00:00', '18:00:00'),
(5, '2026-02-13', '09:00:00', '18:00:00'),

-- Lab Hardware (6)
(6, '2026-01-26', '09:00:00', '18:00:00'),
(6, '2026-01-27', '09:00:00', '18:00:00'),
(6, '2026-01-28', '09:00:00', '18:00:00'),
(6, '2026-01-29', '09:00:00', '18:00:00'),
(6, '2026-01-30', '09:00:00', '18:00:00'),
(6, '2026-02-02', '09:00:00', '18:00:00'),
(6, '2026-02-03', '09:00:00', '18:00:00'),
(6, '2026-02-04', '09:00:00', '18:00:00'),
(6, '2026-02-05', '09:00:00', '18:00:00'),
(6, '2026-02-06', '09:00:00', '18:00:00'),
(6, '2026-02-09', '09:00:00', '18:00:00'),
(6, '2026-02-10', '09:00:00', '18:00:00'),
(6, '2026-02-11', '09:00:00', '18:00:00'),
(6, '2026-02-12', '09:00:00', '18:00:00'),
(6, '2026-02-13', '09:00:00', '18:00:00'),

-- Lab Eletrónica (7)
(7, '2026-01-26', '09:00:00', '18:00:00'),
(7, '2026-01-27', '09:00:00', '18:00:00'),
(7, '2026-01-28', '09:00:00', '18:00:00'),
(7, '2026-01-29', '09:00:00', '18:00:00'),
(7, '2026-01-30', '09:00:00', '18:00:00'),
(7, '2026-02-02', '09:00:00', '18:00:00'),
(7, '2026-02-03', '09:00:00', '18:00:00'),
(7, '2026-02-04', '09:00:00', '18:00:00'),
(7, '2026-02-05', '09:00:00', '18:00:00'),
(7, '2026-02-06', '09:00:00', '18:00:00'),
(7, '2026-02-09', '09:00:00', '18:00:00'),
(7, '2026-02-10', '09:00:00', '18:00:00'),
(7, '2026-02-11', '09:00:00', '18:00:00'),
(7, '2026-02-12', '09:00:00', '18:00:00'),
(7, '2026-02-13', '09:00:00', '18:00:00'),

-- Lab Robótica (8) - Manutenção na manhã de 28/01
(8, '2026-01-26', '09:00:00', '18:00:00'),
(8, '2026-01-27', '09:00:00', '18:00:00'),
(8, '2026-01-28', '14:00:00', '18:00:00'),
(8, '2026-01-29', '09:00:00', '18:00:00'),
(8, '2026-01-30', '09:00:00', '18:00:00'),
(8, '2026-02-02', '09:00:00', '18:00:00'),
(8, '2026-02-03', '09:00:00', '18:00:00'),
(8, '2026-02-04', '09:00:00', '18:00:00'),
(8, '2026-02-05', '09:00:00', '18:00:00'),
(8, '2026-02-06', '09:00:00', '18:00:00'),
(8, '2026-02-09', '09:00:00', '18:00:00'),
(8, '2026-02-10', '09:00:00', '18:00:00'),
(8, '2026-02-11', '09:00:00', '18:00:00'),
(8, '2026-02-12', '09:00:00', '18:00:00'),
(8, '2026-02-13', '09:00:00', '18:00:00'),

-- Lab Automação (9)
(9, '2026-01-26', '09:00:00', '18:00:00'),
(9, '2026-01-27', '09:00:00', '18:00:00'),
(9, '2026-01-28', '09:00:00', '18:00:00'),
(9, '2026-01-29', '09:00:00', '18:00:00'),
(9, '2026-01-30', '09:00:00', '18:00:00'),
(9, '2026-02-02', '09:00:00', '18:00:00'),
(9, '2026-02-03', '09:00:00', '18:00:00'),
(9, '2026-02-04', '09:00:00', '18:00:00'),
(9, '2026-02-05', '09:00:00', '18:00:00'),
(9, '2026-02-06', '09:00:00', '18:00:00'),
(9, '2026-02-09', '09:00:00', '18:00:00'),
(9, '2026-02-10', '09:00:00', '18:00:00'),
(9, '2026-02-11', '09:00:00', '18:00:00'),
(9, '2026-02-12', '09:00:00', '18:00:00'),
(9, '2026-02-13', '09:00:00', '18:00:00'),

-- Oficina Soldadura (10) - Horários restritos por segurança
(10, '2026-01-27', '09:00:00', '13:00:00'),
(10, '2026-01-29', '09:00:00', '13:00:00'),
(10, '2026-02-03', '09:00:00', '13:00:00'),
(10, '2026-02-05', '09:00:00', '13:00:00'),
(10, '2026-02-06', '09:00:00', '13:00:00'),
(10, '2026-02-10', '09:00:00', '13:00:00'),
(10, '2026-02-12', '09:00:00', '13:00:00'),

-- Oficina Mecânica (11)
(11, '2026-01-26', '09:00:00', '18:00:00'),
(11, '2026-01-27', '09:00:00', '18:00:00'),
(11, '2026-01-28', '09:00:00', '18:00:00'),
(11, '2026-01-29', '09:00:00', '18:00:00'),
(11, '2026-01-30', '09:00:00', '18:00:00'),
(11, '2026-02-02', '09:00:00', '18:00:00'),
(11, '2026-02-03', '09:00:00', '18:00:00'),
(11, '2026-02-04', '09:00:00', '18:00:00'),
(11, '2026-02-05', '09:00:00', '18:00:00'),
(11, '2026-02-06', '09:00:00', '18:00:00'),
(11, '2026-02-09', '09:00:00', '18:00:00'),
(11, '2026-02-10', '09:00:00', '18:00:00'),
(11, '2026-02-11', '09:00:00', '18:00:00'),
(11, '2026-02-12', '09:00:00', '18:00:00'),
(11, '2026-02-13', '09:00:00', '18:00:00'),

-- Salas Teóricas (16-23) - Todas disponíveis tempo completo
(16, '2026-01-26', '09:00:00', '18:00:00'),
(16, '2026-01-27', '09:00:00', '18:00:00'),
(16, '2026-01-28', '09:00:00', '18:00:00'),
(16, '2026-01-29', '09:00:00', '18:00:00'),
(16, '2026-01-30', '09:00:00', '18:00:00'),
(16, '2026-02-02', '09:00:00', '18:00:00'),
(16, '2026-02-03', '09:00:00', '18:00:00'),
(16, '2026-02-04', '09:00:00', '18:00:00'),
(16, '2026-02-05', '09:00:00', '18:00:00'),
(16, '2026-02-06', '09:00:00', '18:00:00'),
(16, '2026-02-09', '09:00:00', '18:00:00'),
(16, '2026-02-10', '09:00:00', '18:00:00'),
(16, '2026-02-11', '09:00:00', '18:00:00'),
(16, '2026-02-12', '09:00:00', '18:00:00'),
(16, '2026-02-13', '09:00:00', '18:00:00'),

(17, '2026-01-26', '09:00:00', '18:00:00'),
(17, '2026-01-27', '09:00:00', '18:00:00'),
(17, '2026-01-28', '09:00:00', '18:00:00'),
(17, '2026-01-29', '09:00:00', '18:00:00'),
(17, '2026-01-30', '09:00:00', '18:00:00'),
(17, '2026-02-02', '09:00:00', '18:00:00'),
(17, '2026-02-03', '09:00:00', '18:00:00'),
(17, '2026-02-04', '09:00:00', '18:00:00'),
(17, '2026-02-05', '09:00:00', '18:00:00'),
(17, '2026-02-06', '09:00:00', '18:00:00'),
(17, '2026-02-09', '09:00:00', '18:00:00'),
(17, '2026-02-10', '09:00:00', '18:00:00'),
(17, '2026-02-11', '09:00:00', '18:00:00'),
(17, '2026-02-12', '09:00:00', '18:00:00'),
(17, '2026-02-13', '09:00:00', '18:00:00'),

(18, '2026-01-26', '09:00:00', '18:00:00'),
(18, '2026-01-27', '09:00:00', '18:00:00'),
(18, '2026-01-28', '09:00:00', '18:00:00'),
(18, '2026-01-29', '09:00:00', '18:00:00'),
(18, '2026-01-30', '09:00:00', '18:00:00'),
(18, '2026-02-02', '09:00:00', '18:00:00'),
(18, '2026-02-03', '09:00:00', '18:00:00'),
(18, '2026-02-04', '09:00:00', '18:00:00'),
(18, '2026-02-05', '09:00:00', '18:00:00'),
(18, '2026-02-06', '09:00:00', '18:00:00'),
(18, '2026-02-09', '09:00:00', '18:00:00'),
(18, '2026-02-10', '09:00:00', '18:00:00'),
(18, '2026-02-11', '09:00:00', '18:00:00'),
(18, '2026-02-12', '09:00:00', '18:00:00'),
(18, '2026-02-13', '09:00:00', '18:00:00'),

(19, '2026-01-26', '09:00:00', '18:00:00'),
(19, '2026-01-27', '09:00:00', '18:00:00'),
(19, '2026-01-28', '09:00:00', '18:00:00'),
(19, '2026-01-29', '09:00:00', '18:00:00'),
(19, '2026-01-30', '09:00:00', '18:00:00'),
(19, '2026-02-02', '09:00:00', '18:00:00'),
(19, '2026-02-03', '09:00:00', '18:00:00'),
(19, '2026-02-04', '09:00:00', '18:00:00'),
(19, '2026-02-05', '09:00:00', '18:00:00'),
(19, '2026-02-06', '09:00:00', '18:00:00'),
(19, '2026-02-09', '09:00:00', '18:00:00'),
(19, '2026-02-10', '09:00:00', '18:00:00'),
(19, '2026-02-11', '09:00:00', '18:00:00'),
(19, '2026-02-12', '09:00:00', '18:00:00'),
(19, '2026-02-13', '09:00:00', '18:00:00'),

(20, '2026-01-26', '09:00:00', '18:00:00'),
(20, '2026-01-27', '09:00:00', '18:00:00'),
(20, '2026-01-28', '09:00:00', '18:00:00'),
(20, '2026-01-29', '09:00:00', '18:00:00'),
(20, '2026-01-30', '09:00:00', '18:00:00'),
(20, '2026-02-02', '09:00:00', '18:00:00'),
(20, '2026-02-03', '09:00:00', '18:00:00'),
(20, '2026-02-04', '09:00:00', '18:00:00'),
(20, '2026-02-05', '09:00:00', '18:00:00'),
(20, '2026-02-06', '09:00:00', '18:00:00'),
(20, '2026-02-09', '09:00:00', '18:00:00'),
(20, '2026-02-10', '09:00:00', '18:00:00'),
(20, '2026-02-11', '09:00:00', '18:00:00'),
(20, '2026-02-12', '09:00:00', '18:00:00'),
(20, '2026-02-13', '09:00:00', '18:00:00'),

(21, '2026-01-26', '09:00:00', '18:00:00'),
(21, '2026-01-27', '09:00:00', '18:00:00'),
(21, '2026-01-28', '09:00:00', '18:00:00'),
(21, '2026-01-29', '09:00:00', '18:00:00'),
(21, '2026-01-30', '09:00:00', '18:00:00'),
(21, '2026-02-02', '09:00:00', '18:00:00'),
(21, '2026-02-03', '09:00:00', '18:00:00'),
(21, '2026-02-04', '09:00:00', '18:00:00'),
(21, '2026-02-05', '09:00:00', '18:00:00'),
(21, '2026-02-06', '09:00:00', '18:00:00'),
(21, '2026-02-09', '09:00:00', '18:00:00'),
(21, '2026-02-10', '09:00:00', '18:00:00'),
(21, '2026-02-11', '09:00:00', '18:00:00'),
(21, '2026-02-12', '09:00:00', '18:00:00'),
(21, '2026-02-13', '09:00:00', '18:00:00');
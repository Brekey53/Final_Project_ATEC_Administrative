# ATEC Hawk Portal

Plataforma web FullStack desenvolvida no âmbito do Projeto Final do curso CET TPSI 0525. Sistema de gestão administrativa para a ATEC — Academia de Formação Profissional.

---

## Tecnologias

| Camada | Stack |
|--------|--------|
| **Frontend** | React 19, TypeScript, Vite, Bootstrap 5, React Router, Axios, FullCalendar |
| **Backend** | .NET 8, ASP.NET Core Web API, Entity Framework Core |
| **Base de dados** | SQL Server / MySQL (Pomelo) |
| **Autenticação** | JWT Bearer, Google, Facebook |
| **Outros** | iText (PDF), MailKit, ICal.Net |

---

## Funcionalidades

- **Autenticação** — Login, recuperação de palavra-passe, criação de conta
- **Utilizadores** — CRUD com controlo de roles (Admin, Formador, Formando, Geral)
- **Cursos e módulos** — Gestão de formações e respetivos conteúdos
- **Turmas** — Criação, edição e alocação de formadores
- **Formandos e formadores** — Gestão de utilizadores por perfil
- **Horários** — Agendamento com deteção de conflitos e geração automática
- **Disponibilidade** — Calendário de disponibilidade dos formadores
- **Salas** — Gestão de espaços e recursos
- **Avaliações** — Avaliação de formadores por módulo
- **Dashboard** — Visão consolidada por role

---

## Estrutura do projeto

```
├── backend/
│   └── API/
│       └── ProjetoAdministracaoEscola/    # .NET 8 Web API
├── frontend/
│   └── HAWKTUAH/                          # React + Vite
│       ├── src/
│       │   ├── auth/                      # Roles e permissões
│       │   ├── components/                # Componentes reutilizáveis
│       │   ├── layouts/                   # MainLayout, LoginLayout
│       │   ├── pages/                     # Páginas por domínio
│       │   ├── routes/                    # Rotas e proteção
│       │   ├── services/                  # Chamadas à API
│       │   └── utils/                     # Utilitários (datas, texto)
│       └── package.json
└── README.md
```

---

## Pré-requisitos

- **Node.js** 18+ e npm
- **.NET 8 SDK**
- **SQL Server** ou **MySQL** (conforme configuração do backend)

---

## Instalação e execução

### 1. Backend

```bash
cd backend/API/ProjetoAdministracaoEscola
dotnet restore
dotnet run
```

A API estará disponível em `https://localhost:7022`. Documentação Swagger em `/swagger`.

### 2. Frontend

```bash
cd frontend/HAWKTUAH
npm install
npm run dev
```

A aplicação será servida em `http://localhost:5173` (ou na porta indicada pelo Vite).

### 3. Configuração da API

O frontend está configurado para comunicar com a API em `https://localhost:7022/api`. Para alterar:

```
frontend/HAWKTUAH/src/config.constants.ts
```

```ts
export const API_BASE_URL = "https://localhost:7022/api";
```

> **Nota:** Em ambiente local com HTTPS, poderá ser necessário confiar no certificado de desenvolvimento do .NET.

---

## Roles e permissões

| Tipo (backend) | Role | Permissões |
|----------------|------|------------|
| 1, 4 | Admin / Administrativo | Utilizadores, formandos, formadores, cursos, salas, horários, módulos, turmas |
| 2 | Formador | Disponibilidade, avaliações, listagem de formandos |
| 3 | Formando | Dashboard, horários, avaliações |
| 5 | Geral | Dashboard, perfil |

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Pré-visualização do build |
| `npm run lint` | Verificação ESLint |
| `dotnet run` | Executar a API |
| `dotnet ef migrations add Nome` | Criar migração |
| `dotnet ef database update` | Aplicar migrações |

---

## Validações no frontend

- **Datas** — A data de fim deve ser igual ou posterior à data de início (turmas, disponibilidade, filtros)
- **Horários** — Bloqueio dos períodos de almoço (12h–13h) e jantar (19h–20h) na marcação de disponibilidade
- **Conflitos** — Impedimento de sobreposição de horários para o mesmo formador ou turma

---

## Licença

Projeto académico — CET TPSI 0525.

---

## Autores

Desenvolvido por **André Correia** e **Leonor Joaquim** | 2026

[![GitHub](https://img.shields.io/badge/GitHub-Brekey53-181717?style=for-the-badge&logo=github)](https://github.com/Brekey53) [![GitHub](https://img.shields.io/badge/GitHub-leonormcjoaquim-181717?style=for-the-badge&logo=github)](https://github.com/leonormcjoaquim)

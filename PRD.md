# 🌍 PRD - ESSENTIA CRM (Explora Aventura)

Este documento serve como referência técnica e funcional para agentes e desenvolvedores entenderem o ecossistema do sistema.

## 🚀 Visão Geral
O **ESSENTIA CRM** é uma plataforma robusta de gestão de relacionamento e operações para agências de turismo, especificamente focada na **Explora Aventura** (São Tomé e Príncipe). O sistema gerencia desde a vitrine pública de passeios até o controle financeiro, atribuição de guias e área logada de clientes.

---

## 🛠 Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL (Acesso direto via `pg` pool, sem ORM pesado visível em algumas rotas)
- **Estilização:** Tailwind CSS + shadcn/ui
- **Animações:** Framer Motion
- **Autenticação:** JWT (`jose`), Cookies e `bcryptjs`
- **Ícones:** Lucide React

---

## 📂 Estrutura de Módulos (Arquitetura)

### 1. 🏠 Área Pública
- **Home:** Landing page com Hero, Diferenciais e Destinos.
- **Catálogo de Passeios:** Listagem dinâmica via `/api/passeios`.
- **Detalhes do Passeio:** Visualização completa e formulário de interesse (Lead).
- **Checkout:** Fluxo de reserva com integração (simulada/precheck) de pagamento via PIX/Cartão.

### 2. 🏢 Painel Administrativo (`/admin`)
- **Dashboard:** Métricas em tempo real (Receita, Agendamentos Hoje, Clientes Novos).
- **Gestão de Agendamentos:** Quadro Kanban interativo (`@hello-pangea/dnd`) com colunas dinâmicas.
- **Catálogo de Passeios:** CRUD completo de experiências turísticas.
- **Gestão de Clientes & Leads:** Separação entre interessados e clientes com histórico.
- **Equipe de Guias:** Cadastro de guias, especialidades e acompanhamento de comissões.
- **Financeiro:** Emissão de faturas (PDF/Impressão), controle de câmbio (EUR/BRL) e pagamentos.
- **Configurações:** Dados fiscais da empresa, dados bancários e identidade visual.

### 3. 🗺 Área do Guia (`/guia`)
- **Dashboard do Guia:** Visualização de próximos passeios atribuídos.
- **Logística:** Informações de clientes, horários e locais de pick-up.
- **Comissões:** Acompanhamento de ganhos por passeio realizado.

### 4. 👤 Área do Cliente (`/cliente`)
- **Dashboard:** Resumo de viagens.
- **Minhas Reservas:** Histórico de vouchers e faturas.
- **Perfil:** Gestão de dados pessoais e alteração de senha.

---

## 📊 Modelo de Dados (Principais Tabelas)

| Tabela | Descrição |
| :--- | :--- |
| `users` | Credenciais, tipo de usuário (admin, guia, cliente) e perfil básico. |
| `clientes` | Dados detalhados de clientes, preferências, CPF e endereço. |
| `leads` | Interessados vindos do site que ainda não confirmaram reserva. |
| `passeios` | Catálogo: preços, durações, imagens (JSONB), tarifas por grupo. |
| `agendamentos`| O coração do sistema: vincula passeio, cliente, guia, hotel e status. |
| `guias` | Dados específicos de guias: idiomas, biografia e comissões. |
| `faturas` | Registro financeiro: câmbio, totais em EUR/BRL e status de pagamento. |
| `hoteis` / `locais`| Entidades de apoio para pick-up e destinos. |
| `kanban_columns`| Configuração dinâmica das fases do funil de vendas/operação. |

---

## 🔐 Segurança e Fluxos
- **Middleware de Auth:** Protege rotas de acordo com o `user_type`.
- **Password Hashing:** Uso de `bcryptjs` com salt 10.
- **Cálculo de Comissões:** Automatizado no banco de dados (default 30% mas ajustável).
- **Conversão de Lead:** O sistema permite transformar um `lead` em `cliente` e criar um `agendamento` em um único clique no Kanban.

---

## 📈 Pontos de Atenção para Outros Agentes
1. **Conexão DB:** Utiliza variáveis de ambiente (`DATABASE_URL`, `DB_HOST`, etc). Ver em `src/lib/db.ts`.
2. **Next.js 15:** Ficar atento aos componentes "use client" vs "use server" e ao tratamento de `params` como Promises.
3. **Internacionalização:** Embora em PT-BR, o sistema lida com câmbio em Euros (EUR) devido à localização em São Tomé e Príncipe.
4. **Impressão:** Existem componentes específicos para geração de Vouchers e Recibos prontos para impressão.

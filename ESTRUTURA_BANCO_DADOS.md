# 📊 Estrutura do Banco de Dados - Essentia CRM

## 🔗 Informações de Conexão

- **Tipo:** PostgreSQL
- **Host:** `<DB_HOST>`
- **Porta:** `5432`
- **Banco de Dados:** `essentia`
- **Usuário:** `postgres`
- **Senha:** `<DB_PASSWORD>`
- **Schema:** `public` (padrão)

## 📁 Tabelas (Planilhas) do Banco de Dados

Os dados do CRM Essentia estão organizados nas seguintes **tabelas** (equivalente a "planilhas" no Excel):

### 👥 Tabelas de Usuários e Autenticação

#### 1. **`users`** - Usuários do Sistema
   - **Localização no pgAdmin:** `essentia` → `Schemas` → `public` → `Tables` → `users`
   - **Dados armazenados:**
     - `id` - Identificador único (UUID)
     - `email` - Email do usuário (único)
     - `nome` - Nome completo
     - `first_name` - Primeiro nome
     - `last_name` - Sobrenome
     - `user_type` - Tipo de usuário (admin, guia, cliente)
     - `telefone` - Telefone
     - `cpf` - CPF
     - `endereco` - Endereço
     - `data_nascimento` - Data de nascimento
     - `password_hash` - Hash da senha
     - `created_at` - Data de criação
     - `updated_at` - Data de atualização

#### 2. **`sessions`** - Sessões de Usuários
   - **Localização:** `essentia` → `Schemas` → `public` → `Tables` → `sessions`
   - **Dados armazenados:**
     - `sid` - ID da sessão
     - `sess` - Dados da sessão (JSON)
     - `expire` - Data de expiração

### 🎯 Tabelas do CRM (Sistema de Turismo)

#### 3. **`clientes`** - Clientes/Cadastros
   - **Localização:** `essentia` → `Schemas` → `public` → `Tables` → `clientes`
   - **Dados armazenados:**
     - `id` - ID único do cliente
     - `nome` - Nome do cliente
     - `email` - Email (único)
     - `telefone` - Telefone
     - `cpf` - CPF
     - `data_nascimento` - Data de nascimento
     - `endereco` - Endereço (JSON)
     - `preferencias` - Preferências (JSON)
     - `observacoes` - Observações
     - `status` - Status (ativo, inativo)
     - `criado_em` - Data de criação
     - `atualizado_em` - Data de atualização

#### 4. **`passeios`** - Passeios/Tours
   - **Localização:** `essentia` → `Schemas` → `public` → `Tables` → `passeios`
   - **Dados armazenados:**
     - `id` - ID único do passeio
     - `nome` - Nome do passeio
     - `descricao` - Descrição completa
     - `preco` - Preço
     - `duracao` - Duração
     - `categoria` - Categoria
     - `imagens` - Array de imagens (JSON)
     - `inclusoes` - O que está incluído (JSON)
     - `idiomas` - Idiomas disponíveis (JSON)
     - `capacidade_maxima` - Capacidade máxima
     - `ativo` - Se está ativo (1 ou 0)
     - `criado_em` - Data de criação
     - `atualizado_em` - Data de atualização

#### 5. **`guias`** - Guias de Turismo
   - **Localização:** `essentia` → `Schemas` → `public` → `Tables` → `guias`
   - **Dados armazenados:**
     - `id` - ID único do guia
     - `nome` - Nome do guia
     - `email` - Email (único)
     - `telefone` - Telefone
     - `cpf` - CPF
     - `especialidades` - Especialidades (JSON)
     - `idiomas` - Idiomas falados (JSON)
     - `avaliacao_media` - Avaliação média
     - `total_avaliacoes` - Total de avaliações
     - `passeios_realizados` - Passeios realizados
     - `comissao_total` - Comissão total acumulada
     - `percentual_comissao` - Percentual de comissão
     - `biografia` - Biografia
     - `foto` - URL da foto
     - `status` - Status (ativo, inativo)
     - `data_registro` - Data de registro
     - `criado_em` - Data de criação
     - `atualizado_em` - Data de atualização

#### 6. **`agendamentos`** - Agendamentos/Reservas
   - **Localização:** `essentia` → `Schemas` → `public` → `Tables` → `agendamentos`
   - **Dados armazenados:**
     - `id` - ID único do agendamento
     - `passeio_id` - ID do passeio (FK)
     - `cliente_id` - ID do cliente (FK)
     - `guia_id` - ID do guia (FK)
     - `data_passeio` - Data do passeio
     - `horario_inicio` - Horário de início
     - `horario_fim` - Horário de fim
     - `numero_pessoas` - Número de pessoas
     - `valor_total` - Valor total
     - `valor_comissao` - Valor da comissão
     - `percentual_comissao` - Percentual de comissão
     - `status` - Status (em_progresso, confirmado, cancelado, etc.)
     - `observacoes` - Observações
     - `motivo_cancelamento` - Motivo do cancelamento (se cancelado)
     - `avaliacao_cliente` - Avaliação do cliente (1-5)
     - `comentario_cliente` - Comentário do cliente
     - `criado_em` - Data de criação
     - `atualizado_em` - Data de atualização

## 🔍 Como Acessar os Dados no pgAdmin 4

### Passo a Passo:

1. **Abra o pgAdmin 4**

2. **Conecte-se ao servidor:**
   - Clique com botão direito em `Servers` → `Create` → `Server`
   - **General Tab:**
     - Name: `Essentia CRM` (ou qualquer nome)
   - **Connection Tab:**
     - Host: `<DB_HOST>`
     - Port: `5432`
     - Maintenance database: `essentia`
     - Username: `postgres`
     - Password: `<DB_PASSWORD>`
   - Clique em `Save`

3. **Navegue até as tabelas:**
   - Expanda: `Servers` → `Essentia CRM` → `Databases` → `essentia` → `Schemas` → `public` → `Tables`

4. **Visualizar dados de uma tabela:**
   - Clique com botão direito na tabela (ex: `users`)
   - Selecione `View/Edit Data` → `All Rows`
   - Ou use `Query Tool` para executar SQL

5. **Executar consultas SQL:**
   - Clique com botão direito em `essentia` → `Query Tool`
   - Digite sua query SQL, por exemplo:
   ```sql
   SELECT * FROM users;
   SELECT * FROM clientes;
   SELECT * FROM agendamentos WHERE status = 'confirmado';
   ```

## 📊 Consultas SQL Úteis

### Ver todos os clientes:
```sql
SELECT * FROM clientes ORDER BY criado_em DESC;
```

### Ver todos os agendamentos:
```sql
SELECT 
    a.*,
    c.nome as cliente_nome,
    p.nome as passeio_nome,
    g.nome as guia_nome
FROM agendamentos a
LEFT JOIN clientes c ON a.cliente_id = c.id
LEFT JOIN passeios p ON a.passeio_id = p.id
LEFT JOIN guias g ON a.guia_id = g.id
ORDER BY a.criado_em DESC;
```

### Ver todos os usuários:
```sql
SELECT id, email, nome, user_type, created_at 
FROM users 
ORDER BY created_at DESC;
```

### Contar registros por tabela:
```sql
SELECT 
    'users' as tabela, COUNT(*) as total FROM users
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'passeios', COUNT(*) FROM passeios
UNION ALL
SELECT 'guias', COUNT(*) FROM guias
UNION ALL
SELECT 'agendamentos', COUNT(*) FROM agendamentos;
```

## 🔐 Segurança

⚠️ **IMPORTANTE:**
- O arquivo `.env.local` contém credenciais sensíveis
- **NUNCA** faça commit deste arquivo no Git
- Mantenha as credenciais seguras
- Use variáveis de ambiente em produção

## 📝 Notas

- Todas as tabelas estão no schema `public` (padrão do PostgreSQL)
- Os dados são armazenados em formato relacional (não são "planilhas" como Excel)
- Use SQL para consultar e manipular os dados
- O pgAdmin 4 é uma ferramenta visual para gerenciar o banco






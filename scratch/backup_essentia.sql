--
-- PostgreSQL database dump
--

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    contact_id uuid,
    company_id uuid,
    deal_id uuid,
    owner_id character varying,
    type character varying(50) NOT NULL,
    subject character varying(255) NOT NULL,
    description text,
    due_date timestamp without time zone,
    completed_at timestamp without time zone,
    duration_minutes integer,
    status character varying(50) DEFAULT 'pending'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    deleted_at timestamp without time zone
);


ALTER TABLE public.activities OWNER TO postgres;

--
-- Name: agendamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agendamentos (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    passeio_id character varying NOT NULL,
    cliente_id character varying(255),
    guia_id character varying,
    data_passeio character varying NOT NULL,
    horario_inicio character varying,
    horario_fim character varying,
    numero_pessoas integer DEFAULT 1 NOT NULL,
    valor_total real NOT NULL,
    valor_comissao real DEFAULT 0,
    percentual_comissao real DEFAULT 30,
    status character varying DEFAULT 'em_progresso'::character varying NOT NULL,
    observacoes text,
    motivo_cancelamento text,
    avaliacao_cliente integer,
    comentario_cliente text,
    criado_em timestamp without time zone DEFAULT now(),
    atualizado_em timestamp without time zone DEFAULT now(),
    hotel_id character varying(255),
    local_id character varying(255)
);


ALTER TABLE public.agendamentos OWNER TO postgres;

--
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    id character varying(255) NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_by character varying,
    updated_by character varying,
    nc_order numeric,
    title text,
    email text,
    telefone text,
    nome text,
    "Mensagem" text,
    assignee text,
    cpf character varying(255),
    data_nascimento character varying(255),
    endereco text,
    preferencias jsonb,
    status character varying(50) DEFAULT 'ativo'::character varying,
    origem character varying(100),
    observacoes text,
    atualizado_em timestamp without time zone DEFAULT now()
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_id_seq OWNER TO postgres;

--
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid,
    name character varying(255) NOT NULL,
    website character varying(500),
    industry character varying(100),
    size character varying(50),
    phone character varying(50),
    email character varying(255),
    address jsonb,
    description text,
    logo_url character varying(500),
    tags jsonb DEFAULT '[]'::jsonb,
    custom_fields jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    deleted_at timestamp without time zone
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid,
    company_id uuid,
    first_name character varying(100) NOT NULL,
    last_name character varying(100),
    full_name character varying(255) GENERATED ALWAYS AS (
CASE
    WHEN (last_name IS NOT NULL) THEN ((((first_name)::text || ' '::text) || (last_name)::text))::character varying
    ELSE first_name
END) STORED,
    email character varying(255),
    phone character varying(50),
    mobile character varying(50),
    job_title character varying(200),
    department character varying(100),
    address jsonb,
    birthday date,
    notes text,
    cliente_id character varying,
    status character varying(50) DEFAULT 'active'::character varying,
    source character varying(100),
    tags jsonb DEFAULT '[]'::jsonb,
    custom_fields jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    deleted_at timestamp without time zone
);


ALTER TABLE public.contacts OWNER TO postgres;

--
-- Name: deals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    pipeline_id uuid NOT NULL,
    stage_id uuid NOT NULL,
    contact_id uuid,
    company_id uuid,
    owner_id character varying,
    title character varying(255) NOT NULL,
    description text,
    value numeric(15,2) DEFAULT 0 NOT NULL,
    currency character varying(3) DEFAULT 'BRL'::character varying,
    expected_close_date date,
    actual_close_date date,
    status character varying(50) DEFAULT 'open'::character varying,
    probability integer DEFAULT 0,
    priority character varying(20) DEFAULT 'medium'::character varying,
    tags jsonb DEFAULT '[]'::jsonb,
    custom_fields jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    deleted_at timestamp without time zone
);


ALTER TABLE public.deals OWNER TO postgres;

--
-- Name: empresa_configuracoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa_configuracoes (
    id integer DEFAULT 1 NOT NULL,
    razao_social character varying(255),
    slogan character varying(255),
    email character varying(255),
    telefone character varying(255),
    p_iva character varying(255),
    c_f character varying(255),
    banco_nome character varying(255),
    banco_agencia character varying(255),
    banco_conta character varying(255),
    banco_pix character varying(255),
    banco_beneficiario character varying(255),
    endereco_completo text,
    atualizado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT empresa_configuracoes_id_check CHECK ((id = 1))
);


ALTER TABLE public.empresa_configuracoes OWNER TO postgres;

--
-- Name: events_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid,
    event_type character varying(100) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    user_id character varying,
    changes jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    webhook_sent boolean DEFAULT false,
    webhook_attempts integer DEFAULT 0,
    webhook_last_attempt timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.events_log OWNER TO postgres;

--
-- Name: fatura_itens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fatura_itens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fatura_id uuid,
    servico_descricao character varying(255) NOT NULL,
    fornecedor character varying(255),
    valor_eur numeric(10,2) DEFAULT 0.00
);


ALTER TABLE public.fatura_itens OWNER TO postgres;

--
-- Name: faturas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faturas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cliente_id character varying(255),
    fatura_numero character varying(50) NOT NULL,
    data_emissao date NOT NULL,
    data_vencimento date NOT NULL,
    cotacao_cambio_turismo numeric(10,4) DEFAULT 1.0000,
    total_eur numeric(15,2) DEFAULT 0.00,
    total_brl numeric(15,2) DEFAULT 0.00,
    status character varying(50) DEFAULT 'Pendente'::character varying,
    criado_em timestamp without time zone DEFAULT now(),
    atualizado_em timestamp without time zone DEFAULT now()
);


ALTER TABLE public.faturas OWNER TO postgres;

--
-- Name: guias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guias (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    nome character varying NOT NULL,
    email character varying NOT NULL,
    telefone character varying,
    cpf character varying,
    especialidades jsonb,
    idiomas jsonb,
    avaliacao_media real DEFAULT 0,
    total_avaliacoes integer DEFAULT 0,
    passeios_realizados integer DEFAULT 0,
    comissao_total real DEFAULT 0,
    percentual_comissao real DEFAULT 30,
    biografia text,
    foto character varying,
    status character varying DEFAULT 'ativo'::character varying,
    data_registro timestamp without time zone DEFAULT now(),
    criado_em timestamp without time zone DEFAULT now(),
    atualizado_em timestamp without time zone DEFAULT now()
);


ALTER TABLE public.guias OWNER TO postgres;

--
-- Name: historico_messagem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historico_messagem (
    id integer NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_by character varying,
    updated_by character varying,
    nc_order numeric,
    title text,
    session_id text,
    messagem text,
    message json
);


ALTER TABLE public.historico_messagem OWNER TO postgres;

--
-- Name: historico messagem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."historico messagem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."historico messagem_id_seq" OWNER TO postgres;

--
-- Name: historico messagem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."historico messagem_id_seq" OWNED BY public.historico_messagem.id;


--
-- Name: hoteis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hoteis (
    id character varying(255) NOT NULL,
    nome character varying(255) NOT NULL,
    endereco text,
    cidade character varying(100),
    telefone character varying(50),
    criado_em timestamp without time zone DEFAULT now(),
    atualizado_em timestamp without time zone DEFAULT now()
);


ALTER TABLE public.hoteis OWNER TO postgres;

--
-- Name: integration_webhooks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.integration_webhooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    event_type character varying(100) NOT NULL,
    target_url character varying(500) NOT NULL,
    method character varying(10) DEFAULT 'POST'::character varying,
    headers jsonb DEFAULT '{}'::jsonb,
    secret_token character varying(255),
    is_active boolean DEFAULT true,
    retry_count integer DEFAULT 3,
    timeout_seconds integer DEFAULT 30,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.integration_webhooks OWNER TO postgres;

--
-- Name: kanban_columns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kanban_columns (
    id character varying NOT NULL,
    title character varying NOT NULL,
    color character varying DEFAULT 'purple'::character varying NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    ativo integer DEFAULT 1,
    criado_em timestamp without time zone DEFAULT now(),
    atualizado_em timestamp without time zone DEFAULT now()
);


ALTER TABLE public.kanban_columns OWNER TO postgres;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    telefone character varying(50),
    passeio_id character varying(255),
    passeio_nome character varying(255),
    data_passeio date,
    numero_pessoas integer,
    observacoes text,
    status character varying(50) DEFAULT 'novo'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp with time zone DEFAULT now(),
    criado_em timestamp with time zone DEFAULT now()
);


ALTER TABLE public.leads OWNER TO postgres;

--
-- Name: locais; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locais (
    id character varying(255) NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    criado_em timestamp without time zone DEFAULT now(),
    atualizado_em timestamp without time zone DEFAULT now()
);


ALTER TABLE public.locais OWNER TO postgres;

--
-- Name: notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    contact_id uuid,
    company_id uuid,
    deal_id uuid,
    activity_id uuid,
    author_id character varying,
    title character varying(255),
    content text NOT NULL,
    is_private boolean DEFAULT false,
    tags jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    deleted_at timestamp without time zone
);


ALTER TABLE public.notes OWNER TO postgres;

--
-- Name: organization_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    user_id character varying NOT NULL,
    role character varying(50) DEFAULT 'member'::character varying NOT NULL,
    permissions jsonb DEFAULT '{}'::jsonb,
    joined_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.organization_members OWNER TO postgres;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    logo_url character varying(500),
    settings jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: passeios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.passeios (
    id character varying NOT NULL,
    nome character varying NOT NULL,
    descricao text NOT NULL,
    preco real NOT NULL,
    duracao character varying NOT NULL,
    categoria character varying NOT NULL,
    imagens jsonb DEFAULT '[]'::jsonb,
    inclusoes jsonb DEFAULT '[]'::jsonb,
    idiomas jsonb DEFAULT '[]'::jsonb,
    capacidade_maxima integer DEFAULT 20,
    ativo integer DEFAULT 1,
    criado_em timestamp without time zone DEFAULT now(),
    atualizado_em timestamp without time zone DEFAULT now()
);


ALTER TABLE public.passeios OWNER TO postgres;

--
-- Name: pipeline_stages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pipeline_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pipeline_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "position" integer DEFAULT 0 NOT NULL,
    color character varying(7) DEFAULT '#3B82F6'::character varying,
    probability integer DEFAULT 0,
    is_closed boolean DEFAULT false,
    is_won boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pipeline_stages OWNER TO postgres;

--
-- Name: pipelines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pipelines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_default boolean DEFAULT false,
    "position" integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pipelines OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess text NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid,
    name character varying(100) NOT NULL,
    color character varying(7) DEFAULT '#6B7280'::character varying,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    email character varying NOT NULL,
    nome character varying NOT NULL,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    user_type character varying DEFAULT 'cliente'::character varying NOT NULL,
    telefone character varying,
    endereco text,
    data_nascimento timestamp without time zone,
    cpf character varying,
    password_hash text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- Name: historico_messagem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_messagem ALTER COLUMN id SET DEFAULT nextval('public."historico messagem_id_seq"'::regclass);


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activities (id, organization_id, contact_id, company_id, deal_id, owner_id, type, subject, description, due_date, completed_at, duration_minutes, status, priority, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: agendamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agendamentos (id, passeio_id, cliente_id, guia_id, data_passeio, horario_inicio, horario_fim, numero_pessoas, valor_total, valor_comissao, percentual_comissao, status, observacoes, motivo_cancelamento, avaliacao_cliente, comentario_cliente, criado_em, atualizado_em, hotel_id, local_id) FROM stdin;
42375d52-a8ae-44cd-8eca-c3e5e742756a	demo-1	\N	\N	2025-12-31T14:16	\N	\N	1	150	45	30	confirmadas	teste	\N	\N	\N	2025-12-28 13:16:40.729021	2025-12-28 13:53:34.677	\N	\N
3b1734eb-f235-4123-b485-ad2c28875e31	demo-2	7022	f6d71529-328c-4b7b-87ae-06a9d90aeaf9	2026-01-11T18:32	\N	\N	1	280	84	30	confirmadas	teste	\N	\N	\N	2025-12-31 17:32:19.098936	2025-12-31 17:32:34.825008	\N	\N
e9446a51-48a8-4829-b871-7a7bbcf33b0e	demo-3	8aa5248a-57cd-4511-9623-cbb70941dc8c	\N	2026-01-07T00:00:00.000+01:00	\N	\N	2	400	0	30	confirmadas	novo teste	\N	\N	\N	2026-01-02 17:02:57.483806	2026-01-02 17:03:50.43955	\N	\N
9efc3d5a-f2dd-4e18-9cfe-2a7a23fc2b16	demo-3	\N	\N	2026-01-01T14:18	\N	\N	1	200	60	30	pendente_cliente	teste	\N	\N	\N	2025-12-28 13:18:48.181315	2026-02-05 15:49:28.738062	\N	\N
7e61c855-8b3e-4b46-9288-a58332dabb44	passeio_1767290382457	\N	\N	2026-04-14T09:00	\N	\N	1	300	90	30	em_progresso	Nomes: Ely & Eloisa Néia\nUm casal de 70anos, 1axFlorença. animados, gostam de comidas e vinhos em geral. Telefones:\nEly - +55 11 99993-1539\nEloisa - +55 11 97472-3506\nHotel – 13-17 de Abril\n13-17 de Abril - Grand Hotel Minerva\nSchedule:\n14/04 - 9h “City tour de 4h\n15/04 - Passeio a Lucca “Uber” - saída às 9h - 4h sem guia \nPrecisa de mais alguma coisa?\nVocê vai me mandar alguma coisa? Me fqla como você faz habitualmente.\nTudo confirmado! será um prazer guiar lhes pessosalmente te enviarei um voucher nos próximos dias	\N	\N	\N	2026-03-30 08:52:17.532036	2026-03-30 08:52:17.532036	\N	\N
030a2b39-5167-48b8-9719-2f767c02aeaa	passeio_1767290143953	\N	\N	2026-04-15T09:00	\N	\N	2	600	180	30	em_progresso	Telefones:\nEly - +55 11 99993-1539\nEloisa+55 11 97472-350/ 13-17/04 - Grand Hotel Minerva\nSchedule:\n14/04 - 9h “City tour de 4h\n15/04 - Passeio a Lucca “Uber” - saída às 9h - 4h sem guia \nTudo confirmado! será um prazer guiar lhes pessosalmente 🥰\n te enviarei um voucher nos próximos dias	\N	\N	\N	2026-03-30 08:55:41.116814	2026-03-30 08:55:41.116814	\N	\N
8cdc246e-386d-4551-a1d1-39f7e6126820	passeio_1767290143953	\N	\N	2026-04-21T10:00	\N	\N	1	300	90	30	em_progresso	Querida, tudo bem? Você faz tour com criança, 2 meninos de 12 e 1 menino de 8 anos. Se sim, estaria livre dia 21.04?	\N	\N	\N	2026-03-30 08:58:52.278457	2026-03-30 08:58:52.278457	\N	\N
e78e77d5-74e1-4ea6-a19e-db1ad67b010d	rot-firenze-centro	4cb6ecfc-2ef8-4b7e-96aa-bd6b2fcd25d2	94dc506b-ae4f-40eb-96b8-e809d53cd146	2026-05-02T09:00	\N	\N	1	400	0	30	confirmadas	\N	\N	\N	\N	2026-05-02 08:40:42.522323	2026-05-02 08:40:42.522323	nh-firenze	firenze
9c0a5612-32f9-49fc-a571-a21cc45a3d5e	rot-arezzo-cortona	4cb6ecfc-2ef8-4b7e-96aa-bd6b2fcd25d2	94dc506b-ae4f-40eb-96b8-e809d53cd146	2026-05-03T09:00	\N	\N	1	610	0	30	confirmadas	\N	\N	\N	\N	2026-05-02 08:40:42.54374	2026-05-02 08:40:42.54374	nh-firenze	arezzo
ecb02273-3591-4d81-92ab-058854a38d87	rot-chianti	4cb6ecfc-2ef8-4b7e-96aa-bd6b2fcd25d2	94dc506b-ae4f-40eb-96b8-e809d53cd146	2026-05-04T09:00	\N	\N	1	0	0	30	confirmadas	\N	\N	\N	\N	2026-05-02 08:40:42.563226	2026-05-02 08:40:42.563226	nh-firenze	chianti
77c92c9b-5247-41c1-b8bf-4eb821e9fff0	rot-badia-sovana	4cb6ecfc-2ef8-4b7e-96aa-bd6b2fcd25d2	94dc506b-ae4f-40eb-96b8-e809d53cd146	2026-05-07T09:00	\N	\N	1	0	0	30	confirmadas	\N	\N	\N	\N	2026-05-02 08:40:42.584074	2026-05-02 08:40:42.584074	agriturismo-la-sovana	firenze
f5de7b61-eecf-4517-afd4-08e54fa74a52	rot-assis-perugia	4cb6ecfc-2ef8-4b7e-96aa-bd6b2fcd25d2	94dc506b-ae4f-40eb-96b8-e809d53cd146	2026-05-08T09:00	\N	\N	1	580	0	30	confirmadas	\N	\N	\N	\N	2026-05-02 08:40:42.606123	2026-05-02 08:40:42.606123	agriturismo-la-sovana	assis
976a8449-47f3-4d6e-9228-21fd4e035231	rot-montepulciano	4cb6ecfc-2ef8-4b7e-96aa-bd6b2fcd25d2	94dc506b-ae4f-40eb-96b8-e809d53cd146	2026-05-09T09:00	\N	\N	1	320	0	30	confirmadas	\N	\N	\N	\N	2026-05-02 08:40:42.625208	2026-05-02 08:40:42.625208	agriturismo-la-sovana	montepulciano
c1866c34-ac2e-4673-a5c3-9daa980bb089	rot-pienza-siena	4cb6ecfc-2ef8-4b7e-96aa-bd6b2fcd25d2	94dc506b-ae4f-40eb-96b8-e809d53cd146	2026-05-10T09:00	\N	\N	1	320	0	30	confirmadas	\N	\N	\N	\N	2026-05-02 08:40:42.645296	2026-05-02 08:40:42.645296	athena-hotel	pienza
5c57eb38-b6db-493d-a5e4-3fb650e0af6e	rot-siena-centro	4cb6ecfc-2ef8-4b7e-96aa-bd6b2fcd25d2	94dc506b-ae4f-40eb-96b8-e809d53cd146	2026-05-11T09:00	\N	\N	1	290	0	30	confirmadas	\N	\N	\N	\N	2026-05-02 08:40:42.664098	2026-05-02 08:40:42.664098	athena-hotel	siena
748cf186-8199-4583-9205-18778d7ae92e	rot-san-gimignano	4cb6ecfc-2ef8-4b7e-96aa-bd6b2fcd25d2	94dc506b-ae4f-40eb-96b8-e809d53cd146	2026-05-12T09:00	\N	\N	1	320	0	30	confirmadas	\N	\N	\N	\N	2026-05-02 08:40:42.683282	2026-05-02 08:40:42.683282	athena-hotel	san-gimignano
d86242de-e202-4fa8-8639-f27dc0505a64	rot-volterra-colle	4cb6ecfc-2ef8-4b7e-96aa-bd6b2fcd25d2	94dc506b-ae4f-40eb-96b8-e809d53cd146	2026-05-13T09:00	\N	\N	1	290	0	30	confirmadas	\N	\N	\N	\N	2026-05-02 08:40:42.702184	2026-05-02 08:40:42.702184	athena-hotel	volterra
aaab2c43-3cab-432f-9f03-16c60d6fcbcc	rot-montalcino-san-quirico	4cb6ecfc-2ef8-4b7e-96aa-bd6b2fcd25d2	94dc506b-ae4f-40eb-96b8-e809d53cd146	2026-05-14T09:00	\N	\N	1	0	0	30	confirmadas	\N	\N	\N	\N	2026-05-02 08:40:42.720827	2026-05-02 08:40:42.720827	athena-hotel	montalcino
f02f163e-e69c-4f9f-89dc-cd2740b979db	rot-orvieto-roma	4cb6ecfc-2ef8-4b7e-96aa-bd6b2fcd25d2	94dc506b-ae4f-40eb-96b8-e809d53cd146	2026-05-15T09:00	\N	\N	1	0	0	30	confirmadas	\N	\N	\N	\N	2026-05-02 08:40:42.74316	2026-05-02 08:40:42.74316	rose-garden-palace	orvieto
2d6792b4-5442-44ec-a5ca-f04e1241f12d	rot-montepulciano	7021	f6d71529-328c-4b7b-87ae-06a9d90aeaf9	2026-05-12T10:00	\N	\N	1	320	96	30	em_progresso	teste	\N	\N	\N	2026-05-02 17:38:51.825379	2026-05-02 17:38:51.825379	athena-hotel	firenze
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (id, created_at, updated_at, created_by, updated_by, nc_order, title, email, telefone, nome, "Mensagem", assignee, cpf, data_nascimento, endereco, preferencias, status, origem, observacoes, atualizado_em) FROM stdin;
7021	\N	\N	\N	\N	\N	\N	aurelio uzual	7889877990	aurelio	\N	\N	\N	\N	\N	\N	ativo	\N	\N	2026-01-02 15:54:50.424314
7043	\N	\N	\N	\N	\N	\N	\N	263428195242064@lid	Moovelabs	Parar o atendimento	\N	\N	\N	\N	\N	ativo	\N	\N	2026-01-02 15:54:50.424314
7047	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ativo	\N	\N	2026-01-02 15:54:50.424314
test-uuid-1767371134550	\N	\N	\N	\N	\N	\N	test1767371134551@example.com	1234	Test User	\N	\N	\N	\N	\N	\N	ativo	\N	\N	2026-01-02 16:25:34.681118
test-uuid-1767371206172	\N	\N	\N	\N	\N	\N	test1767371206172@example.com	1234	Test User	\N	\N	\N	\N	\N	\N	ativo	\N	\N	2026-01-02 16:26:46.30243
8aa5248a-57cd-4511-9623-cbb70941dc8c	\N	\N	\N	\N	\N	\N	maria@gmail.com	9998--8009958	Maria Aparecida do carvallho	\N	\N	\N	\N	\N	\N	ativo	\N	\N	2026-01-02 17:02:57.432619
7054	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ativo	\N	\N	2026-02-05 09:59:53.435584
7053	\N	\N	\N	\N	0	\N	\N	41779661285@s.whatsapp.net	Elisson	Olá bom dia	20	\N	\N	\N	\N	ativo	\N	\N	2026-02-05 09:59:46.535959
ffuot464mniy4x2r	\N	\N	\N	\N	\N	\N	test.user@test.com	12345	Test User	\N	\N	111222	\N	Rua X	\N	novo	\N	\N	2026-04-03 13:35:31.625011
cbqwfkfvmnj3zcpl	\N	\N	\N	\N	\N	\N	moovelabs.ch@gmail.com	0767673274	cliente teste	\N	\N	03351051654	\N	rue de lyon 10	\N	novo	\N	\N	2026-04-03 16:19:09.519763
4cb6ecfc-2ef8-4b7e-96aa-bd6b2fcd25d2	\N	\N	\N	\N	\N	\N	roteiro@marise.com	\N	Roteiro Marise	\N	\N	\N	\N	\N	\N	ativo	\N	\N	2026-05-02 08:40:02.496789
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, organization_id, name, website, industry, size, phone, email, address, description, logo_url, tags, custom_fields, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contacts (id, organization_id, company_id, first_name, last_name, email, phone, mobile, job_title, department, address, birthday, notes, cliente_id, status, source, tags, custom_fields, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: deals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deals (id, organization_id, pipeline_id, stage_id, contact_id, company_id, owner_id, title, description, value, currency, expected_close_date, actual_close_date, status, probability, priority, tags, custom_fields, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: empresa_configuracoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empresa_configuracoes (id, razao_social, slogan, email, telefone, p_iva, c_f, banco_nome, banco_agencia, banco_conta, banco_pix, banco_beneficiario, endereco_completo, atualizado_em) FROM stdin;
1	Marise Nakagawa	Guia e receptivo na Toscana	mariseinflorence@gmail.com	\N	05603120485	NKGMRS70S46Z602U	Banco do Brasil	\N	Câmbio do turismo	11510084860	Marise da Silva Nakagawa	\N	2026-03-24 10:15:09.210841
\.


--
-- Data for Name: events_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events_log (id, organization_id, event_type, entity_type, entity_id, action, user_id, changes, metadata, webhook_sent, webhook_attempts, webhook_last_attempt, created_at) FROM stdin;
\.


--
-- Data for Name: fatura_itens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fatura_itens (id, fatura_id, servico_descricao, fornecedor, valor_eur) FROM stdin;
fcb4e751-ff5d-4ad7-b176-e5050cb4b1d4	e3d9ab8a-cd35-470a-9cc2-03317c1ee636	passeio italia		700.00
461c07cf-96a3-4046-8092-18c5bc02a30b	8e3eb252-098d-4af4-a63e-e0eddf597475	turismo na italia		500.00
70303a16-0f8d-4755-b59d-f0aafe30d3e0	0a1277a5-9e65-40ee-b7ea-0cc5c34bc1a4	Passeios 23/04 – 10h00 – 3h city tour 24/04 – 1h para visita a Accademia (10h) e 2h para a visita ao Uffizi (14h45) 		6000.00
12f1a875-6bcf-4403-84c9-2b4c73e37547	ff889de8-1dc8-4442-bb10-d9a403a916c3	Tour Roma Clássica (Teste)	Vaticano Tickets	200.00
b694ba9c-2a1e-474f-8c24-f09596ad6f4e	721d8cf3-2000-4114-b367-7c631987c312	nota teste		245.00
\.


--
-- Data for Name: faturas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faturas (id, cliente_id, fatura_numero, data_emissao, data_vencimento, cotacao_cambio_turismo, total_eur, total_brl, status, criado_em, atualizado_em) FROM stdin;
e3d9ab8a-cd35-470a-9cc2-03317c1ee636	803408d9-91c2-4646-8301-b99a3f3df49d	FT-1748	2026-03-24	2026-03-24	6.4500	700.00	4515.00	Pendente	2026-03-24 08:09:27.199085	2026-03-24 08:09:27.199085
8e3eb252-098d-4af4-a63e-e0eddf597475	8aa5248a-57cd-4511-9623-cbb70941dc8c	FT-6293	2026-03-24	2026-03-24	6.4500	500.00	3225.00	Pendente	2026-03-24 11:00:41.522201	2026-03-24 11:00:41.522201
0a1277a5-9e65-40ee-b7ea-0cc5c34bc1a4	ea1e4627-b5ec-46f8-8377-1cc8792769c6	FT-7869	2026-04-02	2026-04-02	6.4500	6000.00	38700.00	Pendente	2026-04-02 15:34:10.519561	2026-04-02 15:34:10.519561
ff889de8-1dc8-4442-bb10-d9a403a916c3	ffuot464mniy4x2r	FT-777	2026-04-03	2026-04-10	6.2000	200.00	1240.00	Pendente	2026-04-03 13:37:22.317863	2026-04-03 13:37:22.317863
721d8cf3-2000-4114-b367-7c631987c312	cbqwfkfvmnj3zcpl	FT-6258	2026-04-03	2026-04-03	6.4500	245.00	1580.25	Pendente	2026-04-03 16:20:28.956288	2026-04-03 16:20:28.956288
\.


--
-- Data for Name: guias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guias (id, nome, email, telefone, cpf, especialidades, idiomas, avaliacao_media, total_avaliacoes, passeios_realizados, comissao_total, percentual_comissao, biografia, foto, status, data_registro, criado_em, atualizado_em) FROM stdin;
f6d71529-328c-4b7b-87ae-06a9d90aeaf9	Jão Silva	jao@gmail.com	995889970089	\N	"[]"	"[]"	0	0	0	0	30		\N	ativo	2025-12-28 11:02:56.807	2025-12-28 11:02:56.807	2025-12-28 11:02:56.807
94dc506b-ae4f-40eb-96b8-e809d53cd146	Marise Nakagawa	marise@essentia.com	\N	\N	\N	\N	0	0	0	0	30	\N	\N	ativo	2026-05-02 08:40:01.957507	2026-05-02 08:40:01.957507	2026-05-02 08:40:01.957507
\.


--
-- Data for Name: historico_messagem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historico_messagem (id, created_at, updated_at, created_by, updated_by, nc_order, title, session_id, messagem, message) FROM stdin;
5123	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Olá bom dia tudo bem","additional_kwargs":{},"response_metadata":{},"type":"human"}
5124	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Oi! Sou a Marcela. Como posso te ajudar a viver uma experiência inesquecível na Itália? Para começar, qual é o seu nome, por favor?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5125	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Elisson","additional_kwargs":{},"response_metadata":{},"type":"human"}
5126	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Prazer, Elisson! Em que posso te ajudar hoje com seus planos para a Itália?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5127	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Gostaria de saber informações sobre os passeios","additional_kwargs":{},"response_metadata":{},"type":"human"}
5128	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Que ótimo, Elisson! A Essentia é especialista em roteiros personalizados pela Toscana e Florença.\\n\\nPara eu te direcionar melhor, você já tem algum destino ou estilo de viagem em mente? E para quantas pessoas seria a viagem?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5129	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Florença para uma pessoa só para mim mesmo","additional_kwargs":{},"response_metadata":{},"type":"human"}
5130	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Florença é uma escolha maravilhosa, Elisson! Uma viagem solo te dá total liberdade.\\n\\nQual ritmo você prefere? Mais focado em museus e história, ou um ritmo mais tranquilo com tempo para cafés e compras? Assim consigo te apresentar o roteiro perfeito para você!","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5131	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"História","additional_kwargs":{},"response_metadata":{},"type":"human"}
5132	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Perfeito, focado na história de Florença! Temos um tour chamado \\"Coração de Florença\\" que explora os principais pontos históricos com um ritmo pensado para quem quer absorver cada detalhe.\\n\\nPara te passar os valores, preciso confirmar um dado. Você já sabe quando gostaria de viajar?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5133	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Dia 1 de março","additional_kwargs":{},"response_metadata":{},"type":"human"}
5134	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Entendi, Elisson. O dia 1º de março está ótimo!\\n\\nNosso tour \\"Coração de Florença\\" para um viajante solo, focado em história, custa 180 euros. Este valor inclui um guia especializado local.\\n\\nO que você acha deste roteiro inicial? Se estiver de acordo, podemos coletar seus dados para formalizar e garantir sua experiência!","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5135	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Ok","additional_kwargs":{},"response_metadata":{},"type":"human"}
5136	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Que ótimo que gostou, Elisson! Para prosseguirmos com a organização, preciso coletar algumas informações.\\n\\nPoderia me confirmar seu **nome completo**, um **telefone** para contato e seu **e-mail**, por favor? Assim já deixo tudo pronto!","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5137	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Elisson de Paula Uzual , telefone e este mesmo , uzualsub@gmail.com","additional_kwargs":{},"response_metadata":{},"type":"human"}
5138	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Obrigada pelas informações, Elisson! Recebi seu nome completo e e-mail: *Elisson de Paula Uzual* e *uzualsub@gmail.com*.\\n\\nComo este é um tour focado em história, gostaria de saber se você tem alguma preferência sobre ter um carro com motorista para se locomover entre os pontos, ou prefere focar apenas no tour guiado a pé?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5139	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Não quero um carro","additional_kwargs":{},"response_metadata":{},"type":"human"}
5140	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Certo, Elisson, apenas o tour guiado a pé focado na história de Florença.\\n\\nPara finalizar os preparativos da sua viagem, preciso de mais dois detalhes: você viajará sozinho(a), e há alguma preocupação sobre a mobilidade, como a presença de idosos ou crianças no grupo (mesmo sendo só você, é importante confirmar)?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5141	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Não tem criança e nem adulto","additional_kwargs":{},"response_metadata":{},"type":"human"}
5142	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Ótimo, Elisson! Para agendarmos o seu tour \\"Coração de Florença\\" no dia 1º de março de 2025, focado em história e apenas com o guia a pé, preciso saber qual **horário você prefere** para iniciarmos o tour?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5143	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"As 10:00","additional_kwargs":{},"response_metadata":{},"type":"human"}
5144	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Calling criar_reuniao with input: {\\"tipo_de_consulta\\":\\"presencial\\",\\"end\\":\\"2025-03-01T10:30:00\\",\\"start\\":\\"2025-03-01T10:00:00\\",\\"servico\\":\\"Coração de Florença\\",\\"lead\\":\\"Elisson de Paula Uzual\\",\\"id\\":\\"16149504-64cb-4ad3-a5b6-9476f859f6bb\\"}","tool_calls":[{"id":"16149504-64cb-4ad3-a5b6-9476f859f6bb","name":"criar_reuniao","args":{"tipo_de_consulta":"presencial","end":"2025-03-01T10:30:00","start":"2025-03-01T10:00:00","servico":"Coração de Florença","lead":"Elisson de Paula Uzual","id":"16149504-64cb-4ad3-a5b6-9476f859f6bb"},"type":"tool_call","additional_kwargs":{}}],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5145	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"[{\\"response\\":\\"There was an error: \\\\\\"The provided authorization grant (e.g., authorization code, resource owner credentials) or refresh token is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client.\\\\\\"\\"}]","tool_call_id":"16149504-64cb-4ad3-a5b6-9476f859f6bb","name":"criar_reuniao","additional_kwargs":{},"response_metadata":{},"type":"tool"}
5146	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Peço desculpas, Elisson! Houve um problema ao tentar agendar seu tour. Parece que não consegui criar o agendamento neste momento.\\n\\nPor favor, você poderia tentar novamente ou, se preferir, posso verificar com o suporte técnico para entender o que aconteceu.","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5147	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Ok pode tentar novamente","additional_kwargs":{},"response_metadata":{},"type":"human"}
5148	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Calling criar_agendamento_forcado with input: {\\"end\\":\\"2025-03-01T10:30:00\\",\\"lead\\":\\"Elisson de Paula Uzual\\",\\"start\\":\\"2025-03-01T10:00:00\\",\\"servico\\":\\"Coração de Florença\\",\\"id\\":\\"b2d3513b-005a-47d0-a875-df6815b2c840\\"}","tool_calls":[{"id":"b2d3513b-005a-47d0-a875-df6815b2c840","name":"criar_agendamento_forcado","args":{"end":"2025-03-01T10:30:00","lead":"Elisson de Paula Uzual","start":"2025-03-01T10:00:00","servico":"Coração de Florença","id":"b2d3513b-005a-47d0-a875-df6815b2c840"},"type":"tool_call","additional_kwargs":{}}],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5149	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"[{\\"response\\":\\"There was an error: \\\\\\"There was an error: \\\\\\"The workflow did not return a response\\\\\\"\\\\\\"\\"}]","tool_call_id":"b2d3513b-005a-47d0-a875-df6815b2c840","name":"criar_agendamento_forcado","additional_kwargs":{},"response_metadata":{},"type":"tool"}
5150	\N	\N	\N	\N	\N	\N	41779661285@s.whatsapp.net	\N	{"content":"Elisson, sinto muito, mas ainda estou enfrentando dificuldades técnicas para agendar seu tour. Parece que não consigo concluir o agendamento neste momento.\\n\\nPor favor, peço desculpas pelo inconveniente. Você gostaria que eu tentasse novamente mais tarde, ou há algo mais em que posso ajudar?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5151	\N	\N	\N	\N	\N	\N	393347339210@s.whatsapp.net	\N	{"content":"Ola, gostaria de ter mais informações sobre os seus serviços","additional_kwargs":{},"response_metadata":{},"type":"human"}
5152	\N	\N	\N	\N	\N	\N	393347339210@s.whatsapp.net	\N	{"content":"Oi! Sou a Marcella. Como posso te ajudar a viver uma experiência inesquecível na Itália?\\n\\nPara começar, qual é o seu nome, por favor?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5153	\N	\N	\N	\N	\N	\N	393347339210@s.whatsapp.net	\N	{"content":"Marise","additional_kwargs":{},"response_metadata":{},"type":"human"}
5154	\N	\N	\N	\N	\N	\N	393347339210@s.whatsapp.net	\N	{"content":"Que ótimo, Marise! É um prazer falar com você.\\n\\nPara eu entender melhor como posso te ajudar com sua viagem, qual é o seu principal destino de interesse na Itália e o que você gostaria de explorar por lá?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5155	\N	\N	\N	\N	\N	\N	393347339210@s.whatsapp.net	\N	{"content":"Quero visitar Florença e alguns destinos na Toscana","additional_kwargs":{},"response_metadata":{},"type":"human"}
5156	\N	\N	\N	\N	\N	\N	393347339210@s.whatsapp.net	\N	{"content":"Florença e Toscana são escolhas maravilhosas!\\n\\nPara montar o roteiro perfeito, me diga: quantas pessoas estarão viajando com você e qual é o estilo de viagem que mais te agrada (mais ritmo, mais tranquilo, focado em arte, gastronomia, etc.)?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5157	\N	\N	\N	\N	\N	\N	553197248969@s.whatsapp.net	\N	{"content":"‎Venda De Coroas Metropax agradece seu contato. Como podemos ajudar?\\nQual e o valor\\nOlá bom dia","additional_kwargs":{},"response_metadata":{},"type":"human"}
5158	\N	\N	\N	\N	\N	\N	553197248969@s.whatsapp.net	\N	{"content":"Olá, bom dia! Eu sou a Marcela.\\n\\nPara que eu possa te ajudar com os valores e pacotes, qual é o seu nome, por favor? Assim posso te orientar melhor sobre as experiências incríveis que a Essentia oferece na Itália!","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5159	\N	\N	\N	\N	\N	\N	553197248969@s.whatsapp.net	\N	{"content":"Por gentileza me informe o nome da pessoa homenageada para que eu possa passar as informações completas para nossos assistentes de atendimento","additional_kwargs":{},"response_metadata":{},"type":"human"}
5160	\N	\N	\N	\N	\N	\N	553197248969@s.whatsapp.net	\N	{"content":"Peço desculpas, parece que houve uma confusão. Eu sou a Marcela, da agência de turismo Essentia, especialista em roteiros pela Toscana e Itália!\\n\\nPara eu saber qual pacote ou valor te interessa, você poderia me dizer seu nome, por favor? Assim podemos começar a planejar sua viagem!","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5161	\N	\N	\N	\N	\N	\N	553195002134@s.whatsapp.net	\N	{"content":"Olá meu nome é Fábio eu falo em nome da metropax","additional_kwargs":{},"response_metadata":{},"type":"human"}
5162	\N	\N	\N	\N	\N	\N	553195002134@s.whatsapp.net	\N	{"content":"Oi, Fábio! Sou a Marcela. É um prazer falar com você em nome da Essentia.\\n\\nComo posso te ajudar a viver uma experiência inesquecível na Itália? Me conta um pouquinho sobre o que você está planejando!","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5163	\N	\N	\N	\N	\N	\N	553195002134@s.whatsapp.net	\N	{"content":"Gentileza enviar o nome da pessoa falecida que será homenageada com a coroa","additional_kwargs":{},"response_metadata":{},"type":"human"}
5164	\N	\N	\N	\N	\N	\N	553195002134@s.whatsapp.net	\N	{"content":"Fábio, entendi que você precisa de ajuda com algo específico relacionado a uma homenagem. No entanto, nossa especialidade aqui na Essentia são roteiros personalizados e experiências culturais na Toscana, Florença e em toda a Itália.\\n\\nVocê está planejando uma viagem e gostaria de saber mais sobre nossos pacotes ou roteiros? Se sim, me diga: qual seria o destino na Itália e quantas pessoas iriam?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5165	\N	\N	\N	\N	\N	\N	553195002134@s.whatsapp.net	\N	{"content":"E outro telefone não e este","additional_kwargs":{},"response_metadata":{},"type":"human"}
5166	\N	\N	\N	\N	\N	\N	553195002134@s.whatsapp.net	\N	{"content":"Compreendo, Fábio. Você está se referindo ao telefone de contato?\\n\\nPara que eu possa te ajudar melhor com os detalhes da sua viagem ou roteiro, preciso saber qual é o seu objetivo principal: você gostaria de informações sobre nossos tours, ou está buscando algo relacionado a serviços de homenagem?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5167	\N	\N	\N	\N	\N	\N	553195002134@s.whatsapp.net	\N	{"content":"E o valor","additional_kwargs":{},"response_metadata":{},"type":"human"}
5168	\N	\N	\N	\N	\N	\N	553195002134@s.whatsapp.net	\N	{"content":"Ah, entendi! Você gostaria de saber sobre os valores dos nossos pacotes de viagem, certo?\\n\\nPara te passar um valor mais preciso, preciso entender um pouco melhor o que você busca. Qual seria o destino na Itália e qual o estilo de viagem que você e seu grupo preferem?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5169	\N	\N	\N	\N	\N	\N	553195002134@s.whatsapp.net	\N	{"content":"Qual e","additional_kwargs":{},"response_metadata":{},"type":"human"}
5170	\N	\N	\N	\N	\N	\N	553195002134@s.whatsapp.net	\N	{"content":"Fábio, como você não especificou o destino, posso te apresentar nossos roteiros mais populares, focados na Toscana e Florença.\\n\\nNós temos desde experiências gastronômicas imersivas até roteiros culturais completos. Para que eu possa te enviar uma sugestão com valores, me diga: quantas pessoas virão e qual o ritmo de viagem ideal para vocês (mais tranquilo ou mais agitado)?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5171	\N	\N	\N	\N	\N	\N	553195002134@s.whatsapp.net	\N	{"content":"Os preços","additional_kwargs":{},"response_metadata":{},"type":"human"}
5172	\N	\N	\N	\N	\N	\N	553195002134@s.whatsapp.net	\N	{"content":"Fábio, nossos preços variam bastante de acordo com o roteiro escolhido, a duração e os serviços inclusos (como motorista particular, ingressos, etc.).\\n\\nPara te dar uma ideia, nossos pacotes personalizados com foco em cultura e gastronomia na Toscana começam em torno de **€180 por pessoa/dia**, dependendo da personalização.\\n\\nVocê gostaria de saber mais sobre algum destino específico, como Florença ou Siena, para que eu possa detalhar melhor as opções?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5173	\N	\N	\N	\N	\N	\N	553195002134@s.whatsapp.net	\N	{"content":"Qual nome da pessoa falecida que será homenageada com a coroa","additional_kwargs":{},"response_metadata":{},"type":"human"}
5174	\N	\N	\N	\N	\N	\N	553195002134@s.whatsapp.net	\N	{"content":"Fábio, peço desculpas, mas parece que estamos com uma pequena confusão. Eu sou a Marcela, da agência Essentia, e cuidamos de **experiências e roteiros de viagem pela Itália**.\\n\\nA informação sobre o nome de uma pessoa falecida para uma homenagem com coroa não está relacionada aos nossos serviços de turismo.\\n\\nVocê gostaria que eu te ajudasse com alguma informação sobre tours na Itália, ou precisa de um contato diferente?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5175	\N	\N	\N	\N	\N	\N	41772261091@s.whatsapp.net	\N	{"content":"🚀 Ajudem-me a ganhar instantaneamente – Apenas 1 clique!\\nOlá, amigos! 👋 Juntem-se a mim no Programa de afiliados da Temu, não é necessário pagamento! Só têm de se registar através do meu link e ganho imediatamente até CHF30 💰 MAIS, também receberão recompensas gratuitas!🎉\\n🔗 https://temu.to/k/e74yi6ju8r7 🔍 inc652638","additional_kwargs":{},"response_metadata":{},"type":"human"}
5176	\N	\N	\N	\N	\N	\N	41772261091@s.whatsapp.net	\N	{"content":"Olá! Sou a Marcela. Como posso te ajudar a viver uma experiência inesquecível na Itália?\\n\\nVejo que você enviou uma mensagem sobre um programa de afiliados. Se o seu interesse for mesmo sobre roteiros culturais e personalizados na Toscana, Florença ou qualquer lugar da Itália, estou à disposição!\\n\\nQual é o seu nome, por favor?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5177	\N	\N	\N	\N	\N	\N	41772261091@s.whatsapp.net	\N	{"content":"🛍️ O melhor amigo da sua carteira! 💸 Clique https://temu.to/k/e5wfaythtro para obter um pacote de cupons CHF100 e use ale273044 para obter 30% de desconto! 🚀 Baixe o aplicativo Temu e compre de forma inteligente! \\n https://temu.to/k/ev7wajljdgp","additional_kwargs":{},"response_metadata":{},"type":"human"}
5178	\N	\N	\N	\N	\N	\N	41772261091@s.whatsapp.net	\N	{"content":"Entendo que você está compartilhando algumas ofertas, mas meu foco aqui na Essentia é planejar viagens incríveis pela Itália!\\n\\nPara começarmos a desenhar a sua viagem dos sonhos, qual seria o seu nome?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5179	\N	\N	\N	\N	\N	\N	41794151740@s.whatsapp.net	\N	{"content":"Elisson, boa noite e desculpe escrever essa hora. Marise me pediu pra marcar com voce se possivel na sexta no fim do dia para: pagar o Dominio e a outra atividade que vc propos para ela que esta alem do pagamento que ja foi feito. Seria possivel falar na sexta apartir das 18;00?\\nEla tambem me perguntou como eu faco pra gerar comprovante de pagamento e faturas usando o sistema que voce ja criou e implementou. Poderia me mostrar? 🙏🏾🙏🏾🙏🏾 \\nObrigada pela sua paciencia e flexibilidade. Boa noite. Mara","additional_kwargs":{},"response_metadata":{},"type":"human"}
5180	\N	\N	\N	\N	\N	\N	41794151740@s.whatsapp.net	\N	{"content":"Olá, Mara! Boa noite. Sem problemas com o horário, estou aqui para ajudar.\\n\\nA Marise quer falar comigo sobre o pagamento do domínio e outra atividade, correto? Para verificarmos a disponibilidade na sexta-feira a partir das 18h, vou transferir para nossa agenda para verificar os horários disponíveis.\\n\\nSobre o sistema de comprovantes e faturas, posso te orientar com isso. Você prefere que eu explique agora ou aguarda a conversa com a Marise?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5181	\N	\N	\N	\N	\N	\N	41794151740@s.whatsapp.net	\N	{"content":"Sim e possível","additional_kwargs":{},"response_metadata":{},"type":"human"}
5182	\N	\N	\N	\N	\N	\N	41794151740@s.whatsapp.net	\N	{"content":"Ótimo, Mara. Fico feliz em ajudar com o sistema!\\n\\nPara eu te mostrar como gerar os comprovantes e faturas, você tem em mãos o login e a senha de acesso, ou você precisará de um passo a passo de como entrar no sistema primeiro?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5183	\N	\N	\N	\N	\N	\N	41794151740@s.whatsapp.net	\N	{"content":"@Elisson: por favor a q horas podemos ter a chamada amanha?","additional_kwargs":{},"response_metadata":{},"type":"human"}
5184	\N	\N	\N	\N	\N	\N	41794151740@s.whatsapp.net	\N	{"content":"Olá! Sinto muito, mas eu sou a **Marcella**, secretária da Essentia. Parece que você está tentando falar com o Elisson.\\n\\nA Marise está disponível agora? Se desejar, posso verificar com ela se pode atender você ou se gostaria de deixar algum recado. Como posso te ajudar hoje?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5185	\N	\N	\N	\N	\N	\N	41794151740@s.whatsapp.net	\N	{"content":"Quem e a Marise e qual a disponibilidade dela na proxima semana?","additional_kwargs":{},"response_metadata":{},"type":"human"}
5186	\N	\N	\N	\N	\N	\N	41794151740@s.whatsapp.net	\N	{"content":"A Marise é uma das responsáveis aqui pela agência Essentia. No momento ela não pode me atender, mas anoto seu recado, se desejar.\\n\\nVocê gostaria de saber sobre a disponibilidade dela para tratar de algum roteiro ou serviço específico? Assim posso verificar se consigo te ajudar no meu papel.","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5187	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"Ola eu quero ir para Itália","additional_kwargs":{},"response_metadata":{},"type":"human"}
5188	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"Oi! Sou a Marcela. Como posso te ajudar a viver uma experiência inesquecível na Itália?\\n\\nPara começar, qual é o seu nome, por favor?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5189	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"Amilton","additional_kwargs":{},"response_metadata":{},"type":"human"}
5190	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"Que ótimo, Amilton! A Toscana e a Itália são maravilhosas.\\n\\nPara eu começar a montar algo especial para você, qual seria o seu principal destino de interesse: Toscana, Florença ou outra região da Itália?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5191	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"Eu quero ir para Cecília","additional_kwargs":{},"response_metadata":{},"type":"human"}
5192	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"A Sicília é fantástica, Amilton! Uma ilha com muita história e culinária incrível.\\n\\nPara planejarmos sua viagem, quantos dias você pretende passar na Itália e qual é o estilo de viagem que você mais gosta (mais ritmo, mais tranquilo, focado em cultura, etc.)?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5193	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"Viagem tranquila","additional_kwargs":{},"response_metadata":{},"type":"human"}
5194	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"Perfeito, Amilton, um ritmo tranquilo na Sicília vai ser revigorante!\\n\\nPara eu ter uma ideia dos pacotes, quantas pessoas estarão viajando com você? Assim consigo ver as melhores opções de roteiros e hospedagem.","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5195	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"2 personnes","additional_kwargs":{},"response_metadata":{},"type":"human"}
5196	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"Ótimo, dois viajantes! E Amilton, vocês têm alguma preferência de época para viajar? Saber a data ou o mês nos ajuda a verificar a disponibilidade e os valores com mais precisão.","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5197	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"3 dias","additional_kwargs":{},"response_metadata":{},"type":"human"}
5198	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"Entendi, Amilton, você tem 3 dias disponíveis para a viagem, certo?\\n\\nPara a Sicília, mesmo com 3 dias, podemos criar uma experiência intensa e relaxante. Gostaria de focar em uma única cidade (como Palermo ou Catânia) ou fazer um *mini-roteiro* cobrindo dois pontos principais?\\n\\nA Essentia se destaca por criar roteiros personalizados, garantindo que seu ritmo tranquilo seja respeitado.","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5199	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"23 de junho  para dia 26 de julho","additional_kwargs":{},"response_metadata":{},"type":"human"}
5200	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"Amilton, a sua viagem seria entre 23 de Junho e 26 de Julho? Essa janela de tempo nos dá bastante flexibilidade!\\n\\nPara conseguirmos te apresentar os melhores valores e roteiros na Sicília para 2 pessoas, eu preciso do seu nome completo, e-mail e telefone, ok? Além disso, há idosos ou crianças no grupo?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5201	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"Qual seria o preço","additional_kwargs":{},"response_metadata":{},"type":"human"}
5202	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"Essa é uma ótima pergunta, Amilton! Os preços variam muito conforme a hospedagem e os passeios que incluirmos (como passeios de barco ou degustações de vinho).\\n\\nPara te dar um valor preciso para sua viagem de 2 pessoas na Sicília, preciso finalizar a coleta de dados para montar uma proposta personalizada, como solicitado em nosso fluxo.\\n\\nPoderia me confirmar seu **nome completo**, **e-mail** e **telefone**? Assim, já posso preparar uma estimativa de valores focada em um ritmo tranquilo.","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5203	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"O valor do pacote","additional_kwargs":{},"response_metadata":{},"type":"human"}
5204	\N	\N	\N	\N	\N	\N	41795369072@s.whatsapp.net	\N	{"content":"Amilton, entendo sua ansiedade pelo valor! Para te passar um preço exato e justo para 2 pessoas na Sicília, preciso saber se há idosos ou crianças, e ter seu **nome completo, e-mail e telefone**.\\n\\nCom essas informações, eu posso consultar nossos pacotes exclusivos e te enviar a melhor opção em alguns minutos. Quer me passar esses dados para eu agilizar a sua proposta?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5205	\N	\N	\N	\N	\N	\N	41792767015@s.whatsapp.net	\N	{"content":"https://maps.app.goo.gl/Ce6j6TCgTCNnbaV96?g_st=i&utm_campaign=ac-im","additional_kwargs":{},"response_metadata":{},"type":"human"}
5206	\N	\N	\N	\N	\N	\N	41792767015@s.whatsapp.net	\N	{"content":"Oi! Sou a Marcela. Como posso te ajudar a viver uma experiência inesquecível na Itália? 😊","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5207	\N	\N	\N	\N	\N	\N	41783144656@s.whatsapp.net	\N	{"content":"Bonjour","additional_kwargs":{},"response_metadata":{},"type":"human"}
5208	\N	\N	\N	\N	\N	\N	41783144656@s.whatsapp.net	\N	{"content":"Oi! Sou a Marcela. Como posso te ajudar a viver uma experiência inesquecível na Itália? Qual é o seu nome, por favor?","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
5209	\N	\N	\N	\N	\N	\N	41783144656@s.whatsapp.net	\N	{"content":"Henrique","additional_kwargs":{},"response_metadata":{},"type":"human"}
5210	\N	\N	\N	\N	\N	\N	41783144656@s.whatsapp.net	\N	{"content":"Olá, Henrique! É um prazer te conhecer.\\n\\nMe diga, o que você está planejando fazer na Itália? Queremos criar algo perfeito para você!","tool_calls":[],"invalid_tool_calls":[],"additional_kwargs":{},"response_metadata":{},"type":"ai"}
\.


--
-- Data for Name: hoteis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hoteis (id, nome, endereco, cidade, telefone, criado_em, atualizado_em) FROM stdin;
nh-firenze	NH FIRENZE	Piazza Vittorio Veneto, 4/ A	Firenze	\N	2026-05-02 08:34:58.89257	2026-05-02 08:34:58.89257
agriturismo-la-sovana	AGRITURISMO LA SOVANA	Sarteano	Sarteano	\N	2026-05-02 08:34:58.94243	2026-05-02 08:34:58.94243
athena-hotel	ATHENA HOTEL		Siena	\N	2026-05-02 08:34:59.017047	2026-05-02 08:34:59.017047
rose-garden-palace	ROSE GARDEN PALACE ROMA		Roma	\N	2026-05-02 08:34:59.042801	2026-05-02 08:34:59.042801
\.


--
-- Data for Name: integration_webhooks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.integration_webhooks (id, organization_id, name, event_type, target_url, method, headers, secret_token, is_active, retry_count, timeout_seconds, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: kanban_columns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kanban_columns (id, title, color, order_index, ativo, criado_em, atualizado_em) FROM stdin;
em_progresso	Em Progresso	purple	0	1	2025-12-28 13:28:14.748678	2025-12-28 13:28:14.748678
pendente_cliente	Pendente Cliente	yellow	1	1	2025-12-28 13:28:14.845318	2025-12-28 13:28:14.845318
confirmadas	Confirmadas	green	2	1	2025-12-28 13:28:14.867683	2025-12-28 13:28:14.867683
concluidas	Concluídas	blue	3	1	2025-12-28 13:28:14.885647	2025-12-28 13:28:14.885647
canceladas	Canceladas	red	4	1	2025-12-28 13:28:14.905603	2025-12-28 13:28:14.905603
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leads (id, nome, email, telefone, passeio_id, passeio_nome, data_passeio, numero_pessoas, observacoes, status, created_at, updated_at, atualizado_em, criado_em) FROM stdin;
cd73cde0-79e9-4f45-a70e-8f11132ad203	Elisson Uzual	uzualelisson@gmail.com	9900899688774	passeio_1767289712773	Passeio Romantico 	2026-01-05	1	teste	novo	2026-01-01 19:38:39.319042+00	2026-01-01 19:38:39.319042+00	2026-01-02 15:15:50.207774+00	2026-01-02 15:15:50.207774+00
7747aa7a-58a8-4a1d-a75e-9c93464cba60	Maria Aparecida do carvallho	maria@gmail.com	9998--8009958	demo-3	Gastronomia Italiana	2026-01-07	2	novo teste	convertido	2026-01-01 19:49:11.344808+00	2026-01-01 19:49:11.344808+00	2026-01-02 17:02:57.50568+00	2026-01-02 15:15:50.207774+00
a0e4d3a5-c533-468d-a996-99c2bb767009	Cliente WhatsApp	null@whatsapp.temp	null	\N	\N	\N	\N	\N	novo	2026-02-05 09:40:38.533363+00	2026-02-05 09:40:38.533363+00	2026-02-05 09:40:38.533363+00	2026-02-05 09:40:38.533363+00
40534eb4-d293-4d4c-88e6-dde0b4526e42	Cliente WhatsApp	undefined@whatsapp.temp	undefined	\N	\N	\N	\N	\N	novo	2026-02-05 10:08:29.937623+00	2026-02-05 10:08:29.937623+00	2026-02-05 15:50:08.236878+00	2026-02-05 10:08:29.937623+00
4c3beb46-2001-4309-8709-3fcb0a7e25ac	moove labs	moovelabs.ch@gmail.com	0767673274	demo-4	História de Roma	2026-02-13	5	fadfasdfa	pendente_cliente	2026-02-05 16:14:20.332659+00	2026-02-05 16:14:20.332659+00	2026-03-22 21:06:19.017606+00	2026-02-05 16:14:20.332659+00
\.


--
-- Data for Name: locais; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locais (id, nome, descricao, criado_em, atualizado_em) FROM stdin;
firenze	Firenze	Centro histórico e arredores	2026-05-02 08:40:02.719754	2026-05-02 08:40:02.719754
arezzo	Arezzo	Centro histórico	2026-05-02 08:40:02.917509	2026-05-02 08:40:02.917509
cortona	Cortona	Cidade toscana	2026-05-02 08:40:03.017263	2026-05-02 08:40:03.017263
chianti	Chianti	Região vinícola	2026-05-02 08:40:03.218214	2026-05-02 08:40:03.218214
assis	Assis	Cidade de São Francisco	2026-05-02 08:40:03.328496	2026-05-02 08:40:03.328496
perugia	Perugia	Centro da Úmbria	2026-05-02 08:40:03.51726	2026-05-02 08:40:03.51726
montepulciano	Montepulciano	Vinhos Nobile	2026-05-02 08:40:03.635751	2026-05-02 08:40:03.635751
pienza	Pienza	Queijos Pecorino	2026-05-02 08:40:03.917892	2026-05-02 08:40:03.917892
siena	Siena	Palio e Duomo	2026-05-02 08:40:04.021135	2026-05-02 08:40:04.021135
san-gimignano	San Gimignano	Torres medievais	2026-05-02 08:40:04.116206	2026-05-02 08:40:04.116206
monteriggioni	Monteriggioni	Castelo murado	2026-05-02 08:40:04.222282	2026-05-02 08:40:04.222282
volterra	Volterra	Alabastro e Etruscos	2026-05-02 08:40:04.41944	2026-05-02 08:40:04.41944
colle-val-elsa	Colle di Val d'Elsa	Cidade de cristal	2026-05-02 08:40:04.516272	2026-05-02 08:40:04.516272
montalcino	Montalcino	Vinhos Brunello	2026-05-02 08:40:04.718264	2026-05-02 08:40:04.718264
san-quirico	San Quirico d'Orcia	Vale d'Orcia	2026-05-02 08:40:04.920748	2026-05-02 08:40:04.920748
orvieto	Orvieto	Duomo e poços	2026-05-02 08:40:05.028487	2026-05-02 08:40:05.028487
roma	Roma	Cidade eterna	2026-05-02 08:40:05.324528	2026-05-02 08:40:05.324528
\.


--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notes (id, organization_id, contact_id, company_id, deal_id, activity_id, author_id, title, content, is_private, tags, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: organization_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization_members (id, organization_id, user_id, role, permissions, joined_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations (id, name, slug, description, logo_url, settings, is_active, created_at, updated_at) FROM stdin;
00000000-0000-0000-0000-000000000001	Essentia CRM	essentia-default	Organização padrão do sistema	\N	{}	t	2025-12-02 16:34:46.060244	2025-12-02 16:34:46.060244
\.


--
-- Data for Name: passeios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.passeios (id, nome, descricao, preco, duracao, categoria, imagens, inclusoes, idiomas, capacidade_maxima, ativo, criado_em, atualizado_em) FROM stdin;
demo-3	Gastronomia Italiana	Tour gastronômico pela Toscana com degustação de vinhos e pratos típicos	200	6h	Gastronomia	["/uploads/1767138050631-2019574f-1ae1-4218-ac54-49850f7f5567-download-(2).jpeg"]	["Guia especializado", "Degustações", "Vinhos", "Transporte"]	["Português", "Italiano"]	10	1	2025-12-28 13:13:03.905492	2025-12-30 23:40:53.375964
demo-4	História de Roma	Explore o Coliseu, Fórum Romano e outros monumentos históricos com guias especializados	120	5h	História	["/uploads/1767138014815-04167249-f270-430f-a3ec-56811f5639c6-63743_shutterstock-147643964-coliseu.webp"]	["Guia especializado", "Ingressos", "Água", "Material informativo"]	["Português", "Inglês", "Espanhol"]	20	1	2025-12-28 13:13:03.926026	2025-12-31 17:42:15.29097
demo-5	Arte e Cultura	Visite os principais museus e galerias de arte da cidade	90	3h	Cultural	["/uploads/1767204829448-05403b11-62db-40e2-9877-dc8a63c70131-download-(3).jpeg"]	["Guia especializado", "Ingressos", "Água"]	["Português", "Inglês"]	15	1	2025-12-28 13:13:03.943555	2025-12-31 18:13:54.176124
demo-2	Aventura nos Alpes	Trilhas incríveis pelos Alpes Suíços com vistas espetaculares e natureza preservada	280	8h	Aventura	["/uploads/1767204854951-b2be9ee8-0bd9-4b49-802d-5e6fc6a38f54-download.jpeg"]	["Guia especializado", "Equipamentos", "Lanche", "Seguro"]	["Português", "Inglês"]	12	1	2025-12-28 13:13:03.877774	2025-12-31 18:14:17.6584
demo-1	Tour Paris Romântica	Descubra os encantos de Paris com guias especializados. Visite a Torre Eiffel, Louvre e muito mais!	150	4h	Romance	["/uploads/1767204870029-96434255-a09f-40e3-a1c4-174fd773eb79-download-(4).jpeg"]	["Guia especializado", "Transporte", "Ingressos"]	["Português", "Inglês", "Francês"]	15	1	2025-12-28 13:13:03.836075	2025-12-31 18:14:32.643614
demo-6	Natureza Selvagem	Explore parques nacionais e observe a fauna local em seu habitat natural	180	7h	Natureza	["/uploads/1767204800069-ddce7c0c-1ed3-4666-beb0-15bc82698c6d-download-(2).jpeg"]	["Guia especializado", "Binóculos", "Lanche", "Seguro"]	["Português"]	8	1	2025-12-28 13:13:03.962669	2025-12-31 18:13:26.369935
passeio_1767289712773	Passeio Romantico 	passeio romantico roma	300	8h	Cultural	["/uploads/1767289709178-5a3290f3-20ff-4b24-a461-ad1b7b5329fa-download-(1).jpeg"]	[]	[]	10	1	2026-01-01 17:48:35.041101	2026-01-01 17:48:35.041101
passeio_1767290143953	FLORENCE ITALY	teste florenca	300	3h	Natureza	["/uploads/1767290140440-3224fda1-f425-418e-ac32-5821108eb70a-download-(2).jpeg"]	[]	[]	10	1	2026-01-01 17:55:46.216855	2026-01-01 17:55:46.216855
passeio_1767290382457	FLORENCE ITALY	teste	300	3h	Natureza	["/uploads/1767290379440-f24ca260-4888-45ff-b08a-04ab0ea61166-download-(2).jpeg"]	[]	[]	10	1	2026-01-01 17:59:42.560323	2026-01-01 17:59:42.560323
passeio_1767290848656	Grande Homa nova	teste	150	2h	Histórico	["/uploads/1767290844632-5d0f3d9f-5191-41c7-bbb0-aefb9b124680-download-(1).jpeg"]	[]	[]	10	1	2026-01-01 18:07:28.776774	2026-01-01 18:13:30.770363
passeio_1767290465523	ROMA ANTIGA	TESTE	100	2h	Cultural	["/uploads/1767292823326-455475de-1fa2-4962-8667-451b90d9280c-download-(3).jpeg"]	[]	[]	10	1	2026-01-01 18:01:05.634407	2026-01-01 18:40:25.442755
rot-firenze-centro	FIRENZE - Passeio a pé pelo centro	FIRENZE - Passeio a pé pelo centro	400	8h	Cultural	[]	[]	[]	20	1	2026-05-02 08:40:42.27988	2026-05-02 08:40:42.27988
rot-arezzo-cortona	FIRENZE - AREZZO - CORTONA	FIRENZE - AREZZO - CORTONA	610	8h	Cultural	[]	[]	[]	20	1	2026-05-02 08:40:42.301499	2026-05-02 08:40:42.301499
rot-chianti	FIRENZE - CHIANTI - FIRENZE	FIRENZE - CHIANTI - FIRENZE	0	8h	Cultural	[]	[]	[]	20	1	2026-05-02 08:40:42.319131	2026-05-02 08:40:42.319131
rot-badia-sovana	FIRENZE - BADIA A PASSIGNANO - SOVANA	FIRENZE - BADIA A PASSIGNANO - SOVANA	0	8h	Cultural	[]	[]	[]	20	1	2026-05-02 08:40:42.340868	2026-05-02 08:40:42.340868
rot-assis-perugia	AGRITURISMO - ASSIS - PERUGIA	AGRITURISMO - ASSIS - PERUGIA	580	8h	Cultural	[]	[]	[]	20	1	2026-05-02 08:40:42.360238	2026-05-02 08:40:42.360238
rot-montepulciano	AGRITURISMO - MONTEPULCIANO	AGRITURISMO - MONTEPULCIANO	320	8h	Cultural	[]	[]	[]	20	1	2026-05-02 08:40:42.383359	2026-05-02 08:40:42.383359
rot-pienza-siena	AGRITURISMO - PIENZA - SIENA	AGRITURISMO - PIENZA - SIENA	320	8h	Cultural	[]	[]	[]	20	1	2026-05-02 08:40:42.401419	2026-05-02 08:40:42.401419
rot-siena-centro	SIENA - Passeio a pé pelo centro histórico	SIENA - Passeio a pé pelo centro histórico	290	8h	Cultural	[]	[]	[]	20	1	2026-05-02 08:40:42.419059	2026-05-02 08:40:42.419059
rot-san-gimignano	SIENA - SAN GIMIGNANO - MONTERIGGIONI	SIENA - SAN GIMIGNANO - MONTERIGGIONI	320	8h	Cultural	[]	[]	[]	20	1	2026-05-02 08:40:42.440755	2026-05-02 08:40:42.440755
rot-volterra-colle	SIENA - VOLTERRA - COLLE VAL D'ELSA	SIENA - VOLTERRA - COLLE VAL D'ELSA	290	8h	Cultural	[]	[]	[]	20	1	2026-05-02 08:40:42.463797	2026-05-02 08:40:42.463797
rot-montalcino-san-quirico	SIENA - MONTALCINO - SAN QUIRICO	SIENA - MONTALCINO - SAN QUIRICO	0	8h	Cultural	[]	[]	[]	20	1	2026-05-02 08:40:42.482951	2026-05-02 08:40:42.482951
rot-orvieto-roma	SIENA - ORVIETO - ROMA	SIENA - ORVIETO - ROMA	0	8h	Cultural	[]	[]	[]	20	1	2026-05-02 08:40:42.501041	2026-05-02 08:40:42.501041
\.


--
-- Data for Name: pipeline_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pipeline_stages (id, pipeline_id, name, description, "position", color, probability, is_closed, is_won, created_at, updated_at) FROM stdin;
34604a05-3def-45b4-9afa-9b162e921fff	00000000-0000-0000-0000-000000000001	Qualificação	\N	0	#3B82F6	10	f	f	2025-12-02 16:34:46.060244	2025-12-02 16:34:46.060244
3c922c56-0ac3-4783-9a4a-381bb3a8216b	00000000-0000-0000-0000-000000000001	Proposta	\N	1	#8B5CF6	30	f	f	2025-12-02 16:34:46.060244	2025-12-02 16:34:46.060244
c58523db-c791-4fa0-85cf-18af285e796c	00000000-0000-0000-0000-000000000001	Negociação	\N	2	#F59E0B	60	f	f	2025-12-02 16:34:46.060244	2025-12-02 16:34:46.060244
02de4df8-82f6-4b79-8a7d-960ab18651e5	00000000-0000-0000-0000-000000000001	Fechado - Ganho	\N	3	#10B981	100	t	t	2025-12-02 16:34:46.060244	2025-12-02 16:34:46.060244
9e3c705a-cc0b-4266-9767-26b5b7c0404d	00000000-0000-0000-0000-000000000001	Fechado - Perdido	\N	4	#EF4444	0	t	f	2025-12-02 16:34:46.060244	2025-12-02 16:34:46.060244
\.


--
-- Data for Name: pipelines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pipelines (id, organization_id, name, description, is_default, "position", created_at, updated_at) FROM stdin;
00000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000001	Pipeline de Vendas	Pipeline padrão do sistema	t	0	2025-12-02 16:34:46.060244	2025-12-02 16:34:46.060244
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (sid, sess, expire) FROM stdin;
2204a15b-847e-495c-ba04-67fbec9fcbaa	{"userId":"8ee0138a-2b74-44b8-a707-468f011cb37a"}	2025-12-09 22:11:09.238
85215d48-adf3-45a9-a407-8c1521e4dfd0	{"userId":"8ee0138a-2b74-44b8-a707-468f011cb37a"}	2025-12-09 22:50:53.928
61012652-6ef2-4f80-91d4-e0a32e07bd08	{"userId":"93769963-b655-4457-878f-9bffddbbe341"}	2026-01-04 10:06:58.575
fbf483b2-635e-42ac-911f-f78217f6051c	{"userId":"93769963-b655-4457-878f-9bffddbbe341"}	2026-01-04 10:07:25.79
09c754bc-72f4-40b2-9b5b-233d696c409d	{"userId":"07ee097b-ab05-4047-8fe9-c17a0f724e06"}	2026-01-04 11:14:54.03
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (id, organization_id, name, color, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, nome, first_name, last_name, profile_image_url, user_type, telefone, endereco, data_nascimento, cpf, password_hash, created_at, updated_at) FROM stdin;
93769963-b655-4457-878f-9bffddbbe341	admin.teste@essentia.com	Administrador Teste	\N	\N	\N	admin	\N	\N	\N	\N	$2b$10$psydodMsCM/B5HymHqCye.l8unhDYqtTe.GSV0IJ19Wa6WmRk2C8K	2025-12-28 10:01:59.758099	2025-12-28 10:01:59.758099
77627e04-a359-4327-afa9-a6e35a000e49	cliente.teste@essentia.com	Cliente Teste	\N	\N	\N	cliente	\N	\N	\N	\N	$2b$10$k9d2L1NAb/Z6473PD8RwReJcQdP88z0ysIzT/IvtN9AJAEVpD3iDa	2025-12-28 10:01:59.956734	2025-12-28 10:01:59.956734
15995f5d-4c8a-459e-9303-faf9101f774b	guia@gmail.com	Guia  Teste	Guia 	Teste	\N	guia	\N	\N	\N	\N	$2b$10$kyQErUnHtpyEauzAFJoqLevs0g3wQHOkn67hO.9lUtDlDIconE7dO	2025-12-28 10:51:50.968	2025-12-28 10:51:50.968
803408d9-91c2-4646-8301-b99a3f3df49d	asafe@gmail.com	asafe uzual	\N	\N	\N	cliente	\N	\N	\N	\N	$2b$10$oWh5kQ1qLcKjZNhZ.kat3.7m5dNdvQD9aoVIuMezo7kWxUOACzZeu	2025-12-28 11:14:17.88122	2025-12-28 11:14:17.88122
07ee097b-ab05-4047-8fe9-c17a0f724e06	uzualelisson@gmail.com	ELISSON UZUAL	Elisson 	Uzual	\N	admin	0779661285	\N	\N	\N	$2b$10$RelKu6pW4avSmxeMHkbtvOsMTMWs6gvz5D1qGZcLHeGeyhHnphAES	2025-12-02 21:59:36.846536	2026-01-01 19:03:31.244101
ebf6f270-0b51-4a94-a501-e96f1ff3d281	maraharwood5@gmail.com	Mara NAKAGAWA HARWOOD	Mara	NAKAGAWA HARWOOD	\N	admin	\N	\N	\N	\N	$2b$10$/BWp6jpm5jUO/zPKMQmN6etpdSGoC1Qlkp8/83byIGmsk80DmAI5W	2026-03-29 19:26:08.520064	2026-03-29 19:32:22.119409
ea1e4627-b5ec-46f8-8377-1cc8792769c6	mariseinflorence@gmail.com	Estação  de Turismo e viagens Ltda	Estação 	de Turismo e viagens Ltda	\N	admin	\N	\N	\N	\N	$2b$10$63DVphE.dJyENHROfaqUvOrUdoCkkJuoLkimOi8lfQ4Y922ojDuYm	2026-04-02 15:29:26.5179	2026-04-03 16:25:34.29417
63abd7bc-1125-48a4-a287-af130278d723	cesare.tartarini@marsc.it	Cesare Tartarini	Cesare	Tartarini	\N	admin	\N	\N	\N	\N	$2b$10$2enSu9JRfwk1S0YxgyVSmuQLrQg6k0hgBAZ1uLlpzRG7NID0U8ZgG	2026-04-28 17:25:49.413842	2026-04-28 17:30:28.913671
8aa5248a-57cd-4511-9623-cbb70941dc8c	maria@gmail.com	Maria Aparecida do carvallho	\N	\N	\N	cliente	9998--8009958	\N	\N	\N	$2b$10$O5HJgUGynKI2lxXG9TwNqOjmMoG/hh6EYnOZrbgX3qrUX13G4qqeu	2026-01-01 19:50:23.324188	2026-01-02 17:02:57.408923
\.


--
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_id_seq', 7054, true);


--
-- Name: historico messagem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."historico messagem_id_seq"', 5210, true);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: agendamentos agendamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agendamentos
    ADD CONSTRAINT agendamentos_pkey PRIMARY KEY (id);


--
-- Name: clientes clientes_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_email_unique UNIQUE (email);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: deals deals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_pkey PRIMARY KEY (id);


--
-- Name: empresa_configuracoes empresa_configuracoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_configuracoes
    ADD CONSTRAINT empresa_configuracoes_pkey PRIMARY KEY (id);


--
-- Name: events_log events_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events_log
    ADD CONSTRAINT events_log_pkey PRIMARY KEY (id);


--
-- Name: fatura_itens fatura_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fatura_itens
    ADD CONSTRAINT fatura_itens_pkey PRIMARY KEY (id);


--
-- Name: faturas faturas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturas
    ADD CONSTRAINT faturas_pkey PRIMARY KEY (id);


--
-- Name: guias guias_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guias
    ADD CONSTRAINT guias_email_key UNIQUE (email);


--
-- Name: guias guias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guias
    ADD CONSTRAINT guias_pkey PRIMARY KEY (id);


--
-- Name: historico_messagem historico messagem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_messagem
    ADD CONSTRAINT "historico messagem_pkey" PRIMARY KEY (id);


--
-- Name: hoteis hoteis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hoteis
    ADD CONSTRAINT hoteis_pkey PRIMARY KEY (id);


--
-- Name: integration_webhooks integration_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_webhooks
    ADD CONSTRAINT integration_webhooks_pkey PRIMARY KEY (id);


--
-- Name: kanban_columns kanban_columns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_columns
    ADD CONSTRAINT kanban_columns_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: locais locais_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locais
    ADD CONSTRAINT locais_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: organization_members organization_members_organization_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_organization_id_user_id_key UNIQUE (organization_id, user_id);


--
-- Name: organization_members organization_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_slug_key UNIQUE (slug);


--
-- Name: passeios passeios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.passeios
    ADD CONSTRAINT passeios_pkey PRIMARY KEY (id);


--
-- Name: pipeline_stages pipeline_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipeline_stages
    ADD CONSTRAINT pipeline_stages_pkey PRIMARY KEY (id);


--
-- Name: pipelines pipelines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: tags tags_organization_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_organization_id_name_key UNIQUE (organization_id, name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: clientes_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clientes_order_idx ON public.clientes USING btree (nc_order);


--
-- Name: historico messagem_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "historico messagem_order_idx" ON public.historico_messagem USING btree (nc_order);


--
-- Name: idx_activities_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_company_id ON public.activities USING btree (company_id);


--
-- Name: idx_activities_contact_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_contact_id ON public.activities USING btree (contact_id);


--
-- Name: idx_activities_deal_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_deal_id ON public.activities USING btree (deal_id);


--
-- Name: idx_activities_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_deleted_at ON public.activities USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_activities_due_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_due_date ON public.activities USING btree (due_date);


--
-- Name: idx_activities_org_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_org_id ON public.activities USING btree (organization_id);


--
-- Name: idx_activities_owner_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_owner_id ON public.activities USING btree (owner_id);


--
-- Name: idx_activities_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_status ON public.activities USING btree (status);


--
-- Name: idx_activities_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activities_type ON public.activities USING btree (type);


--
-- Name: idx_agendamentos_cliente_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agendamentos_cliente_id ON public.agendamentos USING btree (cliente_id);


--
-- Name: idx_agendamentos_data_passeio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agendamentos_data_passeio ON public.agendamentos USING btree (data_passeio);


--
-- Name: idx_agendamentos_guia_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agendamentos_guia_id ON public.agendamentos USING btree (guia_id);


--
-- Name: idx_agendamentos_passeio_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agendamentos_passeio_id ON public.agendamentos USING btree (passeio_id);


--
-- Name: idx_agendamentos_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agendamentos_status ON public.agendamentos USING btree (status);


--
-- Name: idx_companies_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_deleted_at ON public.companies USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_companies_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_email ON public.companies USING btree (email);


--
-- Name: idx_companies_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_name ON public.companies USING btree (name);


--
-- Name: idx_companies_org_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_org_id ON public.companies USING btree (organization_id);


--
-- Name: idx_contacts_cliente_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_cliente_id ON public.contacts USING btree (cliente_id) WHERE (cliente_id IS NOT NULL);


--
-- Name: idx_contacts_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_company_id ON public.contacts USING btree (company_id);


--
-- Name: idx_contacts_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_deleted_at ON public.contacts USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_contacts_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_email ON public.contacts USING btree (email);


--
-- Name: idx_contacts_full_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_full_name ON public.contacts USING btree (full_name);


--
-- Name: idx_contacts_org_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_org_id ON public.contacts USING btree (organization_id);


--
-- Name: idx_contacts_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_phone ON public.contacts USING btree (phone);


--
-- Name: idx_contacts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_status ON public.contacts USING btree (status);


--
-- Name: idx_deals_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deals_company_id ON public.deals USING btree (company_id);


--
-- Name: idx_deals_contact_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deals_contact_id ON public.deals USING btree (contact_id);


--
-- Name: idx_deals_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deals_deleted_at ON public.deals USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_deals_expected_close_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deals_expected_close_date ON public.deals USING btree (expected_close_date);


--
-- Name: idx_deals_org_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deals_org_id ON public.deals USING btree (organization_id);


--
-- Name: idx_deals_owner_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deals_owner_id ON public.deals USING btree (owner_id);


--
-- Name: idx_deals_pipeline_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deals_pipeline_id ON public.deals USING btree (pipeline_id);


--
-- Name: idx_deals_stage_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deals_stage_id ON public.deals USING btree (stage_id);


--
-- Name: idx_deals_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_deals_status ON public.deals USING btree (status);


--
-- Name: idx_events_log_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_log_created_at ON public.events_log USING btree (created_at);


--
-- Name: idx_events_log_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_log_entity ON public.events_log USING btree (entity_type, entity_id);


--
-- Name: idx_events_log_event_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_log_event_type ON public.events_log USING btree (event_type);


--
-- Name: idx_events_log_org_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_log_org_id ON public.events_log USING btree (organization_id);


--
-- Name: idx_events_log_webhook_sent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_log_webhook_sent ON public.events_log USING btree (webhook_sent) WHERE (webhook_sent = false);


--
-- Name: idx_notes_activity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notes_activity_id ON public.notes USING btree (activity_id);


--
-- Name: idx_notes_author_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notes_author_id ON public.notes USING btree (author_id);


--
-- Name: idx_notes_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notes_company_id ON public.notes USING btree (company_id);


--
-- Name: idx_notes_contact_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notes_contact_id ON public.notes USING btree (contact_id);


--
-- Name: idx_notes_deal_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notes_deal_id ON public.notes USING btree (deal_id);


--
-- Name: idx_notes_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notes_deleted_at ON public.notes USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_notes_org_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notes_org_id ON public.notes USING btree (organization_id);


--
-- Name: idx_org_members_org_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_members_org_id ON public.organization_members USING btree (organization_id);


--
-- Name: idx_org_members_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_members_role ON public.organization_members USING btree (role);


--
-- Name: idx_org_members_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_members_user_id ON public.organization_members USING btree (user_id);


--
-- Name: idx_organizations_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_organizations_active ON public.organizations USING btree (is_active);


--
-- Name: idx_organizations_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_organizations_slug ON public.organizations USING btree (slug);


--
-- Name: idx_pipeline_stages_pipeline_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pipeline_stages_pipeline_id ON public.pipeline_stages USING btree (pipeline_id);


--
-- Name: idx_pipeline_stages_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pipeline_stages_position ON public.pipeline_stages USING btree (pipeline_id, "position");


--
-- Name: idx_pipelines_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pipelines_default ON public.pipelines USING btree (is_default) WHERE (is_default = true);


--
-- Name: idx_pipelines_org_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pipelines_org_id ON public.pipelines USING btree (organization_id);


--
-- Name: idx_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_session_expire ON public.sessions USING btree (expire);


--
-- Name: idx_tags_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tags_name ON public.tags USING btree (name);


--
-- Name: idx_tags_org_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tags_org_id ON public.tags USING btree (organization_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_user_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_user_type ON public.users USING btree (user_type);


--
-- Name: idx_webhooks_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhooks_active ON public.integration_webhooks USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_webhooks_event_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhooks_event_type ON public.integration_webhooks USING btree (event_type);


--
-- Name: idx_webhooks_org_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_webhooks_org_id ON public.integration_webhooks USING btree (organization_id);


--
-- Name: activities update_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: companies update_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: contacts update_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: deals update_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: integration_webhooks update_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON public.integration_webhooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: notes update_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: organization_members update_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON public.organization_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: organizations update_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: pipeline_stages update_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON public.pipeline_stages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: pipelines update_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON public.pipelines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tags update_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activities activities_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: activities activities_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;


--
-- Name: activities activities_deal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id) ON DELETE SET NULL;


--
-- Name: activities activities_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: companies companies_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: contacts contacts_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: contacts contacts_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: deals deals_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: deals deals_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;


--
-- Name: deals deals_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: deals deals_pipeline_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_pipeline_id_fkey FOREIGN KEY (pipeline_id) REFERENCES public.pipelines(id) ON DELETE CASCADE;


--
-- Name: deals deals_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.pipeline_stages(id) ON DELETE RESTRICT;


--
-- Name: events_log events_log_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events_log
    ADD CONSTRAINT events_log_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: fatura_itens fatura_itens_fatura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fatura_itens
    ADD CONSTRAINT fatura_itens_fatura_id_fkey FOREIGN KEY (fatura_id) REFERENCES public.faturas(id) ON DELETE CASCADE;


--
-- Name: integration_webhooks integration_webhooks_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_webhooks
    ADD CONSTRAINT integration_webhooks_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: notes notes_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE SET NULL;


--
-- Name: notes notes_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: notes notes_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;


--
-- Name: notes notes_deal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id) ON DELETE SET NULL;


--
-- Name: notes notes_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_members organization_members_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: pipeline_stages pipeline_stages_pipeline_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipeline_stages
    ADD CONSTRAINT pipeline_stages_pipeline_id_fkey FOREIGN KEY (pipeline_id) REFERENCES public.pipelines(id) ON DELETE CASCADE;


--
-- Name: pipelines pipelines_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: tags tags_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


export type Status = string;

// Removendo ALLOWED_STATUSES hardcoded pois agora virão do banco

export interface KanbanColumn {
    id: string;
    title: string;
    color: string;
    order_index: number;
    ativo: boolean;
}

export interface Tarefa {
    id: string;
    passeio_id: string;
    cliente_id: string | null;
    guia_id?: string | null;
    data_passeio: string;
    numero_pessoas: number;
    valor_total: number;
    valor_comissao: number;
    percentual_comissao?: number;
    status: Status;
    observacoes?: string | null;
    passeio_nome?: string | null;
    cliente_nome?: string | null;
    guia_nome?: string | null;
    isLead?: boolean;
    leadEmail?: string;
    leadPhone?: string | null;
}

export interface Passeio {
    id: string;
    nome: string;
    descricao: string;
    preco: number;
    duracao: string;
    categoria: string;
}

export interface Cliente {
    id: string;
    nome: string;
    email: string;
    telefone: string;
}

export interface Guia {
    id: string;
    nome: string;
    email: string;
    especialidades: string[];
}

export interface NovaTarefaData {
    passeioId: string;
    data: string;
    clienteId?: string;
    guiaId?: string;
    numeroPessoas?: number | string;
    observacoes?: string;
    comissaoPercentual?: number;
    status?: Status;
}

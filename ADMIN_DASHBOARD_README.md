# 🏢 Dashboard Administrativo - TourGuide CRM

## 📋 Visão Geral

O Dashboard Administrativo é a interface principal para administradores de empresas de turismo gerenciarem suas operações através do TourGuide CRM.

## 🚀 Funcionalidades Principais

### 📊 Métricas em Tempo Real
- **Total de Agendamentos**: Contador de todos os agendamentos
- **Tarefas Ativas**: Tarefas em andamento
- **Agendamentos Pendentes**: Agendamentos aguardando confirmação
- **Receita Total**: Soma de todas as receitas
- **Guias Ativos**: Número de guias disponíveis
- **Total de Clientes**: Base de clientes cadastrados

### 🎯 Ações Rápidas
- **Nova Tarefa**: Criar agendamento rapidamente
- **Ver Agendamentos**: Acessar lista completa
- **Gerenciar Guias**: Administrar equipe de guias
- **Cadastrar Passeio**: Adicionar novos passeios
- **Relatório Financeiro**: Visualizar dados financeiros

### 📱 Responsividade
- **Desktop**: Layout completo com sidebar fixa
- **Mobile**: Menu hambúrguer com navegação otimizada
- **Tablet**: Layout adaptativo intermediário

## 🛠️ Tecnologias Utilizadas

- **React 19**: Framework principal
- **Next.js 15**: Roteamento e SSR
- **Tailwind CSS v4**: Estilização
- **Framer Motion**: Animações suaves
- **shadcn/ui**: Componentes UI
- **Lucide React**: Ícones
- **TypeScript**: Tipagem estática

## 📁 Estrutura de Arquivos

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx          # Layout específico do admin
│       └── page.tsx            # Página principal do dashboard
├── components/
│   ├── admin-dashboard.tsx     # Componente principal
│   ├── admin-mobile-nav.tsx    # Navegação mobile
│   ├── admin-stats.tsx         # Estatísticas em tempo real
│   └── admin-access-button.tsx # Botão de acesso
└── components/ui/              # Componentes shadcn/ui
```

## 🎨 Design System

### Paleta de Cores
- **Primária**: Azul (#0B4F6C) - Confiança e profissionalismo
- **Secundária**: Dourado (#F4A261) - Luxo e qualidade
- **Sucesso**: Verde (#10B981) - Confirmações
- **Alerta**: Âmbar (#F59E0B) - Atenção
- **Erro**: Vermelho (#EF4444) - Problemas

### Componentes
- **Cards**: Métricas e informações
- **Badges**: Status e indicadores
- **Buttons**: Ações e navegação
- **Sidebar**: Navegação principal
- **Mobile Nav**: Menu responsivo

## 🔧 Como Usar

### 1. Acesso ao Dashboard
```bash
# Navegar para o dashboard
http://localhost:3001/admin
```

### 2. Navegação
- **Desktop**: Sidebar fixa à esquerda
- **Mobile**: Menu hambúrguer no canto superior esquerdo

### 3. Funcionalidades
- **Métricas**: Visualização em tempo real
- **Tarefas**: Lista de tarefas recentes
- **Ações**: Botões de acesso rápido
- **Perfil**: Informações do usuário logado

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptações
- **Mobile**: Menu hambúrguer, cards empilhados
- **Tablet**: Layout híbrido
- **Desktop**: Sidebar fixa, grid completo

## 🎭 Animações

### Framer Motion
- **Entrada**: Fade in com slide up
- **Transições**: Suaves entre estados
- **Hover**: Efeitos interativos
- **Mobile**: Slide in/out do menu

## 🔒 Segurança

### Autenticação
- Verificação de permissões
- Controle de acesso por roles
- Sessões seguras
- Logout automático

### Dados
- Validação de entrada
- Sanitização de dados
- Criptografia de informações sensíveis

## 📈 Métricas e KPIs

### Operacionais
- Taxa de conversão de leads
- Tempo médio de resposta
- Satisfação do cliente
- Utilização de guias

### Financeiros
- Receita total
- Crescimento mensal
- Comissões pagas
- ROI por campanha

## 🚀 Próximas Funcionalidades

### Fase 2
- [ ] Notificações em tempo real
- [ ] Calendário integrado
- [ ] Relatórios avançados
- [ ] Exportação de dados

### Fase 3
- [ ] Chat integrado
- [ ] App mobile nativo
- [ ] Integração com pagamentos
- [ ] Sistema de avaliações

## 🐛 Troubleshooting

### Problemas Comuns
1. **Sidebar não aparece**: Verificar breakpoint (lg:block)
2. **Animações travadas**: Verificar Framer Motion
3. **Responsividade**: Testar em diferentes dispositivos
4. **Performance**: Otimizar re-renders

### Soluções
- Limpar cache do navegador
- Verificar console para erros
- Testar em modo incógnito
- Verificar dependências

## 📞 Suporte

Para dúvidas ou problemas:
- **Email**: suporte@turguide.com
- **Documentação**: [Link para docs]
- **Issues**: [Link para GitHub]

---

*Desenvolvido com ❤️ para revolucionar o turismo*


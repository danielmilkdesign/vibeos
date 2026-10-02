# VIBE OS CRM
## Especificação completa de melhorias do Frontend

**Produto:** VIBE OS — CRM comercial, operacional e de projetos  
**Repositório:** https://github.com/danielmilkdesign/vibeos  
**Aplicação atual:** https://vibeos-os.vercel.app/  
**Documento:** Melhorias completas de frontend  
**Versão:** 1.0  
**Idioma:** Português do Brasil  
**Moeda:** Real brasileiro  
**Fuso padrão:** America/Manaus

---

## 1. Objetivo deste documento

Este documento define como o frontend do VIBE OS deve evoluir de um protótipo visual para uma interface completa, clara, responsiva e preparada para operar um CRM real.

O frontend deve permitir que a equipe consiga executar o fluxo inteiro da empresa:

```text
Prospecção
  → Qualificação
  → Análise de 20 minutos
  → Proposta
  → Negociação
  → Fechamento
  → Onboarding
  → Projeto
  → Entrega
  → Aprovação
  → Recorrência
  → Renovação e upsell
```

O objetivo não é apenas criar mais páginas. O frontend precisa reduzir trabalho manual, tornar o próximo passo evidente e impedir que dados importantes fiquem escondidos em telas diferentes.

---

## 2. Diagnóstico do frontend atual

### Pontos positivos

O projeto já possui uma base visual consistente:

- Next.js e React.
- Tailwind CSS.
- Identidade visual escura e tecnológica.
- Sidebar com módulos do produto.
- Dashboard comercial e operacional.
- Página de leads com pesquisa e filtros.
- Kanban de pipeline.
- Páginas para agenda, propostas, projetos, contratos e conformidade.
- Uso de ícones com `lucide-react`.
- Componentes reutilizáveis como `KanbanBoard` e `LeadDetailModal`.
- Dados iniciais coerentes com o modelo comercial da VIBE.

### Problemas atuais

O frontend ainda apresenta características de protótipo:

1. A maioria dos dados vem de `localStorage`.
2. As telas não têm estados completos de carregamento, erro e vazio.
3. Algumas informações são texto livre em vez de referências a usuários e entidades.
4. O login é demonstrativo.
5. As permissões não são aplicadas de forma real no backend.
6. Os módulos não estão totalmente conectados entre si.
7. O dashboard mostra indicadores, mas nem todos representam cálculos reais.
8. Existem status diferentes para a mesma ideia de negócio.
9. Alguns botões aparentam ações reais, mas apenas atualizam estado local.
10. Não existe uma experiência consistente de confirmação, desfazer, toast e tratamento de erros.
11. A interface mobile precisa ser tratada como prioridade operacional.
12. Há necessidade de melhorar acessibilidade, foco de teclado e feedback de formulários.

---

## 3. Princípios de UX

### 3.1 Próximo passo sempre visível

Toda oportunidade, projeto e contrato deve mostrar claramente:

- Próximo passo.
- Responsável.
- Prazo.
- Status.
- Risco ou bloqueio.

### 3.2 Ações rápidas

A equipe deve conseguir executar ações frequentes sem navegar por várias páginas:

- Adicionar lead.
- Registrar contato.
- Agendar análise.
- Criar proposta.
- Mover oportunidade.
- Criar tarefa.
- Aprovar entrega.
- Abrir WhatsApp.
- Marcar follow-up concluído.

### 3.3 Contexto em uma única tela

A página de uma empresa deve reunir o histórico comercial e operacional em uma timeline, evitando que o usuário pesquise o mesmo cliente em leads, propostas, projetos e contratos separadamente.

### 3.4 Estados honestos

O frontend nunca deve aparentar que uma ação foi concluída quando a API falhou. Toda ação precisa apresentar:

- Estado inicial.
- Carregamento.
- Sucesso.
- Erro.
- Possibilidade de tentar novamente.

### 3.5 Desktop e mobile

Desktop deve priorizar produtividade em tabelas, kanban e dashboards. Mobile deve priorizar:

- Próximas tarefas.
- Agenda.
- Detalhes de leads.
- Aprovação de entregas.
- Registro rápido de interações.

### 3.6 Configuração sem alterar código

Segmentos, ofertas, etapas, motivos de perda, SLA e modelos de projeto devem ser exibidos no frontend a partir da configuração do backend.

---

## 4. Arquitetura de navegação

### Navegação principal

A sidebar deve conter:

1. **Visão geral**
2. **Prospecção**
3. **Pipeline**
4. **Agenda**
5. **Empresas**
6. **Propostas**
7. **Clientes**
8. **Projetos**
9. **Tarefas**
10. **Contratos**
11. **Entregas**
12. **Relatórios**
13. **Conformidade**
14. **Configurações**

A navegação deve ser agrupada por objetivo:

```text
COMERCIAL
- Prospecção
- Pipeline
- Agenda
- Propostas

RELACIONAMENTO
- Empresas
- Clientes
- Contratos

OPERAÇÃO
- Projetos
- Tarefas
- Entregas
- Conformidade

GESTÃO
- Dashboard
- Relatórios
- Configurações
```

### Cabeçalho global

O header deve conter:

- Breadcrumb.
- Busca global.
- Botão de criação rápida.
- Indicador de tarefas atrasadas.
- Central de notificações.
- Seletor de ambiente, se houver.
- Avatar e menu do usuário.

### Busca global

A busca deve procurar por:

- Empresa.
- Contato.
- Lead.
- Oportunidade.
- Proposta.
- Projeto.
- Contrato.

Resultados devem mostrar tipo, nome, segmento, status e atalho direto.

Atalho recomendado:

```text
Ctrl/Cmd + K = abrir busca global
```

---

## 5. Sistema visual

### Direção visual

Manter a personalidade atual de produto tecnológico, mas melhorar hierarquia, contraste e legibilidade.

### Tokens de cor

```css
--background: #070b14;
--surface: #0d1422;
--surface-raised: #111c2d;
--border: #1e293b;
--text-primary: #f8fafc;
--text-secondary: #94a3b8;
--text-muted: #64748b;
--brand: #06b6d4;
--brand-strong: #0891b2;
--success: #10b981;
--warning: #f59e0b;
--danger: #f43f5e;
--info: #6366f1;
```

### Regras visuais

- Não usar cor como único indicador de status.
- Usar ícone, texto e cor juntos.
- Manter bordas discretas.
- Evitar excesso de glow e sombras em todos os elementos.
- Usar espaçamento consistente.
- Limitar a quantidade de cores de destaque por tela.
- Usar tipografia monoespaçada somente para dados técnicos, números, IDs e status de sistema.

### Tipografia

- Título de página: 24–32px.
- Título de seção: 16–20px.
- Texto principal: 14–16px.
- Texto auxiliar: 12–13px.
- Labels de formulário: 12–13px, com contraste suficiente.
- Valores financeiros: destaque forte, sem exagero de tamanho.

### Componentes visuais obrigatórios

- Button.
- IconButton.
- Input.
- Select.
- Combobox.
- Textarea.
- DatePicker.
- CurrencyInput.
- PhoneInput.
- Badge.
- StatusBadge.
- Avatar.
- Tooltip.
- DropdownMenu.
- Modal.
- Drawer.
- ConfirmDialog.
- Toast.
- Tabs.
- Breadcrumb.
- Pagination.
- DataTable.
- KanbanCard.
- EmptyState.
- ErrorState.
- Skeleton.
- ProgressBar.
- Timeline.
- FileUploader.
- ApprovalPanel.

Esses componentes devem ser reutilizados em todas as páginas para evitar estilos divergentes.

---

## 6. Layout responsivo

### Breakpoints

```text
mobile: até 639px
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Desktop

- Sidebar fixa ou recolhível.
- Conteúdo central com largura máxima.
- Tabelas com colunas completas.
- Kanban horizontal com rolagem.
- Painel lateral para detalhes rápidos.

### Tablet

- Sidebar recolhível.
- Cards de dashboard em duas colunas.
- Tabelas com colunas prioritárias.
- Filtros agrupados em drawer.

### Mobile

- Sidebar vira drawer.
- Header com menu, busca e notificações.
- Cards em uma coluna.
- Tabelas viram cards ou lista horizontal.
- Kanban vira seletor de etapa com lista vertical.
- Formulários ocupam toda a largura.
- Botão de ação primária pode ficar fixo no rodapé.
- Modais grandes devem virar drawers de tela cheia.

### Regras mobile

- Área de toque mínima de 44px.
- Nunca depender de hover.
- Não colocar ações críticas somente em menus escondidos.
- Manter nome e status visíveis em cards.
- Permitir abrir WhatsApp diretamente do detalhe do lead.

---

## 7. Dashboard melhorado

A página inicial deve ser um painel de decisão, não apenas uma vitrine de números.

### Cabeçalho

Mostrar:

- Saudação com nome do usuário.
- Data atual.
- Filtro de período.
- Filtro de responsável.
- Filtro de segmento.
- Botão “Criar” com ações rápidas.

### Cards principais

1. Leads novos.
2. Follow-ups atrasados.
3. Pipeline aberto.
4. Receita ponderada.
5. Análises desta semana.
6. Propostas sem retorno.
7. Projetos em risco.
8. MRR ativo.

Cada card deve apresentar:

- Valor atual.
- Comparação com período anterior.
- Tendência.
- Link para lista filtrada.

### Área “Minha agenda de hoje”

Mostrar:

- Reuniões.
- Follow-ups.
- Tarefas de projeto.
- Aprovações pendentes.
- Contratos que exigem atenção.

### Área “Atenção necessária”

Priorizar:

- Oportunidades sem próximo passo.
- Propostas expirando.
- Tarefas vencidas.
- Projetos em risco.
- Clientes aguardando retorno.
- Renovações próximas.

### Área “Funil”

Exibir etapas com:

- Quantidade.
- Valor.
- Valor ponderado.
- Conversão entre etapas.

### Área “Produção”

Mostrar os projetos mais próximos do prazo com:

- Cliente.
- Serviço.
- Progresso.
- SLA.
- Responsável.
- Risco.

### Estados do dashboard

- Loading com skeleton.
- Sem dados no período.
- Erro parcial por widget.
- Erro total com retry.
- Última atualização visível.

---

## 8. Página de Prospecção

Rota sugerida:

```text
/prospeccao
```

A rota `/leads` pode continuar funcionando como compatibilidade, mas deve redirecionar ou compartilhar o mesmo módulo.

### Cabeçalho

- Título: “Prospecção outbound”.
- Subtítulo com total de leads.
- Botão “Adicionar lead”.
- Botão “Importar CSV”.
- Botão “Enriquecer selecionados”.
- Botão “Exportar”.

### Barra de filtros

- Busca.
- Segmento.
- Urgência.
- Status.
- Responsável.
- Origem.
- Localização.
- Possui site.
- Possui WhatsApp.
- Data de coleta.

Os filtros devem ser persistidos na URL para permitir compartilhamento e retorno à mesma pesquisa.

### Tabela desktop

Colunas:

- Seleção.
- Empresa.
- Segmento.
- Localização.
- Diagnóstico.
- Decisor.
- Urgência.
- Status.
- Próximo passo.
- Responsável.
- Ações.

### Card mobile

Mostrar:

- Nome da empresa.
- Segmento.
- Urgência.
- Diagnóstico resumido.
- Decisor.
- Botões para WhatsApp, e-mail e detalhes.

### Ações em lote

- Atribuir responsável.
- Alterar urgência.
- Alterar status.
- Criar tarefa.
- Exportar.
- Bloquear contato.

### Modal/drawer de detalhe do lead

Organizar em abas:

#### Resumo

- Empresa.
- Decisor.
- Segmento.
- Urgência.
- Diagnóstico.
- Valor estimado.

#### Diagnóstico

- Site.
- Link da bio.
- Autoridade.
- Tráfego.
- Presença social.
- Problema identificado.
- Recomendação.
- Fonte e data da análise.

#### Interações

- Timeline de contato.
- Tipo de interação.
- Conteúdo.
- Autor.
- Data.
- Botão “Registrar interação”.

#### Próximo passo

- Ação.
- Data.
- Responsável.
- Botão “Criar oportunidade”.

### Formulário de novo lead

Campos:

- Empresa.
- Segmento.
- Subsegmento.
- Cidade/estado.
- Site.
- Instagram.
- Link da bio.
- Nome do decisor.
- Cargo.
- E-mail.
- WhatsApp.
- Urgência.
- Diagnóstico.
- Fonte.
- Responsável.

Validações:

- Empresa obrigatória.
- Segmento obrigatório.
- Telefone normalizado.
- E-mail validado quando informado.
- Alerta de possível duplicidade.

---

## 9. Página de pipeline

Rota:

```text
/pipeline
```

### Etapas recomendadas

- Novo lead.
- Primeiro contato pendente.
- Contatado.
- Respondeu.
- Qualificado.
- Análise agendada.
- Análise realizada.
- Proposta enviada.
- Negociação.
- Fechado ganho.
- Fechado perdido.
- Nutrição futura.

### Kanban desktop

Cada coluna deve mostrar:

- Nome da etapa.
- Quantidade de oportunidades.
- Valor total.
- Valor ponderado.
- Botão adicionar.
- Scroll independente.

Cada card deve mostrar:

- Empresa.
- Título da oportunidade.
- Oferta.
- Valor.
- Probabilidade.
- Próxima ação.
- Data.
- Responsável.
- Indicador de atraso.

### Interação de mover card

Ao mover uma oportunidade:

1. Mostrar estado de salvamento.
2. Persistir no backend.
3. Atualizar métricas.
4. Registrar mudança na timeline.
5. Mostrar toast de sucesso.
6. Reverter visualmente se a API falhar.

### Painel lateral da oportunidade

Abas:

- Resumo.
- Empresa.
- Atividades.
- Reuniões.
- Propostas.
- Histórico.

Ações rápidas:

- Registrar contato.
- Agendar análise.
- Criar proposta.
- Marcar como ganha.
- Marcar como perdida.
- Criar tarefa.

### Formulário de oportunidade

- Empresa.
- Contato principal.
- Título.
- Oferta.
- Setup.
- Recorrência.
- Valor estimado.
- Probabilidade.
- Estágio.
- Data prevista de fechamento.
- Próxima ação.
- Data da próxima ação.
- Responsável.

---

## 10. Página de empresas

Rota:

```text
/empresas
```

### Lista

Filtros:

- Empresa.
- Segmento.
- Status.
- Responsável.
- Cidade.
- Cliente/prospect.
- Possui oportunidade aberta.
- Possui projeto ativo.

Colunas:

- Empresa.
- Segmento.
- Contatos.
- Oportunidade atual.
- Cliente desde.
- Projetos ativos.
- MRR.
- Última atividade.
- Próximo passo.

### Página de detalhe da empresa

Rota:

```text
/empresas/[id]
```

Cabeçalho:

- Nome da empresa.
- Segmento.
- Status.
- Responsável.
- Botões de WhatsApp, e-mail e editar.
- Botão “Criar oportunidade”.
- Botão “Criar tarefa”.

Abas:

1. Visão geral.
2. Contatos.
3. Oportunidades.
4. Propostas.
5. Projetos.
6. Contratos.
7. Timeline.
8. Arquivos.
9. Notas internas.

### Timeline

Cada evento deve ter:

- Ícone por tipo.
- Título.
- Descrição.
- Usuário.
- Data e hora.
- Link para entidade relacionada.

---

## 11. Página de agenda

Rota:

```text
/agenda
```

### Visualizações

- Dia.
- Semana.
- Mês.
- Lista.

### Filtros

- Responsável.
- Tipo de atividade.
- Status.
- Segmento.

### Eventos

Diferenciar visualmente:

- Análise comercial.
- Reunião de projeto.
- Follow-up.
- Entrega.
- Aprovação.
- Renovação.

### Detalhe da reunião

Mostrar:

- Empresa.
- Contato.
- Oportunidade.
- Link da reunião.
- Canal.
- Responsável.
- Diagnóstico.
- Oferta recomendada.
- Resultado.
- Próximo passo.

### Ações

- Confirmar.
- Reagendar.
- Cancelar.
- Marcar realizada.
- Marcar no-show.
- Abrir ficha da empresa.

---

## 12. Página de propostas

Rota:

```text
/propostas
```

### Lista

Colunas:

- Número.
- Cliente.
- Oferta.
- Setup.
- Recorrência.
- Status.
- Validade.
- Responsável.
- Última atualização.
- Ações.

### Filtros

- Status.
- Período.
- Oferta.
- Responsável.
- Valor.
- Expirando.

### Editor de proposta

O editor deve ser dividido em etapas:

1. Cliente.
2. Oferta e itens.
3. Escopo.
4. Prazo.
5. Valores.
6. Condições.
7. Revisão.
8. Envio.

### Resumo financeiro

Exibir claramente:

- Subtotal.
- Desconto.
- Setup.
- Recorrência.
- Total inicial.
- Valor mensal.
- Condições de pagamento.

### Preview

A proposta deve possuir uma visualização semelhante ao resultado final antes do envio.

### Ações

- Salvar rascunho.
- Duplicar.
- Criar nova versão.
- Enviar.
- Copiar link.
- Baixar PDF, quando disponível.
- Marcar aprovada.
- Marcar recusada.
- Registrar negociação.

### Alertas

- Proposta próxima de expirar.
- Proposta expirada.
- Proposta sem follow-up.
- Proposta aprovada sem contrato.

---

## 13. Página de clientes

Rota:

```text
/clientes
```

A página deve separar claramente:

- Prospects.
- Clientes ativos.
- Clientes pausados.
- Clientes encerrados.

### Cards de clientes

Mostrar:

- Nome.
- Segmento.
- Serviços ativos.
- MRR.
- Projeto atual.
- Próxima renovação.
- Saúde do relacionamento.
- Último contato.

### Saúde do relacionamento

Classificação visual:

- Saudável.
- Atenção.
- Risco.

Critérios configuráveis:

- Atrasos.
- Aprovações pendentes.
- Reclamações.
- Falta de contato.
- Inadimplência registrada.
- Renovação próxima.

---

## 14. Página de projetos

Rota:

```text
/projetos
```

### Lista/kanban

Filtros:

- Status.
- Risco.
- Responsável.
- Tipo.
- Segmento.
- Prazo.
- Cliente.

Cada projeto deve mostrar:

- Cliente.
- Serviço.
- Progresso.
- Prazo.
- Dias restantes.
- SLA contratado.
- Risco.
- Tarefas abertas.
- Bloqueio atual.
- Responsável.

### Página de detalhe

Rota:

```text
/projetos/[id]
```

Cabeçalho:

- Nome do projeto.
- Cliente.
- Status.
- Risco.
- Progresso.
- Prazo.
- Responsável.
- Ações rápidas.

Abas:

1. Resumo.
2. Tarefas.
3. Etapas.
4. Entregas.
5. Arquivos.
6. Comentários.
7. Aprovações.
8. Conformidade.
9. Histórico.

### Resumo do projeto

Mostrar:

- Percentual de conclusão.
- Linha de progresso.
- Prazo contratado.
- Prazo interno.
- Dias restantes.
- Tarefas concluídas e totais.
- Tarefas aguardando cliente.
- Próxima entrega.
- Última atividade.

### Indicador de SLA

Estados:

- Dentro do prazo.
- Próximo do limite.
- Em atraso.
- Pausado por cliente.

O sistema deve diferenciar atraso interno de período aguardando material ou aprovação do cliente.

### Template de projeto

Ao criar um projeto, mostrar uma seleção de templates:

- Presença Própria.
- Esteira de Crescimento.
- Sistema sob medida.
- Solução clínica.

O usuário deve revisar as etapas antes de confirmar.

---

## 15. Página de tarefas

Rota:

```text
/tarefas
```

### Visualizações

- Minhas tarefas.
- Todas as tarefas autorizadas.
- Por projeto.
- Por responsável.
- Calendário.
- Lista de atrasadas.

### Filtros

- Status.
- Prioridade.
- Responsável.
- Projeto.
- Prazo.
- Aguardando cliente.

### Ações rápidas

- Concluir.
- Reabrir.
- Reatribuir.
- Alterar prazo.
- Marcar bloqueio.
- Adicionar comentário.
- Anexar arquivo.

### Estados

- A fazer.
- Em andamento.
- Em revisão.
- Aguardando cliente.
- Bloqueada.
- Concluída.

---

## 16. Página de contratos

Rota:

```text
/contratos
```

### Dashboard do módulo

Cards:

- Contratos ativos.
- MRR.
- Renovações em 30 dias.
- Renovações em 60 dias.
- Contratos pausados.
- Status financeiro pendente.

### Lista

Colunas:

- Número.
- Cliente.
- Oferta.
- Setup.
- Recorrência.
- Vencimento.
- Renovação.
- Limite de entregas.
- Utilização.
- Status.
- Saúde.

### Página de detalhe

Abas:

1. Resumo.
2. Dados comerciais.
3. Ciclos mensais.
4. Entregas.
5. Projetos.
6. Pagamentos registrados.
7. Histórico.

### Barra de utilização

Exemplo:

```text
7 de 12 entregas utilizadas
58% consumido
```

A barra deve mudar de estado quando:

- Uso normal.
- Uso abaixo do planejado.
- Próximo do limite.
- Limite excedido.

### Alertas de renovação

- 60 dias.
- 30 dias.
- 15 dias.
- 7 dias.
- Vencido.

---

## 17. Página de entregas

Rota:

```text
/entregas
```

Este módulo é essencial para planos mensais de artes e conteúdo.

### Visualizações

- Entregas do ciclo atual.
- Calendário editorial.
- Quadro por status.
- Aguardando aprovação.
- Publicadas.

### Card de entrega

Mostrar:

- Cliente.
- Título.
- Tipo.
- Ciclo.
- Responsável.
- Status.
- Prazo.
- Arquivo.
- Comentário do cliente.

### Fluxo de aprovação

```text
Planejada
  → Em produção
  → Revisão interna
  → Enviada ao cliente
  → Ajustes solicitados
  → Aprovada
  → Publicada
```

### Ações do cliente, em fase futura

- Aprovar.
- Solicitar alteração.
- Comentar.
- Baixar arquivo.

### Ações internas

- Enviar para aprovação.
- Registrar alteração.
- Substituir arquivo.
- Marcar publicada.
- Duplicar para próximo ciclo.

---

## 18. Página de conformidade

Rota:

```text
/conformidade
```

### Visão geral

- Projetos sem revisão.
- Revisões pendentes.
- Aprovados.
- Com ressalvas.
- Bloqueados.

### Checklist

- Identidade profissional verificada.
- Prova social revisada.
- Claims revisados.
- Dados sensíveis protegidos.
- Imagens autorizadas.
- Revisão interna concluída.
- Observações.

### Experiência de revisão

A tela deve mostrar:

- Item do checklist.
- Estado.
- Responsável.
- Data.
- Comentário.
- Evidência ou arquivo.

O frontend deve deixar claro que o checklist é operacional e não substitui análise jurídica ou de conselho profissional.

---

## 19. Configurações

Rota:

```text
/configuracoes
```

Seções:

1. Perfil.
2. Usuários.
3. Equipes.
4. Permissões.
5. Segmentos.
6. Ofertas.
7. Etapas do pipeline.
8. Motivos de perda.
9. Templates de projeto.
10. SLA.
11. Notificações.
12. Integrações.
13. Privacidade e dados.
14. Auditoria.

### Usuários

- Criar.
- Editar.
- Desativar.
- Redefinir acesso.
- Atribuir função.
- Atribuir equipe.

### Ofertas

Campos:

- Nome.
- Categoria.
- Descrição.
- Setup padrão.
- Recorrência padrão.
- Prazo padrão.
- Limite de entregas.
- Template de projeto.
- Ativo/inativo.

### Pipeline

Permitir:

- Criar etapa.
- Alterar ordem.
- Definir probabilidade.
- Definir tipo: aberta, ganha, perdida ou pausada.
- Ativar ou desativar etapa.

---

## 20. Componentes e organização técnica

### Estrutura sugerida

```text
app/
  (auth)/
    login/
  (dashboard)/
    page.tsx
    prospeccao/
    pipeline/
    agenda/
    empresas/
    clientes/
    propostas/
    projetos/
    tarefas/
    contratos/
    entregas/
    relatorios/
    conformidade/
    configuracoes/

components/
  ui/
  layout/
  dashboard/
  leads/
  opportunities/
  companies/
  proposals/
  projects/
  tasks/
  contracts/
  deliverables/
  compliance/

lib/
  api/
  queries/
  mutations/
  validations/
  permissions/
  formatters/
  constants/

hooks/
  useDebounce.ts
  useFilters.ts
  usePagination.ts
  usePermissions.ts
  useToast.ts

schemas/
  lead.ts
  opportunity.ts
  proposal.ts
  project.ts
  contract.ts
```

### Camadas do frontend

```text
Page
  ↓
Feature component
  ↓
Form/Table/Modal component
  ↓
Query/Mutation hook
  ↓
API client ou Server Action
```

A camada visual não deve chamar diretamente `localStorage` em cada página.

### Gerenciamento de dados

Usar uma estratégia consistente para dados remotos, como TanStack Query ou equivalente, para:

- Cache.
- Refetch.
- Invalidação.
- Estados de carregamento.
- Mutations.
- Retry.

### Validação

Usar schema compartilhado entre formulário e backend quando possível, por exemplo com Zod.

---

## 21. Estados obrigatórios de cada tela

Toda tela com dados remotos deve implementar:

### Loading

- Skeleton de cards.
- Skeleton de tabela.
- Skeleton de detalhe.
- Não usar apenas “Carregando...”.

### Empty state

O estado vazio deve explicar:

- O que não existe ainda.
- Por que isso importa.
- Qual ação criar o primeiro registro.

Exemplo:

```text
Nenhuma oportunidade nesta etapa
Mova um lead qualificado para cá ou crie uma oportunidade manualmente.
[Adicionar oportunidade]
```

### Error state

Mostrar:

- Mensagem amigável.
- Código técnico somente quando útil.
- Botão tentar novamente.
- Canal para reportar o problema, se configurado.

### Success state

Após uma mutation:

- Toast curto.
- Atualização da lista.
- Fechamento do modal quando apropriado.
- Atualização da timeline.

### Unsaved changes

Ao fechar formulário com alterações não salvas:

```text
Existem alterações não salvas. Deseja sair mesmo assim?
[Continuar editando] [Sair sem salvar]
```

---

## 22. Formulários e validações

### Regras gerais

- Labels sempre visíveis.
- Placeholder não substitui label.
- Mensagem de erro próxima ao campo.
- Foco automático no primeiro campo inválido.
- Botão bloqueado apenas durante envio, não enquanto o usuário digita.
- Formulários longos divididos em seções.
- Campos obrigatórios marcados.
- Valores monetários formatados em BRL.
- Datas exibidas em formato brasileiro, armazenadas em ISO.

### Formato de moeda

Entrada:

```text
R$ 1.500,00
```

Armazenamento:

```text
1500.00
```

### Telefone

- Máscara visual brasileira.
- Normalização para formato internacional no backend.
- Botão para abrir WhatsApp.

### E-mail

- Validação básica.
- Aviso para domínio incomum, sem bloquear automaticamente.

---

## 23. Notificações e feedback

### Toasts

Tipos:

- Sucesso.
- Informação.
- Atenção.
- Erro.

Exemplos:

```text
Lead criado com sucesso.
Oportunidade movida para “Proposta enviada”.
Não foi possível salvar. Tente novamente.
Esta proposta expira em 3 dias.
```

### Central de notificações

Categorias:

- Follow-up vencido.
- Reunião próxima.
- Proposta expirando.
- Tarefa atrasada.
- Aprovação pendente.
- Renovação próxima.
- Falha de integração.

Cada notificação deve ter:

- Tipo.
- Texto.
- Data.
- Lida/não lida.
- Link para a entidade.
- Ação, quando aplicável.

---

## 24. Acessibilidade

O frontend deve seguir boas práticas WCAG 2.1 AA.

### Requisitos

- Contraste suficiente.
- Navegação completa por teclado.
- Foco visível.
- Modal com foco controlado.
- Escape fecha modal ou drawer.
- Labels associados aos campos.
- `aria-label` em ícones sem texto.
- Tabelas com cabeçalhos semânticos.
- Status não comunicados apenas por cor.
- Mensagens de erro anunciadas.
- Respeitar preferência de redução de movimento.
- Não depender de hover para revelar informação essencial.

---

## 25. Segurança no frontend

O frontend não deve ser responsável por proteger dados sozinho, mas precisa colaborar com o backend.

### Regras

- Não guardar tokens sensíveis em `localStorage` quando houver alternativa segura.
- Não expor chaves privadas.
- Não renderizar HTML não sanitizado.
- Não confiar em role vindo do cliente.
- Ocultar ações sem permissão, mas também validar no backend.
- Não incluir dados pessoais em logs do navegador desnecessariamente.
- Confirmar ações destrutivas.
- Mostrar somente arquivos autorizados.

### Ações destrutivas

Exigir confirmação para:

- Excluir empresa.
- Encerrar contrato.
- Cancelar projeto.
- Remover entrega.
- Desativar usuário.
- Excluir arquivo.

Preferir exclusão lógica sempre que possível.

---

## 26. Integração com backend

O frontend deve ser preparado para trabalhar com dados reais.

### Padrão de resposta

```ts
interface ApiSuccess<T> {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

interface ApiError {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
```

### Operações principais

```text
GET    /api/leads
POST   /api/leads
PATCH  /api/leads/:id
GET    /api/leads/:id

GET    /api/opportunities
POST   /api/opportunities
PATCH  /api/opportunities/:id
POST   /api/opportunities/:id/move-stage

GET    /api/companies
GET    /api/companies/:id
POST   /api/companies
PATCH  /api/companies/:id

GET    /api/proposals
POST   /api/proposals
PATCH  /api/proposals/:id
POST   /api/proposals/:id/send

GET    /api/projects
POST   /api/projects
PATCH  /api/projects/:id

GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id

GET    /api/contracts
POST   /api/contracts
PATCH  /api/contracts/:id

GET    /api/dashboard/summary
```

### Regras de atualização

- Invalidar cache após mutation.
- Atualizar UI otimisticamente apenas em operações reversíveis.
- Reverter UI se a API retornar erro.
- Evitar múltiplos envios do mesmo formulário.
- Usar idempotência em ações como “marcar ganha” e “criar contrato”.

---

## 27. Plano de melhorias por fases

### Fase 1 — fundação visual

- Criar tokens de design.
- Padronizar botões, inputs, badges e modais.
- Melhorar sidebar e header.
- Criar sistema de toast.
- Criar skeletons.
- Criar estados vazios e de erro.
- Padronizar cards e tabelas.
- Corrigir responsividade.

### Fase 2 — dashboard e navegação

- Melhorar dashboard.
- Adicionar busca global.
- Adicionar criação rápida.
- Adicionar central de notificações.
- Adicionar filtros de período.
- Criar cards acionáveis.

### Fase 3 — prospecção e pipeline

- Transformar leads em módulo completo.
- Melhorar drawer de detalhe.
- Implementar timeline.
- Melhorar filtros com URL.
- Kanban completo com drag and drop controlado.
- Painel lateral de oportunidades.
- Ações rápidas.

### Fase 4 — empresas, clientes e propostas

- Criar página 360° da empresa.
- Separar prospect e cliente.
- Criar editor de proposta em etapas.
- Criar preview de proposta.
- Criar alertas de validade.
- Conectar proposta à oportunidade.

### Fase 5 — projetos e tarefas

- Criar detalhe completo do projeto.
- Criar templates visuais.
- Criar timeline de projeto.
- Criar tarefas em lista e kanban.
- Criar indicador de SLA.
- Criar gestão de bloqueios.

### Fase 6 — contratos e entregas

- Criar detalhe do contrato.
- Criar ciclos mensais.
- Criar contador de entregas.
- Criar fluxo de aprovação.
- Criar alertas de renovação.
- Criar página de entregas.

### Fase 7 — dados reais e permissões

- Remover `localStorage` das operações de negócio.
- Conectar API/Server Actions.
- Implementar autenticação real.
- Aplicar permissões por usuário.
- Implementar auditoria visual.

### Fase 8 — qualidade

- Testes de componentes.
- Testes de formulários.
- Testes de navegação.
- Testes de acessibilidade.
- Testes responsivos.
- Testes de permissões.
- Testes de fluxos completos.

---

## 28. Testes de frontend

### Testes unitários

- Formatadores de moeda.
- Formatadores de status.
- Cálculo de progresso.
- Cálculo de uso de franquia.
- Validação de formulário.
- Regras de exibição por permissão.

### Testes de componentes

- Modal de lead.
- Kanban card.
- Formulário de proposta.
- Card de projeto.
- Barra de utilização de contrato.
- Checklist de conformidade.

### Testes de integração

- Criar lead.
- Editar lead.
- Registrar interação.
- Mover oportunidade.
- Criar proposta.
- Marcar venda ganha.
- Criar projeto.
- Aprovar entrega.
- Renovar contrato.

### Testes E2E

Fluxo principal:

```text
Login
  → Criar lead
  → Criar oportunidade
  → Agendar reunião
  → Criar proposta
  → Marcar como ganha
  → Criar projeto
  → Concluir tarefa
  → Aprovar entrega
```

### Testes responsivos

Validar pelo menos:

- 375px.
- 390px.
- 768px.
- 1024px.
- 1280px.
- 1440px.

---

## 29. Critérios de aceite do frontend

### Navegação

- Todas as rotas principais têm título, breadcrumb e estado ativo na sidebar.
- O usuário consegue voltar sem perder filtros importantes.
- A busca global encontra entidades autorizadas.

### Dados

- Nenhum módulo principal depende de `localStorage` para persistência.
- Listas possuem paginação ou carregamento incremental.
- Filtros refletem a URL quando aplicável.
- Alterações exibem feedback.

### Formulários

- Todos os campos obrigatórios são validados.
- Erros aparecem junto aos campos.
- Formulário não duplica registros por duplo clique.
- Alterações não salvas são protegidas.

### Pipeline

- Oportunidades podem ser movidas.
- O valor e a quantidade das colunas atualizam.
- A mudança é persistida.
- Erro de persistência desfaz a alteração visual.

### Projetos

- Projeto mostra progresso, risco, prazo e bloqueios.
- Tarefas podem ser filtradas e atualizadas.
- Aguardando cliente não é tratado como produção interna.

### Contratos

- MRR é exibido corretamente.
- Entregas utilizadas e contratadas são visíveis.
- Renovações próximas são destacadas.

### Acessibilidade

- Fluxos principais funcionam com teclado.
- Ícones têm rótulos.
- Contraste é suficiente.
- Mensagens de erro são compreensíveis.

---

## 30. Backlog priorizado

### Prioridade alta

- Corrigir inconsistência de status de projeto.
- Criar design system básico.
- Remover dependência direta de `localStorage` das novas funcionalidades.
- Implementar loading, error e empty states.
- Melhorar dashboard.
- Melhorar detalhe do lead.
- Criar timeline unificada.
- Criar página 360° da empresa.
- Conectar oportunidade a proposta.
- Criar fluxo de venda ganha.
- Implementar autenticação real.
- Aplicar permissões no frontend e backend.

### Prioridade média

- Busca global.
- Central de notificações.
- Página de clientes.
- Página de tarefas.
- Editor de proposta com preview.
- Ciclos mensais.
- Entregas e aprovação.
- Relatórios comerciais.
- Exportação de dados.

### Prioridade baixa

- Portal completo de cliente.
- Tema claro.
- Aplicativo mobile nativo.
- IA de sugestão de próximo passo.
- Integrações avançadas com plataformas externas.
- Customização visual por usuário.

---

## 31. Resultado esperado

Ao finalizar as melhorias, a experiência do usuário deve ser:

```text
O usuário entra no sistema
  ↓
Vê o que precisa fazer hoje
  ↓
Identifica oportunidades prioritárias
  ↓
Acessa a empresa e todo o histórico
  ↓
Registra o contato sem perder contexto
  ↓
Move a oportunidade com segurança
  ↓
Cria uma proposta a partir de um modelo
  ↓
Transforma venda em projeto
  ↓
Acompanha prazo, tarefas e bloqueios
  ↓
Controla entregas e aprovações
  ↓
Visualiza renovação e potencial de expansão
```

O frontend final deve transmitir três características:

1. **Clareza:** a equipe sabe o que fazer.
2. **Controle:** a gestão sabe o que está acontecendo.
3. **Continuidade:** vendas, projetos e recorrência fazem parte do mesmo histórico.

> O frontend do VIBE OS deve deixar de ser apenas uma interface de demonstração e se tornar a superfície operacional diária da VIBE Design Tech.

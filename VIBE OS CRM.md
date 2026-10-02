# VIBE OS CRM
## Especificação completa do produto e do desenvolvimento

**Produto:** CRM comercial, operacional e de projetos da VIBE Design Tech  
**Versão do documento:** 1.0  
**Status:** Especificação inicial para desenvolvimento  
**Idioma da interface:** Português do Brasil  
**Moeda:** Real brasileiro (BRL)  
**Fuso horário padrão:** America/Manaus  
**Aplicação existente:** https://vibeos-os.vercel.app/  
**Site comercial:** https://vibe-design-tech.vercel.app/

---

## 1. Objetivo do produto

O VIBE OS deve ser o sistema operacional comercial e operacional da VIBE Design Tech. O sistema precisa acompanhar o relacionamento com uma empresa desde a prospecção outbound até a contratação, execução do projeto, recorrência, renovação e expansão.

O fluxo central do produto é:

```text
Empresa mapeada
  → Lead qualificado
  → Contato realizado
  → Análise de 20 minutos
  → Proposta
  → Negociação
  → Cliente ganho
  → Projeto
  → Entrega e aprovação
  → Contrato recorrente
  → Renovação ou upsell
```

O sistema não deve ser apenas uma lista de empresas. Ele deve responder, em qualquer momento:

- Quem são os leads prioritários?
- Qual é o próximo passo de cada oportunidade?
- Quanto existe em pipeline?
- Quais reuniões estão próximas?
- Quais propostas estão sem retorno?
- Quais projetos estão atrasados?
- O que está aguardando o cliente?
- Quantas entregas mensais foram contratadas e utilizadas?
- Quais contratos serão renovados ou podem receber upsell?

---

## 2. Contexto do negócio

A VIBE Design Tech trabalha com design, tecnologia, inteligência artificial, sites, landing pages, sistemas e estruturas digitais orientadas à conversão.

A empresa atende principalmente:

- Empresas e negócios.
- Saúde e bem-estar.
- Clínicas médicas e odontológicas.
- Contabilidade e BPO.
- Advocacia e jurídico.
- Personal trainers e fitness.
- Especialistas de outros setores.

### Ofertas atuais

| Oferta | Estrutura comercial | Necessidade do sistema |
|---|---|---|
| Presença Própria | Setup de R$ 1.500 + R$ 99/mês | Projeto inicial e suporte/hospedagem recorrente |
| Esteira de Crescimento | Setup de R$ 2.200 + R$ 890/mês | Projeto inicial, conteúdo e gestão mensal |
| Plano de 5 artes | Mensalidade recorrente | Controle de franquia e aprovação de entregas |
| Plano de 12 artes | Mensalidade recorrente | Controle de ciclo, produção e publicação |
| Sistema sob medida | Venda consultiva | Escopo, orçamento, fases, riscos e aceite |
| Solução para clínicas | Projeto complexo | Requisitos, implantação, usuários e treinamento |

Os valores exibidos no sistema devem ser configuráveis. Não devem ficar fixos no código, pois planos e preços podem mudar.

---

## 3. Princípios do produto

1. **Próximo passo obrigatório:** toda oportunidade aberta deve ter uma próxima ação e uma data.
2. **Uma única fonte de verdade:** empresa, contato, oportunidade, projeto e contrato devem compartilhar o mesmo histórico.
3. **Venda e operação conectadas:** uma venda ganha deve gerar cliente e projeto sem redigitação.
4. **Automação com supervisão:** o sistema pode sugerir e lembrar, mas ações externas de alto impacto precisam ser controláveis.
5. **Visibilidade de bloqueios:** tarefas aguardando cliente devem ser claramente separadas de tarefas internas.
6. **LGPD desde o início:** origem, finalidade, opt-out, permissões e auditoria devem fazer parte do modelo.
7. **Configuração acima de código:** segmentos, etapas, ofertas, motivos de perda e templates devem ser configuráveis.
8. **Interface simples:** a equipe deve conseguir atualizar um lead em poucos segundos.

---

## 4. Escopo do MVP

### Incluído no MVP

- Login e recuperação de acesso.
- Usuários, equipes e permissões.
- Dashboard comercial e operacional.
- Cadastro de empresas.
- Cadastro de contatos.
- Cadastro e importação de leads.
- Prospecção outbound.
- Pipeline comercial em kanban.
- Atividades, tarefas e follow-ups.
- Agenda de análises e reuniões.
- Registro de interações.
- Propostas comerciais.
- Conversão de oportunidade em cliente.
- Templates de projetos.
- Gestão de projetos, tarefas e prazos.
- Entregas e aprovações.
- Contratos e planos recorrentes.
- Controle de ciclos e franquias de entregas.
- Relatórios básicos.
- Trilhas de auditoria.
- Exportação de dados autorizada.

### Fora do MVP inicial

- Emissão fiscal completa.
- Contabilidade.
- Gateway de pagamento obrigatório.
- Disparo massivo de WhatsApp.
- Integração completa com inbox do Instagram.
- Discador telefônico.
- Automação irreversível de cobrança.
- Área pública complexa para clientes.
- Aplicativo mobile nativo.
- Motor avançado de IA sem revisão humana.

Esses itens podem entrar em versões futuras depois que o fluxo principal estiver validado.

---

## 5. Perfis de usuário e permissões

### Administrador

Pode configurar o sistema, usuários, permissões, ofertas, etapas, integrações e visualizar todos os dados.

### Gestor comercial

Pode visualizar e editar leads, empresas, contatos, atividades, reuniões, oportunidades e propostas. Visualiza relatórios comerciais.

### Comercial

Pode gerenciar os leads e oportunidades atribuídos a ele, registrar atividades, agendar reuniões e criar propostas dentro dos modelos permitidos.

### Operações

Pode visualizar clientes e projetos, gerenciar tarefas, entregas, aprovações e prazos. Não deve editar informações financeiras sem permissão.

### Design/Conteúdo

Pode visualizar projetos atribuídos, produzir tarefas e atualizar entregas. Não deve acessar dados comerciais desnecessários.

### Financeiro

Pode visualizar contratos, valores, vencimentos, status de pagamento e renovação. Não precisa editar tarefas de produção.

### Cliente — fase posterior

Pode acessar apenas seus projetos, entregas, arquivos, comentários, aprovações e informações permitidas.

### Matriz resumida

| Módulo | Admin | Gestor comercial | Comercial | Operações | Produção | Financeiro |
|---|---:|---:|---:|---:|---:|---:|
| Usuários/configuração | Total | Não | Não | Não | Não | Não |
| Leads | Total | Total | Atribuídos | Leitura | Não | Não |
| Oportunidades | Total | Total | Atribuídas | Leitura | Não | Não |
| Propostas | Total | Total | Criar/editar próprias | Leitura | Não | Leitura |
| Clientes | Total | Leitura | Leitura | Total | Atribuídos | Leitura |
| Projetos | Total | Leitura | Leitura | Total | Atribuídos | Leitura |
| Contratos | Total | Leitura | Leitura | Leitura | Não | Total |
| Relatórios | Total | Comercial | Próprios | Operacional | Próprios | Financeiro |

A permissão efetiva deve ser validada no backend, nunca somente na interface.

---

## 6. Módulos do sistema

## 6.1 Dashboard

O dashboard deve ser adaptado ao perfil do usuário.

### Cards comerciais

- Leads novos no período.
- Leads sem primeiro contato.
- Oportunidades abertas.
- Valor total do pipeline.
- Ticket médio.
- Análises agendadas.
- Propostas aguardando retorno.
- Taxa de conversão.

### Cards operacionais

- Projetos ativos.
- Tarefas atrasadas.
- Entregas aguardando cliente.
- Projetos próximos do prazo.
- Horas ou esforço planejado versus realizado, se habilitado.
- Ciclos mensais em andamento.

### Cards de receita

- Receita de setup prevista.
- Receita recorrente mensal contratada.
- Contratos próximos da renovação.
- Valores vencidos registrados.
- Clientes com potencial de upsell.

### Componentes visuais

- Funil de oportunidades.
- Pipeline por segmento.
- Pipeline por origem.
- Atividades atrasadas.
- Agenda da semana.
- Projetos por status.
- Receita por mês.

Todos os cards devem permitir clicar e abrir a lista filtrada correspondente.

---

## 6.2 Prospecção outbound

Este módulo aproveita a tela atual do VIBE OS e deve evoluir de uma lista visual para uma base persistente e operável.

### Campos da empresa prospectada

- Nome da empresa.
- Nome comercial.
- Segmento.
- Subsegmento.
- Bairro.
- Cidade.
- Estado.
- País.
- Site atual.
- Instagram.
- Google Business Profile, quando disponível.
- Domínio.
- Status do domínio.
- Data da coleta.
- Data da última validação.
- Fonte do dado.
- Responsável interno.

### Campos do diagnóstico

- Site encontrado: sim/não.
- Site responsivo: sim/não/desconhecido.
- SSL: sim/não/desconhecido.
- Presença no Google.
- Autoridade estimada.
- Tráfego estimado.
- Dependência de Instagram.
- Dependência de Linktree ou cartão PDF.
- Existência de agendamento.
- Problema principal.
- Impacto comercial percebido.
- Recomendação inicial.
- Nível de urgência.
- Confiança do diagnóstico.

### Campos do decisor

- Nome.
- Cargo.
- Telefone.
- WhatsApp.
- E-mail.
- LinkedIn.
- Instagram.
- Fonte do contato.
- Data de validação.
- Status do contato.
- Preferência ou oposição a contato.

### Níveis de urgência

- Crítica.
- Alta.
- Média.
- Baixa.
- Sem classificação.

A urgência deve ser calculada por regras configuráveis, mas sempre pode ser ajustada manualmente por um usuário autorizado.

### Ações da lista outbound

- Abrir empresa.
- Enriquecer dados.
- Atribuir responsável.
- Criar tarefa de primeiro contato.
- Abrir WhatsApp.
- Abrir e-mail.
- Registrar contato realizado.
- Criar oportunidade.
- Marcar como não qualificado.
- Bloquear contato.
- Exportar, se autorizado.

### Filtros

- Segmento.
- Bairro.
- Cidade.
- Urgência.
- Fonte.
- Responsável.
- Status de contato.
- Data de coleta.
- Possui site.
- Possui WhatsApp.
- Possui e-mail.

---

## 6.3 Empresas e contatos

Empresa e contato são entidades separadas.

Uma empresa pode ter vários contatos, e um contato pode ter funções diferentes ao longo do relacionamento.

### Empresa

- Identificação.
- Dados legais, se disponíveis e necessários.
- Marca.
- Segmento.
- Endereço.
- Canais digitais.
- Status: prospect, cliente, inativo, bloqueado.
- Responsável.
- Origem.
- Tags.
- Histórico.

### Contato

- Nome.
- Cargo.
- E-mail.
- Telefone.
- WhatsApp.
- Instagram.
- Papel na decisão: decisor, influenciador, usuário, financeiro ou outro.
- Preferência de contato.
- Status de consentimento/oposição.
- Última validação.
- Notas.

### Timeline 360°

A página da empresa deve mostrar em uma linha do tempo:

- Importação ou criação.
- Diagnósticos.
- Mensagens registradas.
- Ligações.
- Reuniões.
- Propostas.
- Mudanças de etapa.
- Contratos.
- Projetos.
- Entregas.
- Aprovações.
- Pagamentos registrados.
- Observações internas.

---

## 6.4 Pipeline comercial

### Etapas padrão

| Ordem | Etapa | Tipo | Probabilidade inicial |
|---:|---|---|---:|
| 1 | Novo lead | Aberta | 5% |
| 2 | Primeiro contato pendente | Aberta | 5% |
| 3 | Contatado | Aberta | 10% |
| 4 | Respondeu | Aberta | 20% |
| 5 | Qualificado | Aberta | 30% |
| 6 | Análise agendada | Aberta | 40% |
| 7 | Análise realizada | Aberta | 50% |
| 8 | Proposta enviada | Aberta | 65% |
| 9 | Negociação | Aberta | 80% |
| 10 | Fechado ganho | Ganho | 100% |
| 11 | Fechado perdido | Perdida | 0% |
| 12 | Nutrição futura | Pausada | 5% |

As probabilidades devem ser editáveis por administradores.

### Campos da oportunidade

- Título.
- Empresa.
- Contato principal.
- Oferta.
- Valor estimado.
- Valor de setup.
- Valor recorrente.
- Probabilidade.
- Etapa.
- Segmento.
- Origem.
- Responsável.
- Data prevista de fechamento.
- Prazo desejado pelo cliente.
- Problema identificado.
- Solução proposta.
- Concorrente, se informado.
- Próximo passo.
- Data do próximo passo.
- Motivo de perda.
- Observações.

### Regras de negócio

- Oportunidade aberta sem próximo passo não pode ser salva, exceto por administrador.
- Mudança para “Fechado ganho” exige oferta, valor e contato principal.
- Mudança para “Fechado perdido” exige motivo.
- Mudança para “Análise agendada” exige data e horário.
- Mudança para “Proposta enviada” exige uma proposta associada.
- Uma empresa pode ter mais de uma oportunidade, mas o sistema deve alertar sobre duplicidade.
- O valor ponderado do pipeline é valor estimado multiplicado pela probabilidade.

### Visualizações

- Kanban.
- Lista.
- Tabela por responsável.
- Funil.
- Calendário de fechamento.

---

## 6.5 Atividades e follow-ups

### Tipos de atividade

- Tarefa.
- Ligação.
- WhatsApp.
- E-mail.
- Reunião.
- Nota interna.
- Proposta enviada.
- Follow-up.
- Aprovação.

### Campos

- Tipo.
- Título.
- Descrição.
- Empresa.
- Contato.
- Oportunidade.
- Projeto, quando aplicável.
- Responsável.
- Prioridade.
- Prazo.
- Status.
- Resultado.
- Anexos.
- Data de conclusão.

### Regras automáticas

- Novo lead cria tarefa de primeiro contato.
- Análise agendada cria lembrete de preparação e lembrete pré-reunião.
- Proposta enviada cria follow-ups em D+2, D+5 e D+10.
- Atividade vencida aparece no dashboard do responsável.
- Atividade concluída pode exigir o registro do próximo passo.
- Se o cliente não responder após o último follow-up, oferecer mudança para nutrição.

O sistema não deve disparar mensagens automaticamente sem que o usuário configure e autorize o canal, o template e a regra de envio.

---

## 6.6 Agenda e análise de 20 minutos

### Dados da reunião

- Título.
- Empresa.
- Contato.
- Oportunidade.
- Data e hora.
- Duração.
- Link da reunião.
- Local ou canal.
- Responsável.
- Status: agendada, confirmada, realizada, cancelada, não compareceu.
- Diagnóstico resumido.
- Problema principal.
- Próximo passo.

### Resultado da análise

O formulário pós-reunião deve registrar:

- Momento atual do negócio.
- Principal gargalo.
- Oferta recomendada.
- Orçamento percebido.
- Prazo.
- Nível de decisão.
- Objeções.
- Próximo passo.
- Data do próximo contato.

---

## 6.7 Propostas comerciais

### Estados

- Rascunho.
- Em revisão.
- Enviada.
- Visualizada, se a integração suportar.
- Em negociação.
- Aprovada.
- Recusada.
- Expirada.
- Cancelada.

### Estrutura da proposta

- Número da proposta.
- Empresa.
- Contato.
- Oportunidade.
- Validade.
- Prazo de início.
- Prazo de entrega.
- Escopo.
- Itens de serviço.
- Quantidades.
- Valor unitário.
- Descontos.
- Setup.
- Mensalidade.
- Condições de pagamento.
- Observações.
- Exclusões de escopo.
- Responsável.
- Histórico de versões.

### Modelos de proposta

- Presença Própria.
- Esteira de Crescimento.
- Site institucional.
- Landing page.
- Design para redes sociais.
- Sistema sob medida.
- Sistema para clínica.
- Proposta personalizada.

### Aceite

Uma proposta aprovada deve registrar:

- Data e hora.
- Usuário ou contato que aprovou.
- Versão aprovada.
- Valor aprovado.
- Condições aceitas.
- Evidência do aceite, quando disponível.

---

## 6.8 Clientes e onboarding

Ao converter uma oportunidade em cliente, o sistema deve criar automaticamente o cadastro do cliente e oferecer a criação de um projeto a partir do template relacionado à oferta.

### Checklist de onboarding

- Contrato confirmado.
- Pagamento inicial registrado.
- Contato principal confirmado.
- Briefing enviado.
- Briefing recebido.
- Logotipo recebido.
- Fotos recebidas.
- Textos e referências recebidos.
- Domínio confirmado.
- Acessos necessários recebidos.
- Reunião de kickoff agendada.
- Responsável interno atribuído.
- Prazo validado.

A ausência de material do cliente deve aparecer como bloqueio, não como atraso interno da equipe.

---

## 6.9 Projetos

### Campos do projeto

- Nome.
- Cliente.
- Empresa.
- Oportunidade de origem.
- Contrato.
- Tipo de projeto.
- Template utilizado.
- Responsável.
- Equipe.
- Status.
- Prioridade.
- Data de início.
- Prazo contratado.
- Prazo interno.
- Percentual concluído.
- Risco.
- Orçamento ou esforço estimado.
- Links externos.
- Observações.

### Status

- Não iniciado.
- Onboarding.
- Em planejamento.
- Em produção.
- Aguardando cliente.
- Em revisão interna.
- Em aprovação.
- Publicação.
- Concluído.
- Pausado.
- Cancelado.

### Risco do projeto

- Normal.
- Atenção.
- Crítico.

Um projeto deve ser classificado como crítico quando houver prazo ultrapassado, bloqueio relevante ou aprovação pendente além do SLA configurado.

### Views

- Kanban.
- Lista.
- Timeline.
- Calendário.
- Gantt simplificado, se necessário.
- Visão por responsável.

---

## 6.10 Tarefas e entregas

### Campos da tarefa

- Título.
- Projeto.
- Etapa.
- Responsável.
- Criador.
- Prazo.
- Prioridade.
- Status.
- Dependências.
- Checklist.
- Descrição.
- Arquivos.
- Comentários.
- Tempo estimado.
- Tempo realizado, opcional.

### Status

- A fazer.
- Em andamento.
- Em revisão interna.
- Aguardando cliente.
- Aprovada.
- Concluída.
- Bloqueada.
- Cancelada.

### Entregas recorrentes

Cada entrega mensal deve possuir:

- Ciclo de referência.
- Contrato.
- Tipo de entrega.
- Número ou posição da entrega.
- Data planejada.
- Data de envio.
- Data de aprovação.
- Responsável.
- Status.
- Comentário do cliente.
- Arquivo final.

---

## 6.11 Contratos e recorrência

### Dados do contrato

- Número.
- Cliente.
- Empresa.
- Oportunidade.
- Oferta/plano.
- Data de início.
- Data de término ou renovação.
- Valor de setup.
- Valor recorrente.
- Periodicidade.
- Dia de vencimento.
- Status.
- Condições de cancelamento.
- Limite de entregas.
- Responsável comercial.
- Responsável operacional.

### Status

- Rascunho.
- Em assinatura.
- Ativo.
- Pausado.
- Próximo da renovação.
- Encerrado.
- Cancelado.

### Controle mensal

O sistema deve criar automaticamente um ciclo mensal para contratos recorrentes ativos.

Cada ciclo deve informar:

- Período.
- Entregas contratadas.
- Entregas planejadas.
- Entregas em produção.
- Entregas aguardando aprovação.
- Entregas aprovadas.
- Entregas publicadas.
- Pendências.
- Reunião de calibração.
- Status do ciclo.

### Alertas

- Contrato vencendo em 60 dias.
- Contrato vencendo em 30 dias.
- Ciclo sem planejamento.
- Entregas abaixo do ritmo esperado.
- Aprovação pendente.
- Mensalidade com status vencido.

O sistema deve registrar status financeiro, mas não precisa realizar cobrança no MVP.

---

## 6.12 Normas e conformidade

Como a VIBE atende segmentos regulados, o sistema pode ter um módulo de referência e checklist de conformidade.

### Segmentos

- Medicina.
- Odontologia.
- Psicologia.
- Nutrição.
- Fisioterapia.
- Advocacia.
- Fitness.
- Outros.

### Checklist por projeto

- Segmento identificado.
- Regras aplicáveis selecionadas.
- Prova social revisada.
- Claims e promessas revisados.
- Imagens autorizadas.
- Dados sensíveis evitados ou protegidos.
- Aprovação interna registrada.
- Observações de conformidade.

O módulo não deve afirmar que uma peça ou campanha é juridicamente válida sem revisão humana especializada. Ele deve funcionar como checklist operacional e registro de revisão.

---

## 7. Modelo de dados

A implementação pode usar PostgreSQL. Os nomes abaixo são uma sugestão de estrutura.

### users

- id
- name
- email
- phone
- role_id
- team_id
- status
- last_login_at
- created_at
- updated_at

### roles

- id
- name
- permissions_json
- created_at
- updated_at

### teams

- id
- name
- description
- active

### companies

- id
- legal_name
- trade_name
- document_number, opcional
- segment_id
- subsegment
- address_json
- city
- state
- country
- website
- instagram_url
- google_profile_url
- status
- owner_id
- source_id
- tags_json
- created_at
- updated_at
- archived_at

### contacts

- id
- company_id
- full_name
- role_title
- decision_role
- email
- phone
- whatsapp
- linkedin_url
- instagram_url
- contact_status
- consent_status
- consent_source
- consent_updated_at
- last_validated_at
- created_at
- updated_at

### leads

- id
- company_id
- primary_contact_id
- source_id
- segment_id
- urgency
- qualification_status
- diagnostic_json
- data_source
- collected_at
- validated_at
- owner_id
- created_at
- updated_at

### opportunities

- id
- company_id
- primary_contact_id
- lead_id
- offer_id
- stage_id
- title
- setup_value
- recurring_value
- estimated_value
- probability
- expected_close_date
- desired_start_date
- problem_statement
- proposed_solution
- owner_id
- next_action
- next_action_at
- loss_reason_id
- created_at
- updated_at
- closed_at

### pipeline_stages

- id
- name
- order_index
- stage_type
- default_probability
- active

### activities

- id
- type
- title
- description
- company_id
- contact_id
- opportunity_id
- project_id
- assigned_to
- priority
- status
- due_at
- completed_at
- result
- created_by
- created_at
- updated_at

### meetings

- id
- company_id
- contact_id
- opportunity_id
- title
- starts_at
- ends_at
- channel
- meeting_url
- assigned_to
- status
- notes
- outcome
- next_step
- created_at
- updated_at

### offers

- id
- name
- category
- description
- setup_default
- recurring_default
- delivery_days_default
- active
- metadata_json
- created_at
- updated_at

### proposals

- id
- opportunity_id
- company_id
- contact_id
- proposal_number
- version
- status
- valid_until
- setup_value
- recurring_value
- total_value
- scope_text
- terms_text
- sent_at
- approved_at
- rejected_at
- approved_by
- created_by
- created_at
- updated_at

### proposal_items

- id
- proposal_id
- description
- quantity
- unit_price
- discount
- total
- order_index

### contracts

- id
- company_id
- opportunity_id
- proposal_id
- offer_id
- contract_number
- status
- starts_on
- ends_on
- renewal_on
- setup_value
- recurring_value
- billing_period
- due_day
- delivery_limit
- signed_at
- cancelled_at
- cancellation_reason
- created_at
- updated_at

### projects

- id
- company_id
- contract_id
- opportunity_id
- template_id
- name
- project_type
- status
- priority
- risk_level
- owner_id
- starts_on
- due_on
- internal_due_on
- progress_percent
- estimated_effort
- external_links_json
- created_at
- updated_at

### project_templates

- id
- name
- project_type
- description
- active
- created_at
- updated_at

### project_stages

- id
- template_id
- name
- order_index
- default_days
- active

### tasks

- id
- project_id
- stage_id
- parent_task_id
- title
- description
- assigned_to
- priority
- status
- due_on
- started_at
- completed_at
- blocked_reason
- estimated_effort
- actual_effort
- created_by
- created_at
- updated_at

### deliverables

- id
- project_id
- contract_id
- cycle_id
- type
- title
- sequence_number
- status
- planned_on
- sent_on
- approved_on
- published_on
- assigned_to
- client_comment
- final_file_url
- created_at
- updated_at

### recurring_cycles

- id
- contract_id
- period_start
- period_end
- status
- contracted_quantity
- planned_quantity
- produced_quantity
- approved_quantity
- published_quantity
- planning_meeting_at
- review_meeting_at
- created_at
- updated_at

### payment_records

- id
- company_id
- contract_id
- reference_period
- due_on
- amount
- status
- paid_on
- notes
- created_at
- updated_at

### files

- id
- company_id
- project_id
- task_id
- deliverable_id
- file_name
- storage_path
- mime_type
- size_bytes
- uploaded_by
- created_at

### notes

- id
- company_id
- contact_id
- opportunity_id
- project_id
- visibility
- body
- created_by
- created_at
- updated_at

### audit_logs

- id
- actor_id
- entity_type
- entity_id
- action
- before_json
- after_json
- ip_hash, se aplicável
- created_at

---

## 8. API sugerida

A API pode ser construída com rotas REST ou tRPC. O importante é manter contratos claros, validação e autorização no servidor.

### Autenticação

```text
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
GET    /api/auth/me
```

### Empresas e contatos

```text
GET    /api/companies
POST   /api/companies
GET    /api/companies/:id
PATCH  /api/companies/:id
DELETE /api/companies/:id
GET    /api/companies/:id/timeline
GET    /api/companies/:id/contacts
POST   /api/companies/:id/contacts
PATCH  /api/contacts/:id
```

### Leads

```text
GET    /api/leads
POST   /api/leads
POST   /api/leads/import
GET    /api/leads/:id
PATCH  /api/leads/:id
POST   /api/leads/:id/enrich
POST   /api/leads/:id/convert-to-opportunity
POST   /api/leads/:id/block
```

### Oportunidades

```text
GET    /api/opportunities
POST   /api/opportunities
GET    /api/opportunities/:id
PATCH  /api/opportunities/:id
POST   /api/opportunities/:id/move-stage
POST   /api/opportunities/:id/mark-won
POST   /api/opportunities/:id/mark-lost
```

### Atividades e reuniões

```text
GET    /api/activities
POST   /api/activities
PATCH  /api/activities/:id
POST   /api/activities/:id/complete
GET    /api/meetings
POST   /api/meetings
PATCH  /api/meetings/:id
```

### Propostas

```text
GET    /api/proposals
POST   /api/proposals
GET    /api/proposals/:id
POST   /api/proposals/:id/send
POST   /api/proposals/:id/approve
POST   /api/proposals/:id/reject
POST   /api/proposals/:id/new-version
```

### Clientes, contratos e projetos

```text
GET    /api/clients
POST   /api/clients/convert
GET    /api/contracts
POST   /api/contracts
PATCH  /api/contracts/:id
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
POST   /api/projects/:id/create-from-template
```

### Tarefas e entregas

```text
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id
POST   /api/tasks/:id/complete
GET    /api/deliverables
POST   /api/deliverables
PATCH  /api/deliverables/:id
POST   /api/deliverables/:id/request-approval
POST   /api/deliverables/:id/approve
POST   /api/deliverables/:id/request-changes
```

### Dashboard e relatórios

```text
GET    /api/dashboard/summary
GET    /api/reports/pipeline
GET    /api/reports/conversion
GET    /api/reports/operations
GET    /api/reports/recurring-revenue
```

Todas as rotas devem aplicar autenticação, autorização, validação de entrada e paginação.

---

## 9. Requisitos não funcionais

### Segurança

- Senhas nunca armazenadas em texto puro.
- Sessões com expiração e revogação.
- Controle de acesso no servidor.
- Validação de todos os dados recebidos.
- Proteção contra SQL injection, XSS e CSRF conforme arquitetura.
- URLs de arquivos com acesso controlado.
- Segredos somente em variáveis de ambiente.
- Logs sem exposição desnecessária de dados sensíveis.
- Backup e restauração testados.

### Privacidade e LGPD

- Registrar origem e finalidade dos dados.
- Permitir marcar oposição a contato.
- Impedir contato de leads bloqueados.
- Permitir anonimização ou exclusão conforme política definida.
- Separar notas internas de informações do cliente.
- Minimizar dados pessoais coletados.
- Restringir acesso por função.
- Manter auditoria de alterações relevantes.

### Performance

- Listas paginadas.
- Busca com debounce.
- Filtros no servidor para grandes volumes.
- Dashboard com consultas agregadas e cache quando apropriado.
- Upload com limite de tamanho e tipo.
- Tempo de carregamento inicial adequado para conexão móvel.

### Confiabilidade

- Tratamento de erros amigável.
- Estados de carregamento e vazio.
- Confirmação para ações destrutivas.
- Idempotência em webhooks e conversões.
- Monitoramento de erros.
- Health check da aplicação.

### Acessibilidade

- Contraste adequado.
- Navegação por teclado.
- Labels em formulários.
- Mensagens de erro claras.
- Estados não comunicados apenas por cor.
- Interface responsiva.

---

## 10. Integrações

### Fase 1

#### Site da VIBE

Criar um formulário de diagnóstico conectado ao CRM com:

- Nome.
- Empresa.
- WhatsApp.
- E-mail.
- Segmento.
- Site ou Instagram.
- Principal desafio.
- Prazo.
- Oferta de interesse.
- Consentimento ou aviso de privacidade.

O envio deve criar empresa, contato, lead e tarefa de primeiro contato.

#### Google Calendar

- Criar eventos de análise.
- Sincronizar data e horário.
- Registrar cancelamentos.
- Associar evento à oportunidade.

#### E-mail transacional

- Confirmação de reunião.
- Lembrete de reunião.
- Envio de proposta.
- Follow-up manual ou autorizado.
- Notificação de aprovação.

### Fase 2

#### n8n

Webhooks sugeridos:

```text
lead.created
lead.qualified
meeting.scheduled
proposal.sent
proposal.approved
opportunity.won
project.created
deliverable.approval_requested
deliverable.approved
contract.renewal_due
```

Cada evento deve conter `event_id`, `event_type`, `occurred_at`, `entity_type`, `entity_id` e `payload`.

#### WhatsApp Business API

Antes de integrar:

- Confirmar conta empresarial.
- Confirmar número.
- Definir provedor.
- Criar templates aprovados.
- Definir regras de opt-in e opt-out.
- Registrar mensagens e respostas no histórico.

O sistema não deve depender de automação de WhatsApp para funcionar.

#### Fontes de enriquecimento

DataForSEO, Semrush, Similarweb e Apollo podem ser conectados por um serviço intermediário. As credenciais nunca devem ser expostas no frontend. Cada dado enriquecido deve registrar fonte, data, custo quando aplicável e confiança.

---

## 11. Automação e regras

### Automação de novos leads

1. Receber lead.
2. Verificar duplicidade por domínio, telefone e e-mail.
3. Criar ou atualizar empresa.
4. Criar ou atualizar contato.
5. Criar lead.
6. Classificar segmento.
7. Criar tarefa de contato.
8. Notificar responsável.

### Automação de reunião

1. Criar reunião.
2. Associar à oportunidade.
3. Criar lembrete interno.
4. Enviar confirmação, se habilitado.
5. Após a reunião, solicitar resultado.
6. Exigir próximo passo.

### Automação de proposta

1. Alterar oportunidade para “Proposta enviada”.
2. Registrar data de envio.
3. Criar follow-up D+2.
4. Criar follow-up D+5.
5. Criar follow-up D+10.
6. Alertar gestor se não houver resposta.

### Automação de venda ganha

1. Validar dados obrigatórios.
2. Criar cliente.
3. Criar contrato, se aplicável.
4. Criar projeto pelo template da oferta.
5. Criar checklist de onboarding.
6. Atribuir responsáveis.
7. Criar atividade de kickoff.
8. Notificar equipe.

### Automação de ciclo recorrente

1. Criar ciclo no início do período.
2. Copiar entregas padrão do contrato.
3. Criar planejamento.
4. Alertar se o ciclo não tiver planejamento.
5. Alertar entregas atrasadas.
6. Solicitar aprovação.
7. Encerrar ciclo com resumo.

---

## 12. Templates de projeto

### Template: Presença Própria

| Ordem | Etapa | Prazo padrão |
|---:|---|---:|
| 1 | Onboarding e briefing | 1 dia |
| 2 | Coleta de materiais | 2 dias |
| 3 | Arquitetura e copy | 1 dia |
| 4 | Design | 2 dias |
| 5 | Desenvolvimento | 2 dias |
| 6 | Revisão interna | 1 dia |
| 7 | Aprovação do cliente | 2 dias |
| 8 | Ajustes finais | 1 dia |
| 9 | Publicação | 1 dia |
| 10 | Treinamento e encerramento | 1 dia |

### Template: Esteira de Crescimento

| Ordem | Etapa | Entregas |
|---:|---|---|
| 1 | Planejamento mensal | Pautas e objetivos |
| 2 | Copywriting | Textos e chamadas |
| 3 | Design | 5 ou 12 artes |
| 4 | Revisão interna | Qualidade e conformidade |
| 5 | Aprovação | Feedback do cliente |
| 6 | Publicação | Conteúdos finais |
| 7 | Calibração | Relatório e reunião |

### Template: Sistema sob medida

| Ordem | Etapa |
|---:|---|
| 1 | Descoberta |
| 2 | Requisitos |
| 3 | Escopo e arquitetura |
| 4 | Proposta técnica |
| 5 | Kickoff |
| 6 | Design/UX |
| 7 | Desenvolvimento |
| 8 | Testes |
| 9 | Homologação |
| 10 | Implantação |
| 11 | Treinamento |
| 12 | Suporte |

---

## 13. Relatórios e indicadores

### Comercial

- Leads por período.
- Leads por origem.
- Leads por segmento.
- Leads por urgência.
- Tempo até primeiro contato.
- Taxa de resposta.
- Taxa de agendamento.
- Taxa de comparecimento.
- Taxa de proposta.
- Taxa de fechamento.
- Tempo médio de fechamento.
- Ticket médio.
- Receita de setup.
- Receita recorrente gerada.
- Motivos de perda.

### Operacional

- Projetos ativos.
- Projetos por etapa.
- Tarefas atrasadas.
- Tarefas por responsável.
- Entregas aguardando cliente.
- Tempo médio de entrega.
- Retrabalho.
- Projetos em risco.
- Cumprimento do SLA de 7 dias.

### Relacionamento

- Clientes ativos.
- Clientes inativos.
- Renovações próximas.
- Cancelamentos.
- Churn.
- Upsell.
- NPS ou satisfação.
- Depoimentos solicitados e recebidos.

### Fórmulas

```text
Valor ponderado do pipeline = valor da oportunidade × probabilidade

Taxa de fechamento = oportunidades ganhas ÷ oportunidades encerradas

Taxa de agendamento = análises agendadas ÷ leads qualificados

Taxa de comparecimento = análises realizadas ÷ análises agendadas

MRR = soma das mensalidades recorrentes ativas

Churn de clientes = cancelamentos no período ÷ clientes ativos no início do período

Cumprimento de SLA = projetos entregues no prazo ÷ projetos entregues no período
```

---

## 14. Critérios de aceite do MVP

### Autenticação e permissões

- Usuário autorizado consegue entrar.
- Usuário sem permissão não acessa dados restritos.
- Logout encerra a sessão.
- Alterações de permissão são auditadas.

### Leads

- Usuário consegue criar lead manualmente.
- Usuário consegue importar leads por CSV com validação.
- Sistema identifica possíveis duplicados.
- Lead possui responsável e próximo passo.
- Lead pode ser convertido em oportunidade.
- Lead bloqueado não pode ser contatado por automação.

### Pipeline

- Oportunidade pode ser criada e movida entre etapas.
- Mudanças ficam registradas na timeline.
- Proposta é obrigatória antes da etapa de proposta enviada.
- Motivo é obrigatório ao perder.
- Valor do pipeline é atualizado automaticamente.

### Reuniões

- Usuário consegue agendar análise.
- Reunião aparece na agenda.
- Resultado pode ser registrado.
- Próximo passo é solicitado após conclusão.

### Propostas

- Usuário consegue gerar proposta a partir de modelo.
- Valores podem ser alterados conforme permissão.
- Proposta pode ser enviada e ter status atualizado.
- Versões anteriores permanecem preservadas.

### Projetos

- Venda ganha pode gerar projeto.
- Template cria etapas e tarefas.
- Tarefa possui responsável e prazo.
- Tarefa pode ficar aguardando cliente.
- Projeto mostra progresso e risco.

### Recorrência

- Contrato ativo gera ciclo.
- Ciclo registra quantidade contratada.
- Entregas consumidas são contabilizadas.
- Aprovação altera status da entrega.
- Renovação próxima aparece no dashboard.

### Auditoria

- Alterações importantes possuem usuário e data.
- Exclusões lógicas preservam histórico.
- Exportações são registradas.

---

## 15. Plano de implementação

### Sprint 0 — preparação

- Confirmar stack.
- Confirmar banco.
- Configurar ambientes.
- Criar variáveis de ambiente.
- Definir identidade visual do VIBE OS.
- Criar modelo inicial de permissões.
- Configurar migrations.
- Definir estratégia de backup.

### Sprint 1 — base do sistema

- Autenticação.
- Usuários.
- Empresas.
- Contatos.
- Segmentos.
- Tags.
- Auditoria básica.

### Sprint 2 — prospecção e leads

- Lista outbound.
- Cadastro de diagnóstico.
- Importação CSV.
- Filtros.
- Duplicidade.
- Tarefas de primeiro contato.
- Links de WhatsApp e e-mail.

### Sprint 3 — pipeline comercial

- Etapas.
- Kanban.
- Oportunidades.
- Atividades.
- Próximo passo.
- Agenda.
- Resultado da análise.

### Sprint 4 — propostas e conversão

- Modelos de oferta.
- Propostas.
- Versões.
- Status.
- Conversão para cliente.
- Contratos básicos.

### Sprint 5 — projetos

- Templates.
- Etapas.
- Tarefas.
- Prazos.
- Bloqueios.
- Aprovações.
- Arquivos.

### Sprint 6 — recorrência e dashboards

- Ciclos mensais.
- Entregas.
- Contadores.
- Renovações.
- Receita recorrente.
- Relatórios.

### Sprint 7 — integrações

- Formulário do site.
- E-mail transacional.
- Google Calendar.
- Webhooks n8n.
- Enriquecimento externo, se credenciais e contratos estiverem disponíveis.

### Sprint 8 — qualidade e lançamento

- Testes automatizados.
- Teste de permissões.
- Teste de carga básico.
- Revisão de LGPD.
- Backup e restauração.
- Monitoramento.
- Treinamento da equipe.
- Migração dos dados atuais.

---

## 16. Dados iniciais e migração

A lista atual de prospecção deve ser importada somente depois de uma limpeza mínima.

### Colunas mínimas para CSV

```text
company_name
trade_name
segment
subsegment
neighborhood
city
state
website
instagram_url
contact_name
contact_role
email
phone
whatsapp
source
data_collected_at
urgency
main_diagnosis
owner_email
```

### Regras de importação

- Validar cabeçalhos.
- Normalizar telefones.
- Normalizar domínios.
- Remover duplicidades.
- Marcar dados não validados.
- Nunca sobrescrever um contato existente sem registrar a origem da alteração.
- Gerar relatório de linhas importadas, ignoradas e com erro.

---

## 17. Requisitos para IA — fase posterior

A IA pode apoiar o time, mas não deve agir sem controle.

### Casos de uso recomendados

- Resumir reunião.
- Sugerir classificação de segmento.
- Identificar problema principal a partir do diagnóstico.
- Sugerir próximo passo.
- Gerar rascunho de e-mail personalizado.
- Resumir histórico da empresa.
- Sugerir oferta compatível.
- Detectar oportunidade parada.
- Classificar risco de projeto.

### Regras

- Toda saída de IA deve ser marcada como sugestão.
- Usuário deve revisar antes de enviar externamente.
- Dados sensíveis não devem ser enviados a provedores sem avaliação contratual e de privacidade.
- Promessas comerciais e afirmações de conformidade exigem revisão humana.
- O sistema deve registrar que uma sugestão foi gerada por IA quando isso for relevante.

---

## 18. Decisões de produto ainda necessárias

Antes do desenvolvimento definitivo, o responsável pelo produto deve confirmar:

1. Quantos usuários utilizarão o sistema no primeiro lançamento?
2. O sistema será apenas interno ou terá portal para clientes?
3. A equipe fará registro manual das conversas do WhatsApp no MVP?
4. A agenda principal será Google Calendar?
5. O CRM precisa gerar PDF de proposta ou apenas página compartilhável?
6. Haverá assinatura eletrônica?
7. O controle de pagamento será manual ou integrado?
8. O plano mensal terá 5 e 12 artes como ofertas separadas?
9. O SLA de 7 dias será global ou configurável por oferta?
10. Quais dados existentes serão migrados?
11. Quais integrações externas já possuem credenciais e autorização de uso?
12. Qual usuário será administrador inicial?

---

## 19. Definição de pronto

Uma funcionalidade só deve ser considerada pronta quando:

- Existe interface funcional.
- Existe validação no backend.
- Existe controle de permissão.
- Existe estado de carregamento.
- Existe tratamento de erro.
- Existe estado vazio.
- A operação fica registrada quando necessário.
- Há teste do fluxo principal.
- A documentação de uso está atualizada.
- A funcionalidade funciona em tela móvel e desktop.

---

## 20. Resultado esperado

Ao final do MVP, a VIBE deve conseguir operar o processo completo sem planilhas paralelas:

```text
1. Importar ou cadastrar uma empresa.
2. Registrar diagnóstico e decisor.
3. Criar tarefa de contato.
4. Registrar resposta.
5. Qualificar oportunidade.
6. Agendar análise.
7. Criar e acompanhar proposta.
8. Marcar venda como ganha.
9. Criar cliente, contrato e projeto.
10. Executar tarefas e entregas.
11. Obter aprovação.
12. Controlar mensalidade e ciclo.
13. Acompanhar renovação e upsell.
```

O indicador de sucesso do produto não é apenas o número de leads cadastrados. É a capacidade de transformar prospecção em receita e receita em entrega organizada.

> **VIBE OS = Prospecção + CRM + Projetos + Recorrência + Inteligência operacional.**

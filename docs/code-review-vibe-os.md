# Code review do VIBE OS: funcionalidades, telas e fluxo comercial

## O que este repositório faz
O VIBE OS reúne prospecção, CRM comercial, propostas e operação de projetos. A aplicação é Next.js com Prisma/PostgreSQL, mas grande parte das telas persiste registros somente no navegador.

**Veredito:** não está pronto para operar como CRM comercial confiável com dados reais. A prioridade é autenticação, integridade/persistência e ligação entre as etapas comerciais — não acabamento visual.

**Escopo:** checkout local `D:/vibe-os`, HEAD `3c1f1e5`, incluindo alterações locais preexistentes. Foram mapeadas 19 entradas de página e 7 handlers de API; revisão aprofundada dos fluxos críticos e amostragem dos demais módulos. Não equivale a leitura linha a linha de todos os arquivos nem a teste visual completo das telas.

**Carga assumida:** uma equipe pequena da VIBE com perfis diferentes e mais de um dispositivo. Os problemas de falso salvamento, importação e geração já afetam um único usuário.

## Verificação executada

| Verificação | Resultado e limite |
|---|---|
| `npx tsc --noEmit` | Passou. Isso verifica tipos, não persistência ou integração comercial. |
| `npm run build` | Passou: compilação, verificação de tipos e geração das páginas concluídas. |
| `node --test tests/hermes-proposal-briefing.test.cjs` | 4 testes executados, 0 passaram, 4 falharam. |
| POST do handler de importação em memória, com código real e dados sintéticos | CSV com cabeçalho do exportador retornou 200 e nome `Sem nome`; XLSX com cabeçalhos equivalentes aos do exportador retornou 400; telefone novo retornou `newCount: 0`. |
| Busca de referências em app/lib/components/tests/types | Não encontrou ligação da tela ativa com `gerador-propostas`, `/api/prospeccao/enrich`, `/api/prospeccao/serper` ou `enrichLeadData`. |
| Gravação e exploração em produção | Não executadas. Nenhum cookie inventado foi usado nesta revisão. |

As reproduções de importação chamaram o handler diretamente, sem servidor HTTP ou autenticação. Não provaram funcionamento do fluxo autenticado. As demais conclusões abaixo são de leitura do código, salvo indicação explícita.

## Correções obrigatórias

### 1. Crítico — autenticação e permissões não têm fronteira confiável no servidor
- **O que é:** login e controle de acesso de páginas/APIs.
- **Problema:** o cliente importa credenciais fixas, valida senhas e restaura identidade/papel do localStorage. O middleware verifica apenas presença de cookie, sem validar assinatura ou sessão. O acesso público aceita aliases como alternativa às chaves. Não há autorização por perfil nos handlers de leads. Não foi feita exploração em produção.
- **Evidência:** `lib/auth-context.tsx:83–130,135–169`; `middleware.ts:8–35`; `app/api/auth/access/route.ts:13–45`; `lib/auth-constants.ts:19–125`; `app/api/leads/route.ts:5–20,33–70`.
- **Correção mínima:** autenticação server-side, sessão revogável e cookie HttpOnly/Secure; autorizar cada API a partir da sessão. Remover aliases/credenciais do bundle e rotacionar os valores existentes. Definir explicitamente o compartilhamento dentro da equipe; organizações separadas só se isso fizer parte do produto.
- **Se ficar:** acesso e permissões não comprovam identidade. Não tratar ocultar botões como segurança.

### 2. Alto — webhook de leads não autentica a origem
- **O que é:** entrada pública de contatos externos.
- **Problema:** `/api/webhook/lead` é excluído do middleware e grava sem assinatura de origem, proteção contra repetição ou limite explícito no handler. Payload aceito pode criar dados arbitrários no CRM.
- **Evidência:** `middleware.ts:8–16`; `app/api/webhook/lead/route.ts:8–10,65–85`.
- **Correção mínima:** autenticar o provedor, validar esquema/tamanho, usar assinatura com janela temporal e chave de idempotência; limitar requisições.
- **Se ficar:** spam, duplicação e poluição do banco. Controles externos da hospedagem não foram examinados.

### 3. Alto — enriquecimento aceita destinos de rede arbitrários
- **O que é:** servidor busca conteúdo do site informado pelo cliente.
- **Problema:** a URL chega a `fetch` sem bloquear redes privadas, loopback ou redirects para esses destinos. Isso cria superfície de SSRF: o usuário induz o servidor a buscar um endereço que não deveria.
- **Evidência:** `app/api/prospeccao/enrich/route.ts:5–23,33–74`.
- **Correção mínima:** permitir HTTP(S) público, validar DNS/IP e cada redirect, bloquear redes internas e limitar bytes/tempo. Exigir autorização antes de buscar.
- **Se ficar:** o servidor pode acessar serviços internos. Achado estático; nenhuma rede interna foi acessada nesta revisão. A rota não está ligada à tela ativa, mas continua existindo como endpoint.

### 4. Alto — armazenamento local pode apagar dados e não separa contas
- **O que é:** helper compartilhado das telas de CRM.
- **Problema:** sem a marca `vibe_mock_cleaned_v2`, uma leitura remove chaves comerciais inteiras sem distinguir mocks de registros reais. As chaves são globais ao perfil do navegador, e logout não remove esses dados. Erro de gravação é apenas registrado no console.
- **Evidência:** `lib/crm-store.ts:24–62`; `lib/auth-context.tsx:172–179`.
- **Correção mínima:** eliminar limpeza destrutiva automática; criar migração explícita com backup. Persistir no servidor e manter apenas cache identificado por conta; propagar falhas de escrita.
- **Se ficar:** dados podem desaparecer ao abrir a aplicação, não sincronizam entre dispositivos e podem permanecer visíveis para outra conta no mesmo navegador.

### 5. Alto — salvar na prospecção não cria o card prometido no Pipeline
- **O que é:** conversão de contato em oportunidade comercial.
- **Problema:** a tela chama `/api/leads`, que cria Lead. O Kanban lê somente oportunidades em `vibe_opps`. Não há conversão/sincronização nesse caminho, mesmo se o banco funcionar.
- **Evidência:** `app/prospeccao/page.tsx:462–482`; `app/api/leads/route.ts:55–72`; `app/pipeline/page.tsx:24–28,98–123`.
- **Correção mínima:** usar fonte persistente comum, vinculando lead, empresa e oportunidade por ID. Fazer conversão transacional e idempotente; o Pipeline deve ler a oportunidade gravada.
- **Se ficar:** o contato não aparece no Kanban, exatamente como no relato do usuário.

### 6. Alto — falhas de gravação são anunciadas como sucesso
- **O que é:** confirmação de salvamento individual, em lote e por webhook.
- **Problema:** erro Prisma retorna um registro simulado com HTTP 201; o webhook também confirma sem gravar. O lote não verifica resposta HTTP e marca todos os IDs como salvos. Categoria livre, como `Personal trainer`, vira `PERSONAL TRAINER`, mas o enum exige `PERSONAL_TRAINER`.
- **Evidência:** `app/api/leads/route.ts:55–93`; `app/api/webhook/lead/route.ts:86–98`; `app/prospeccao/page.tsx:469–482,501–525`; `prisma/schema.prisma:30–37`.
- **Correção mínima:** retirar sucesso simulado; mapear/validar enums; responder erro não-2xx sem persistência. Marcar apenas IDs confirmados e deixar falhas disponíveis para nova tentativa.
- **Se ficar:** o usuário perde leads acreditando que foram salvos. Não foi consultado o registro específico do contato em produção.

### 7. Alto — exportação e importação discordam sobre os cabeçalhos
- **O que é:** reutilização de listas exportadas pelo próprio VIBE OS.
- **Problema:** o exportador usa `Nome da Empresa` e `Telefone / WhatsApp`; o importador não reconhece esses aliases. A deduplicação compara telefones do lote contra o próprio lote, classificando telefones novos como existentes. Importar o arquivo apenas devolve prévia, sem persistência.
- **Evidência:** `app/prospeccao/page.tsx:240–287`; `app/api/leads/import/route.ts:45–57,96–109,214–249`.
- **Reproduzido:** CSV com nome de empresa retornou `Sem nome`; XLSX com os cabeçalhos do exportador retornou 400; telefone sintético novo produziu `newCount: 0`.
- **Correção mínima:** contrato único e aliases compartilhados entre export/import, teste de ida e volta e deduplicação por armazenamento real/lote. Distinguir pré-visualização de gravação concluída.
- **Se ficar:** perde-se a identidade do cliente antes de iniciar a análise e o texto de sucesso informa contagens erradas.

### 8. Alto — análise de leads não sustenta as propostas com evidências
- **O que é:** diagnóstico digital que deveria orientar oferta, prioridade e escopo.
- **Problema:** a tela ativa chama Prospecteezy, mas não aciona os caminhos de enriquecimento existentes. Ao salvar, diagnóstico vira somente presença/ausência de URL e valor estimado fixo. Na rota alternativa, scores usam `Math.random()` e o texto afirma perda de conversões sem medição. Enriquecimento retorna `isResponsive: true` sem testar responsividade.
- **Evidência:** `app/prospeccao/page.tsx:105–108,473–476,511–514`; `app/api/prospeccao/serper/route.ts:39–80`; `app/api/prospeccao/enrich/route.ts:66–74`; busca de referências sem callers ativos desses caminhos.
- **Correção mínima:** integrar uma análise por lead, salvar observações com URL, data e método, separar medição de hipótese e deixar métricas indisponíveis como desconhecidas. Remover scores aleatórios e percentuais comerciais sem fonte.
- **Se ficar:** a proposta pode apresentar hipótese como auditoria e recomendar o mesmo investimento sem conhecer a empresa. Scores da rota alternativa são risco latente, não informação comprovadamente exibida pela tela ativa.

### 9. Alto — gerador por lead existe, mas não está integrado à interface
- **O que é:** geração dos serviços site, landing page, automação e redes sociais.
- **Problema:** `gerador-propostas.ts` não tem consumidor encontrado no código da aplicação. A tela Propostas mantém outro catálogo e outro fluxo. O helper recebe um tipo de serviço por chamada; sua existência não comprova entrega das propostas separadas por cliente pela UI.
- **Evidência:** `lib/gerador-propostas.ts:119–184`; busca dos imports/exports em app/lib/components/tests/types; `app/propostas/page.tsx:165–225,261–268`.
- **Correção mínima:** unificar catálogo/modelo e conectar seleção de leads → diagnóstico → recomendação → rascunhos revisáveis → exportação individual por cliente. No helper, separar setup, recorrência e custo por prazo; o resumo só lê valores do primeiro serviço e o total soma setup com uma recorrência.
- **Se ficar:** o principal resultado solicitado não está disponível no fluxo ativo; ligar o helper sem revisão financeira ainda produziria resumos ambíguos.

### 10. Alto — briefing para Hermes diverge da proposta salva
- **O que é:** exportação de condições comerciais para elaboração assistida.
- **Problema:** salvar com pagamento único zera a recorrência; exportar envia o valor residual como recorrência em pagamento único. O caller não fornece o lead opcional, deixando diagnóstico/redes vazios. O helper não valida cliente/números e interpola texto livre sem isolamento estruturado. A suíte espera um contrato JSON/validação que a implementação não cumpre.
- **Evidência:** `app/propostas/page.tsx:173,245–252`; `lib/hermes-proposal-briefing.ts:15–74`; `tests/hermes-proposal-briefing.test.cjs:16–55`.
- **Testado:** os quatro testes existentes falharam. Duas falhas são incompatibilidade de formato, uma é ausência da validação esperada e uma é falha de delimitação.
- **Correção mínima:** normalização de domínio compartilhada, vincular lead/reunião, validar valores e encapsular dados externos como conteúdo não confiável. Alinhar testes ao contrato aprovado, sem apagá-los apenas para obter verde.
- **Se ficar:** a IA pode elaborar condições diferentes das salvas. Não foi demonstrada execução de prompt injection.

### 11. Alto — proposta nasce enviada e o aceite não registra evidência
- **O que é:** ciclo rascunho → revisão → envio → aprovação.
- **Problema:** criar proposta define `ENVIADA`; copiar texto não comprova envio. O botão Aceite altera apenas status local, sem versão aceita, evidência, data ou bloqueio por vencimento.
- **Evidência:** `app/propostas/page.tsx:205–237,261–267,411–417,789–795`.
- **Correção mínima:** criar rascunho, exigir aprovação interna e condições confirmadas, registrar envio explicitamente e evidência de aceite vinculada à versão. Não precisa integrar Evolution API para isso.
- **Se ficar:** o funil e os documentos afirmam eventos que não aconteceram ou não podem ser comprovados.

### 12. Alto — contratos não herdam as condições vendidas
- **O que é:** criação de contrato após aprovação comercial.
- **Problema:** o formulário independente fixa setup em R$ 1.500, periodicidade mensal, vencimento dia 10, renovação em 365 dias e status ativo. Não converte a proposta aceita com seus termos.
- **Evidência:** `app/contratos/page.tsx:21–44`; `app/propostas/page.tsx:231–237`.
- **Correção mínima:** contrato vinculado à versão aceita, com valores, escopo, prazo, periodicidade e condições copiados sem reinvenção; ativação explícita.
- **Se ficar:** cobrança e operação podem divergir do que foi aprovado pelo cliente.

### 13. Alto — contato WhatsApp pode apontar para número incorreto
- **O que é:** abordagem e entrega de propostas.
- **Problema:** a prospecção sempre prefixa `55`, duplicando DDI já presente. Em Propostas não há campo para preencher `clientPhone` no formulário revisado; a ação ativa apenas copia texto, não entrega o pacote individual com link direto ao cliente. Clipboard não é aguardado e falhas não são tratadas.
- **Evidência:** `app/prospeccao/page.tsx:354–358,1040,1179`; `app/propostas/page.tsx:62,117,136,261–267,448–470`; busca de `setClientPhone` sem setter de input.
- **Correção mínima:** normalizador internacional único, contato editável e validado, texto por cliente e link `wa.me` com mensagem codificada. Aguardar clipboard antes do feedback.
- **Se ficar:** link inválido ou mensagem preparada sem destinatário; não foi realizado envio WhatsApp nesta revisão.

### 14. Alto — cadastro de empresa inventa contatos e vínculo por nome mistura registros
- **O que é:** identidade comercial usada nas próximas telas.
- **Problema:** empresa sem telefone recebe um número fixo e email fixo; o detalhe também tem telefone fallback. Registros relacionados são localizados inclusive por substring do nome, não apenas por ID.
- **Evidência:** `app/empresas/page.tsx:50–67`; `app/empresas/[id]/page.tsx:65–81,125–129`.
- **Caso:** cadastrar empresa sem WhatsApp preenche contato de outra origem. Nomes como `Alpha` e `Alpha Centro` podem compartilhar registros no detalhe por substring.
- **Correção mínima:** desconhecido deve permanecer vazio e desabilitar envio; usar relações por ID e revisar dados já contaminados antes de migrar.
- **Se ficar:** contato/proposta pode ser associado ou direcionado à empresa errada.

### 15. Alto — relatórios não refletem operação real
- **O que é:** indicadores para decisão comercial.
- **Problema:** Relatórios contém funil e KPIs escritos no código. Dashboard lê listas locais e usa nomes de etapas diferentes dos usados pelo Pipeline; uma oportunidade em `QUALIFICADO` não entra no filtro de qualificados do dashboard.
- **Evidência:** `app/relatorios/page.tsx:15–21,45–86`; `app/page.tsx:33–68`; `app/pipeline/page.tsx:51–57,102–115`.
- **Correção mínima:** remover números demonstrativos do modo operacional, centralizar etapas e calcular indicadores sobre a mesma fonte persistente, incluindo definição de período e exclusão de negócios encerrados quando apropriado.
- **Se ficar:** relatório pode apresentar contratos/receita inexistentes e discordar do Kanban.

## Correções importantes de funcionalidade e manutenção

### 16. Médio — Clientes, Tarefas e Entregas são silos sem fluxo de alimentação
- **O que é:** continuidade da venda até a operação.
- **Problema:** Clientes lê `vibe_clientes`, sem escritor encontrado. Tarefas lê `vibe_tarefas_ui`, mas Projetos salva tarefas dentro de `vibe_projects`. Entregas lê lista própria e seu botão de criação não tem ação; Nova Tarefa também não tem handler.
- **Evidência:** `app/clientes/page.tsx:33–38`; `app/tarefas/page.tsx:34–54,87–89`; `app/entregas/page.tsx:33–38,83–85`; `app/projetos/page.tsx:64–73`; busca global de referências dessas chaves.
- **Correção mínima:** entidades únicas e relações; alimentar clientes a partir do vínculo comercial aprovado; listar as mesmas tarefas dos projetos e implementar criação real de entregas.
- **Se ficar:** um projeto tem tarefas, mas a tela de tarefas continua vazia; cliente fechado não surge na carteira.

### 17. Médio — editar proposta renova sua validade sem decisão explícita
- **O que é:** manutenção de proposta já emitida.
- **Problema:** abrir edição define 14 dias e salvar recalcula validade a partir de agora, mesmo alterando apenas o nome.
- **Evidência:** `app/propostas/page.tsx:129–162,175–190`.
- **Correção mínima:** preservar validade e versão; oferecer renovação separada e auditável.
- **Se ficar:** proposta vencida pode voltar a valer com condições antigas sem autorização deliberada.

### 18. Médio — agenda não cria reunião real nem encaminha diagnóstico
- **O que é:** agendamento e registro da análise comercial.
- **Problema:** todo agendamento recebe a mesma URL fixa de Meet e responsável fixo. Salvar diagnóstico atualiza somente `vibe_meetings`; não vincula lead, oportunidade ou proposta.
- **Evidência:** `app/agenda/page.tsx:31–75`; `app/propostas/page.tsx:245–252`.
- **Correção mínima:** solicitar uma URL real ou criar reunião via integração; guardar responsável e vínculos por ID e reutilizar diagnóstico no rascunho.
- **Se ficar:** a interface promete uma chamada que não criou e exige redigitar o contexto comercial.

### 19. Médio — projetos e conformidade afirmam verificações não feitas
- **O que é:** progresso e checklist operacional.
- **Problema:** criar projeto já marca kickoff concluído, progresso e checklist de normas, independentemente de execução. Conformidade começa com identidade e dados sensíveis aprovados. Ao desmarcar tarefa de projeto concluído, o cálculo reduz progresso mas mantém status CONCLUIDO.
- **Evidência:** `app/projetos/page.tsx:48–68,79–97`; `app/projetos/[id]/page.tsx:57–76`; `app/conformidade/page.tsx:32–41`.
- **Correção mínima:** iniciar verificações como pendentes; derivar progresso das tarefas e definir transições coerentes para reabertura. Guardar quem verificou e quando.
- **Se ficar:** painel indica conclusão/conformidade que não corresponde ao trabalho real.

### 20. Médio — controles visuais anunciam comportamentos ausentes
- **O que é:** filtros, busca global e configurações.
- **Problema:** o filtro de nicho do Pipeline altera estado, mas não participa de `filteredOpps`; a busca global navega para `?search=`, mas Empresas não lê esse parâmetro. Configurações anuncia preços configuráveis, mas exibe textos fixos sem edição/salvamento.
- **Evidência:** `app/pipeline/page.tsx:30,130–137,188–197`; `components/Layout/Navbar.tsx:123–128`; `app/empresas/page.tsx:23–44`; `app/configuracoes/page.tsx:106–139`.
- **Correção mínima:** implementar cada controle e teste de comportamento ou remover a promessa até ficar pronto. Centralizar catálogo de ofertas em vez de replicar preços.
- **Se ficar:** usuário muda filtros/busca/configurações sem obter o resultado anunciado.

## Mapa de telas e continuidade

| Tela/área | Estado observado no código | Principal bloqueio |
|---|---|---|
| Login e acesso | Autenticação implementada predominantemente no cliente | Sessão e autorização server-side |
| Visão geral | Indicadores derivados de listas locais | Mesma fonte/etapas do Pipeline |
| Prospecção e alias Leads | Busca, seleção, exportação e prévia de importação | Identidade, persistência e conversão |
| Pipeline | Kanban de oportunidades locais | Não recebe o Lead salvo pela API |
| Agenda | Agendamento e diagnóstico locais | URL real e ligação à oportunidade |
| Empresas e detalhe | CRUD parcial local e relações por nome | IDs e contatos confirmados |
| Clientes | Leitura de coleção independente | Sem alimentação pelo fechamento |
| Propostas | Formulário manual, cópia WhatsApp e exportação de briefing | Diagnóstico vinculado, rascunho e entrega por cliente |
| Projetos e detalhe | Gestão local com tarefas embutidas | Integração ao contrato e à tela Tarefas |
| Tarefas | Lista local diferente da usada em Projetos | Criação e fonte única |
| Entregas | Lista isolada, ação de criar ausente | Criação, arquivos e aprovação real |
| Contratos | Cadastro independente com condições fixas | Conversão da proposta aprovada |
| Conformidade | Checklist local com aprovações predefinidas | Evidência e estado inicial pendente |
| Relatórios | Indicadores demonstrativos hardcoded | Métricas de registros reais |
| Configurações | Matriz e ofertas exibidas como texto | Controles reais, catálogo e autorização |

## Fluxo mínimo para atender o objetivo comercial

1. **Capturar/importar:** preservar nome, telefone internacional, categoria original, site e fonte; prévia e deduplicação antes da gravação.
2. **Persistir:** empresa/lead com IDs reais, idempotência e leitura de confirmação. Falha não pode virar sucesso.
3. **Converter:** criar oportunidade vinculada e exibi-la no Pipeline; nenhuma coleção paralela silenciosa.
4. **Analisar:** diagnóstico por empresa com evidências, lacunas e hipóteses identificadas; não fabricar SEO, tráfego ou conversão.
5. **Recomendar:** escolher site, LP, automação e/ou redes sociais pela necessidade observada; permitir serviços não recomendados e dados pendentes.
6. **Gerar rascunhos:** documento separado por cliente com contexto, problema, objetivo, entregas, exclusões, prazo, preço, condições e dependências. Valores não confirmados permanecem pendentes.
7. **Revisar:** aprovação humana/versionamento antes de habilitar texto comercial final e aceite.
8. **Entregar:** arquivo/link e mensagem separados por cliente, destinatário validado e botão `wa.me`; sem necessidade de Evolution API nesta fase.
9. **Registrar:** marcar envio de forma explícita e converter versão aceita para contrato/projeto sem reinventar condições.

## Ordem recomendada de correção

| Ordem | Entrega | Critério verificável |
|---|---|---|
| 1 | Segurança e proteção dos dados existentes | Sessão inválida negada; credenciais removidas/rotacionadas; migração não destrutiva |
| 2 | Persistência e conversão | Salvar → ler por ID → Pipeline → recarregar → segunda sessão autorizada vê o mesmo registro |
| 3 | Importação e identidade | Round-trip CSV/Excel/JSON preserva empresa/contato; duplicados não viram oportunidades repetidas |
| 4 | Diagnóstico e propostas | Lead selecionado gera rascunho com fontes e condições iguais às aprovadas no formulário |
| 5 | WhatsApp, aceite e contrato | Destinatário correto, pacote separado, status explícito e contrato idêntico à versão aceita |
| 6 | Operação e indicadores | Cliente/projeto/tarefa/entrega vinculados; dashboard e relatórios calculam os mesmos registros |

## Limpeza e redução de complexidade

- Unificar catálogos de oferta e regras de condições hoje duplicados em tela, helper e configurações.
- Remover respostas mock de produção e diagnósticos aleatórios; não eliminar dados históricos para remover mocks.
- Consolidar normalização de cabeçalhos, enums e telefone.
- Integrar ou retirar caminhos alternativos de análise e gerador sem consumidores; não contar arquivos isolados como funcionalidade entregue.
- Não estimei linhas/dependências removíveis: não foi feita medição de uma refatoração concreta.

## O que não foi testado

- Exploração de autenticação/SSRF, envio WhatsApp, gravação/deleção de contatos reais ou publicação em produção.
- Estado de banco, credenciais atuais, políticas externas da hospedagem e eventual RLS não foram validados.
- `.env.production` aparece como arquivo versionado, mas seu conteúdo não foi lido nesta revisão; isso não prova por si só quais valores contém. Auditar histórico de segredos em procedimento separado.
- Não houve sessão autenticada de navegador, teste responsivo, auditoria de acessibilidade ou comparação visual de todas as telas.
- Dependências não receberam auditoria de vulnerabilidades por advisory atualizado.
- A aprovação regulatória/jurídica das propostas não foi avaliada.

**Alterações desta revisão:** apenas este relatório documental; nenhuma correção funcional ou deploy. Build e testes geraram seus artefatos locais usuais. Achados referem-se ao código local examinado, não a uma comparação exata de todo o código publicado.

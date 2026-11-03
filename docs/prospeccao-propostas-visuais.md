# Prospecção, CRM e propostas visuais

## Fonte do código

O diretório de trabalho desta instalação é `D:\vibe-os`. Publicar um clone antigo pode remover funcionalidades locais ainda não sincronizadas. Antes de publicar, conferir o diretório, `git status`, testes e o projeto Vercel vinculado. Não publicar a cópia antiga em `C:\Users\danie\vibeos-repo`.

## Fluxo disponível

1. Em **Prospecção**, importar CSV, Excel ou JSON. A importação apenas pré-visualiza; não grava o CRM.
2. Selecionar os contatos e clicar em **Preparar propostas**.
3. O fluxo confirma lead, empresa e oportunidade pela API, lê o CRM, cria rascunhos vinculados aos IDs reais e confirma a gravação. Repetir a ação não duplica os pares lead/serviço nem sobrescreve edições existentes.
4. Consultar os conceitos visuais na própria prospecção ou abrir **Propostas**. O catálogo inclui site, landing page, automação, redes sociais e identidade visual.
5. Revisar textos, preços, escopo e condições; salvar e aprovar internamente. Só então copiar o texto, abrir o WhatsApp e baixar as imagens PNG.
6. Anexar as imagens à conversa. Abrir WhatsApp, baixar ou compartilhar arquivos não é comprovação de envio. O registro de envio e o aceite continuam explícitos e separados.

## Limites importantes

- A análise é local e baseada nos campos fornecidos; não é pesquisa de presença digital por IA nem verifica redes sociais, titularidade de logo ou existência de automação.
- Os SVGs são conceitos determinísticos. A conversão em PNG ocorre no navegador. Não afirmar que usam a logo real sem material fornecido e validado.
- Não há envio automático de mídia pelo Evolution API neste fluxo. Um link `wa.me` prepara o texto; não anexa imagens automaticamente.
- A persistência é via `/api/crm` com controle de versão e autorização. Não reintroduzir gravação em `localStorage` como fonte do Pipeline.
- Falhas parciais preservam contatos e propostas já confirmados. Conflitos de versão devem ser exibidos, nunca disfarçados como sucesso.
- Propostas são salvas sem os SVGs: a prévia é derivada dos campos do documento. O limite de coleção continua 1 MiB; se atingido, a API rejeita a gravação sem confirmar sucesso.

## Verificação

```sh
npm test
npm run build
node scripts/verify-crm-integration.cjs --isolated-db
```

O teste de integração cria um schema PostgreSQL aleatório `vibe_verify_*`, testa APIs reais com usuário sintético e remove somente esse schema no `finally`. Não usar contas nem contatos reais para os testes.

Para testar o navegador, instalar Playwright fora do repositório e definir `QA_PLAYWRIGHT_MODULE` para o módulo instalado, além de `QA_ARTIFACT_DIR` para uma pasta externa. Executar:

```sh
node scripts/verify-crm-integration.cjs --isolated-db --browser
```

Esse teste usa Chrome headless, importa um CSV, prepara e relê propostas, verifica o Pipeline, baixa PNG, testa mobile e bloqueia tráfego externo. Não envia mensagem a nenhum contato.

## Segurança

Nunca commitar `.env*` reais, cookies, tokens ou evidências com dados de clientes. A remoção de `.env.production` do estado atual **não remove o segredo do histórico antigo**: a credencial anteriormente publicada precisa ser rotacionada pelo responsável pelo banco. Não reescrever histórico nem rotacionar acesso silenciosamente durante um deploy de UI.

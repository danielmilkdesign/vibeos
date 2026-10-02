---
name: google-stitch
description: >-
  Guia de uso do Google Stitch AI (Google Labs), Stitch MCP e CLI no VIBE OS.
  Utilize quando o usuário pedir para gerar designs, importar telas do Stitch,
  converter HTML/CSS do Stitch para componentes Next.js ou rodar comandos da CLI.
---

# Google Stitch — Integração MCP & CLI no VIBE OS

O **Google Stitch** é uma ferramenta de design com IA desenvolvida pelo Google Labs que gera interfaces e código frontend a partir de prompts e referências visuais.

No **VIBE OS**, o Stitch está integrado via **CLI** e **MCP (Model Context Protocol)** através do pacote `@_davideast/stitch-mcp`.

---

## 1. Verificação de Saúde (Doctor)

Para verificar o status da chave de API e a conectividade com a API do Stitch:

```bash
npm run stitch:doctor
```
Ou via npx:
```bash
npx @_davideast/stitch-mcp doctor
```

---

## 2. Comandos da CLI (Scripts npm)

Os seguintes atalhos estão disponíveis no `package.json`:

| Comando | Descrição |
| :--- | :--- |
| `npm run stitch:doctor` | Valida credenciais e conectividade com a API do Stitch |
| `npm run stitch:screens` | Lista todas as telas geradas no projeto ativo |
| `npm run stitch:serve` | Inicia servidor local para pré-visualizar as telas do Stitch |
| `npm run stitch:proxy` | Inicia o servidor MCP em modo proxy stdio |
| `npx stitch-mcp upload <file>` | Faz upload de um asset ou tela para o projeto Stitch |

---

## 3. Servidor MCP (Model Context Protocol)

O servidor MCP está configurado em:
* [`.agents/mcp_config.json`](file:///d:/vibe-os/.agents/mcp_config.json) (Nativo do Antigravity/AGY)
* [`mcp_config.json`](file:///d:/vibe-os/mcp_config.json) (Raiz do projeto)
* [`.cursor/mcp.json`](file:///d:/vibe-os/.cursor/mcp.json) (Cursor IDE)

Configuração:
```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "@_davideast/stitch-mcp", "proxy"]
    }
  }
}
```

### Ferramentas expostas pelo Stitch MCP:
* `list_projects`: Lista todos os projetos disponíveis no Stitch.
* `get_project`: Obtém detalhes e configurações de um projeto.
* `get_screen`: Retorna a estrutura, metadados e árvore de componentes de uma tela.
* `get_screen_code`: Extrai o HTML e CSS gerados para uma tela.
* `build_site`: Mapeia e constrói telas estruturadas em rotas locais.
* `snapshot`: Gera snapshots de interface para diferentes estados de dados.

---

## 4. Fluxo de Design-to-Code no VIBE OS

1. **Geração no Stitch**: Crie a tela ou esteira visual no Stitch com os requisitos da VIBE (ex: landing page de alta conversão, SLA 7 dias, paleta dark/cyan).
2. **Extração via CLI/MCP**: O agente ou desenvolvedor executa `get_screen_code` ou `npm run stitch:screens`.
3. **Conversão para Next.js & Tailwind**: O HTML/CSS é convertido para componentes React em `app/` ou `components/`, mantendo os tokens de design do VIBE OS.

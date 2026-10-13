# VIBE OS

**Sistema comercial e operacional da VIBE Design Tech.**

O VIBE OS conecta o fluxo da empresa de ponta a ponta: prospecção, qualificação,
análise comercial, proposta, negociação, projeto, entregas, contratos e
recorrência. O objetivo é manter contexto, responsável e próximo passo visíveis
em cada etapa.

> **Uso interno.** A aplicação trata dados comerciais e o acesso é restrito a
> usuários autorizados da VIBE Design Tech.

## O que o sistema organiza

- **Prospecção outbound:** empresas, contatos, diagnóstico, urgência e origem.
- **Pipeline comercial:** oportunidades, valores, probabilidade, follow-ups e
  reuniões.
- **Propostas:** escopo, setup, recorrência, validade e histórico de versões.
- **Projetos e entregas:** responsáveis, prazos, riscos, aprovações e bloqueios.
- **Contratos e recorrência:** MRR, ciclos de entrega, renovações e oportunidades
  de expansão.
- **Conformidade:** checklists operacionais para segmentos regulados; não substitui
  revisão jurídica especializada.

## Fluxo principal

```text
Empresa mapeada
  → Lead qualificado
  → Contato realizado
  → Análise
  → Proposta
  → Negociação
  → Cliente ganho
  → Projeto
  → Entrega e aprovação
  → Contrato recorrente
  → Renovação ou upsell
```

## Stack

- Next.js 14 + React 18 + TypeScript
- Tailwind CSS
- Prisma + Neon/PostgreSQL
- `lucide-react`

## Rotas importantes

| Rota | Finalidade |
| --- | --- |
| `/sobre` | Página pública de posicionamento do produto |
| `/login` | Entrada restrita ao sistema |
| `/` | Dashboard operacional autenticado |
| `/prospeccao` | Prospecção outbound |
| `/pipeline` | Pipeline comercial |
| `/agenda` | Agenda de análises e reuniões |
| `/propostas` | Propostas comerciais |
| `/projetos` | Operação e entregas |
| `/contratos` | Contratos e recorrência |

## Desenvolvimento local

### Pré-requisitos

- Node.js compatível com Next.js 14
- Banco PostgreSQL/Neon configurado para os fluxos que dependem de persistência
- Variáveis de ambiente definidas localmente; não envie segredos para o Git

### Instalação

```bash
npm install
```

### Banco e aplicação

```bash
npm run db:generate
npm run dev
```

O servidor de desenvolvimento inicia na porta `3001`.

### Verificações

```bash
npm run build
```

O build executa `prisma generate` antes de compilar a aplicação.

## Princípios do produto

1. Toda oportunidade aberta precisa ter um próximo passo e uma data.
2. Empresa, contato, oportunidade, projeto e contrato compartilham o mesmo
   contexto.
3. Vendas e operações devem se conectar sem redigitação.
4. Automações sugerem e lembram; ações externas de alto impacto permanecem sob
   supervisão humana.
5. Configurações comerciais devem estar no sistema, não codificadas em telas.

## Documentação de produto

- [Especificação de produto](./VIBE%20OS%20CRM.md)
- [Especificação de frontend](./VIBE%20OS%20CRM%20front.md)

## Estado atual

A aplicação contém fluxos e dados demonstrativos em áreas do frontend. Antes de
uso em produção, valide autenticação e autorização no servidor, persistência,
tratamento de erro, LGPD, logs de auditoria e integrações externas.

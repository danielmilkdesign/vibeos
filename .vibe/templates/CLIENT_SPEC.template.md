# CLIENT_SPEC: [Nome do Cliente / Projeto / Demanda]

## 📋 1. Visão Geral da Demanda
- **Cliente:** [Nome do Cliente]
- **Objetivo do Projeto:** [Descrição sucinta]
- **Requisitos de Negócio:** [Resultados esperados / KPIs]
- **Prazo / Sprint:** [Data de Entrega]

## 🛠️ 2. Mapeamento de Requisitos e Reuso do VibeOS
- **Componentes Reutilizados do VibeOS Core:** [ex: VibeButton, VibeModal, AuthFlow]
- **Telas / Módulos Customizados a Desenvolver:** [ex: CustomDashboard, StripeCheckout]
- **Integrações de APIs de Terceiros:** [ex: Stripe API, WhatsApp Webhook]

## 🎨 3. Especificação de UI & Branding do Cliente
- **Tokens/Cores Específicas do Cliente:** [Primary, Secondary, Dark Mode]
- **Layout / Protótipo Figma:** [Link Figma ou referência visual]
- **Acessibilidade:** Suporte obrigatório a `:focus-visible` e WCAG 2.1 AA.

## 📝 4. Critérios de Aceite para Homologação
- [ ] 1. Fluxos principais funcionais sem erros de console.
- [ ] 2. Compilação TypeScript (`npm run build`) sem avisos ou erros.
- [ ] 3. Responsividade validada em Mobile (375px), Tablet (768px) e Desktop (1440px).
- [ ] 4. Staging deploy gerado e aprovado no ambiente de preview Vercel.

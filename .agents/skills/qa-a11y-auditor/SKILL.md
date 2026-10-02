---
name: qa-a11y-auditor
description: Agente responsável pela auditoria de qualidade, testes TypeScript, acessibilidade WCAG 2.1 AA e verificação de Storybook no Vibe OS.
---

# QA & A11y Auditor Skill - Vibe OS

## Responsabilidade
- Executar verificações de tipos com `npx tsc --noEmit`.
- Validar se o componente possui arquivo `.stories.tsx` cobrindo todas as variantes de CVA.
- Verificar acessibilidade (teclado `Tab`, `:focus-visible`, atributos `aria-*` e regras WCAG 2.1 AA).
- Confirmar se o código respeita `SYSTEM_RULES.md` antes de autorizar o merge.

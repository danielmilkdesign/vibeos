# 📑 TASKS: [Nome do Componente]

- [ ] **Task 1: Definir Interfaces e Variantes CVA**
  - Criar `Component.types.ts`
  - Configurar todas as variantes solicitadas na `DESIGN_SPEC.md`
- [ ] **Task 2: Construir Estrutura Semântica do Componente**
  - Criar `Component.tsx` com `React.forwardRef`
  - Aplicar utilitário `cn()` para fusão de classes Tailwind
- [ ] **Task 3: Implementar Acessibilidade e Estados Interativos**
  - Adicionar marcação ARIA e suporte a `:focus-visible`
  - Validar navegação por teclado (`Tab`, `Enter`, `Space`)
- [ ] **Task 4: Criar Cobertura no Storybook**
  - Criar `Component.stories.tsx` cobrindo todas as variantes
- [ ] **Task 5: Validação Final e QA Audit**
  - Rodar `npx tsc --noEmit`
  - Solicitar auditoria do agente `qa-a11y-auditor`

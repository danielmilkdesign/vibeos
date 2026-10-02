# DIRECTIVAS INEGOCIÁVEIS DE DESIGN ENGINEERING - VIBE OS

## 🧠 CAMADA 1: SEGUNDO CÉREBRO & MEMÓRIA PERSISTENTE
- **Consultar o Cérebro Antes de Codificar:** Agentes de IA devem ler o Índice Mestre em [00_INDEX.md](file:///D:/vibe-os/.vibe/brain/00_INDEX.md) para recuperar regras de arquitetura, esquemas de banco e design tokens antes de iniciar qualquer tarefa.
- **Isolamento de Memória por Track:**
  - **VibeOS Core Squad:** Consome e atualiza `01_ARCHITECTURE/`, `02_DESIGN_SYSTEM/` e `03_PRODUCT_KNOWLEDGE/`.
  - **Client Solutions Squad:** Consome `04_CLIENTS_REGISTRY/` e segue o contrato [CLIENT_SPEC.template.md](file:///D:/vibe-os/.vibe/templates/CLIENT_SPEC.template.md).

---

## 🎨 CAMADA 2: REGRAS DE UI & DESIGN SYSTEM

1. **ZERO MAGIC NUMBERS & ZERO HARDCODED COLORS**
   - É estritamente proibido utilizar px, rem ou cores hexadecimais diretas no código React/UI.
   - Utilize SEMPRE classes do Tailwind configuradas com os tokens do Design System ou variáveis CSS (`var(--color-primary-500)`).

2. **GERENCIAMENTO DE VARIANTES VIA CVA (Class Variance Authority)**
   - Todos os componentes flexíveis de UI devem utilizar CVA para tipar e estruturar `variant`, `size`, `disabled`, `fullWidth`, etc.

3. **ACESSIBILIDADE WCAG 2.1 AA OBRIGATÓRIA**
   - Todos os elementos interativos DEVEM possuir feedback visual claro de foco via teclado (`focus-visible:ring-2 focus-visible:ring-offset-2`).
   - Adicione rótulos semânticos ARIA (`aria-label`, `aria-expanded`, `aria-describedby`, `role`) em todos os botões de ícone, modais e controles.

4. **COBERTURA DE TESTES VISUAIS & STORYBOOK**
   - Nenhum componente é considerado "pronto" sem a criação do seu arquivo `.stories.tsx` correspondente, cobrindo todas as combinações de variantes.

5. **SEPARAÇÃO ESTRUTURAL DE ARQUIVOS**
   - Componentes devem seguir a estrutura:
     - `Component.tsx` (Lógica e renderização)
     - `Component.types.ts` (Interfaces TypeScript & CVA Variants)
     - `Component.stories.tsx` (Casos de uso no Storybook)
     - `Component.test.tsx` (Testes unitários/a11y)

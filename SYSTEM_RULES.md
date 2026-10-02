# DIRECTIVAS INEGOCIÁVEIS DE DESIGN ENGINEERING - VIBE OS

1. ZERO MAGIC NUMBERS & ZERO HARDCODED COLORS
   - É estritamente proibido utilizar px, rem ou cores hexadecimais diretas no código React/UI.
   - Utilize SEMPRE classes do Tailwind configuradas com os tokens do Design System ou variáveis CSS (`var(--color-primary-500)`).

2. GERENCIAMENTO DE VARIANTES VIA CVA (Class Variance Authority)
   - Todos os componentes flexíveis de UI devem utilizar CVA para tipar e estruturar `variant`, `size`, `disabled`, `fullWidth`, etc.

3. ACESSIBILIDADE WCAG 2.1 AA OBRIGATÓRIA
   - Todos os elementos interativos DEVEM possuir feedback visual claro de foco via teclado (`focus-visible:ring-2 focus-visible:ring-offset-2`).
   - Adicione rótulos semânticos ARIA (`aria-label`, `aria-expanded`, `aria-describedby`, `role`) em todos os botões de ícone, modais e controles.

4. COBERTURA DE TESTES VISUAIS & STORYBOOK
   - Nenhum componente é considerado "pronto" sem a criação do seu arquivo `.stories.tsx` correspondente, cobrindo todas as combinações de variantes.

5. SEPARAÇÃO ESTRUTURAL DE ARQUIVOS
   - Componentes devem seguir a estrutura:
     - `Component.tsx` (Lógica e renderização)
     - `Component.types.ts` (Interfaces TypeScript & CVA Variants)
     - `Component.stories.tsx` (Casos de uso no Storybook)
     - `Component.test.tsx` (Testes unitários/a11y)

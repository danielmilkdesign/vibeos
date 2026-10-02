# 📐 DESIGN SPECIFICATION: [Nome do Componente/Tela]

## 1. Visão Geral & Casos de Uso
- **Objetivo:** [Descrição clara do propósito do componente]
- **Contexto de Uso:** [Onde será aplicado no Vibe OS]

## 2. Variantes & Propriedades (CVA)
- **`variant`**: `primary` | `secondary` | `outline` | `ghost` | `danger`
- **`size`**: `sm` | `md` | `lg`
- **`disabled`**: `boolean`
- **`isLoading`**: `boolean`

## 3. Mapeamento de Tokens
- **Fundo:** `bg-surface-base` (Hover: `bg-surface-subtle`)
- **Texto:** `text-text-main`
- **Borda/Anel de Foco:** `ring-brand-primary`
- **Raio de Borda:** `rounded-md`

## 4. Requisitos de Acessibilidade (a11y)
- [ ] Atributo `role="button"` (se não for elemento nativo `<button>`).
- [ ] `aria-disabled="true"` quando desabilitado.
- [ ] Foco visível com suporte a navegação por tecla `Tab` (`focus-visible:outline-none focus-visible:ring-2`).
- [ ] Atributo `aria-busy="true"` durante estado de carregamento.

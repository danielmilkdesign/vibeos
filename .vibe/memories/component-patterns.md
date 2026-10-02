# PATRÕES DE COMPONENTES DO VIBE OS

## 1. Padrão CVA (Class Variance Authority)
Todo componente interativo flexível deve utilizar CVA em um arquivo `.types.ts`.

Exemplo:
```ts
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500',
        secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:ring-slate-400',
        outline: 'border border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 focus-visible:ring-slate-400',
        ghost: 'bg-transparent text-slate-100 hover:bg-slate-800 focus-visible:ring-slate-400',
        danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

## 2. Padrão de Renderização React (`Component.tsx`)
- Sempre utilizar `React.forwardRef` quando aplicável.
- Utilizar a função utilitária `cn()` para mesclagem de classes do Tailwind.
- Suportar estados de carregamento e desabilitado com acessibilidade adequada.

# Diagnóstico: contato salvo na prospecção não aparece no pipeline

## Veredito
O caminho de gravação da prospecção e o caminho de leitura do pipeline estão desconectados. A interface também pode anunciar sucesso quando a gravação no banco falha.

## Evidências verificadas no código

| Prioridade | Achado | Evidência | Correção necessária |
|---|---|---|---|
| P0 | Sucesso simulado após erro de banco, sem persistência | app/api/leads/route.ts:73–93 cria mockLead e retorna HTTP 201 | Remover fallback de escrita; retornar erro real e só anunciar sucesso após persistência |
| P0 | Pipeline lê exclusivamente oportunidades do localStorage | app/pipeline/page.tsx:16–28, 83–84, 121–123 | Integrar gravação/leitura de oportunidades à mesma fonte persistente |
| P1 | Salvar CRM cria apenas Lead, não Opportunity | app/prospeccao/page.tsx:462–482; app/api/leads/route.ts:55–72 | Criar ou vincular oportunidade em transação; evitar duplicação em reenvios |
| P1 | Categoria livre não corresponde ao enum de nicho | app/prospeccao/page.tsx:470; app/api/leads/route.ts:59; prisma/schema.prisma:30–37 | Mapear categoria a NichoEnum: Personal trainer → PERSONAL_TRAINER, categorias desconhecidas → OUTROS |
| P1 | Envio em lote conta erros HTTP como sucesso | app/prospeccao/page.tsx:501–525 | Conferir status e corpo; marcar apenas itens realmente persistidos |
| P2 | Nome ausente aparece como Sem nome | app/api/leads/import/route.ts:96–109; app/prospeccao/page.tsx:558–560 | Conferir cabeçalho original e adicionar aliases documentados, sem inventar nomes |

## Relação com as imagens
A prospecção mostra um contato como No CRM e um toast de importação. O pipeline exibe apenas duas oportunidades na coluna Qualificado. O código permite exatamente essa divergência: sucesso HTTP não prova persistência e o pipeline não consulta os leads gravados.

Para a categoria Personal trainer vista na imagem, toUpperCase() produz PERSONAL TRAINER, mas o schema exige PERSONAL_TRAINER. Isso é uma incompatibilidade estática confirmada; não foi executada uma gravação desse contato para determinar a resposta exata do banco em produção.

## O que não foi testado
- Não foi consultado o registro específico do contato no banco de produção.
- Não houve gravação de contatos, exclusão de dados, alteração de código funcional ou novo deploy nesta análise.
- Não foi usado cookie inventado para contornar autenticação.
- O cabeçalho original do arquivo importado não está disponível nesta análise; a causa exata de Sem nome permanece pendente.

## Critérios de aceite para correção
1. Salvar um contato cria registros persistidos e relacionados de lead/empresa/oportunidade conforme o modelo escolhido.
2. Ler de volta a oportunidade por ID confirma a escrita antes da mensagem de sucesso.
3. Abrir e recarregar o pipeline apresenta a oportunidade, inclusive em outra sessão autorizada.
4. Erro de banco resulta em erro visível, nunca em HTTP 201 simulado.
5. Envio em lote conta somente sucessos confirmados.
6. Reenviar o mesmo contato não duplica a oportunidade.

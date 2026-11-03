// A lead commit spans several tables and collections over a remote connection.
// Prisma's 5s default can expire mid-commit; keep a finite shared upper bound.
export const CRM_TRANSACTION_BUDGET = { maxWait: 10_000, timeout: 30_000 } as const;
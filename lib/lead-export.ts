// Shared CSV/clipboard serialization for prospecting exports.
// A cell that starts with =, +, -, @, tab or CR can execute as a formula when
// opened in Excel/Sheets. A leading apostrophe keeps it inert text.
export function neutralizeFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

/** Full CSV field: neutralizes formulas, then quotes and escapes. */
export function csvCell(value: unknown): string {
  const neutralized = neutralizeFormula(String(value ?? ''));
  return `"${neutralized.replace(/"/g, '""')}"`;
}

/** Tab-separated clipboard field: neutralizes formulas and collapses control chars. */
export function clipboardCell(value: unknown): string {
  return neutralizeFormula(String(value ?? '')).replace(/[\t\n\r]/g, ' ');
}
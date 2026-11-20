/**
 * Formatea un monto numérico a Pesos Chilenos (CLP)
 * Ejemplo: 12000 -> "$12.000"
 */
export function formatCLP(amount: number): string {
  if (isNaN(amount)) return "$0";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea una fecha para mostrarla de forma amigable
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

import cronstrue from "cronstrue";

export function describeCronExpression(expr: string): string {
  return cronstrue.toString(expr);
}

export function humanizeCron(expr: string | null | undefined): string {
  if (!expr) return "No schedule";
  try {
    return describeCronExpression(expr);
  } catch {
    return expr;
  }
}

export function tryDescribeCronExpression(expr: string): string | null {
  try {
    return describeCronExpression(expr);
  } catch {
    return null;
  }
}

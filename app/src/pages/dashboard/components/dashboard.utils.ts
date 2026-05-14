export function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Working late";
}

export function firstName(full_name: string | null | undefined, email: string | null | undefined): string {
  if (full_name && full_name.trim()) return full_name.trim().split(/\s+/)[0]!;
  if (email) return email.split("@")[0]!;
  return "there";
}

import type { ReactNode } from "react";
import { toast as herouiToast } from "@heroui/react/toast";

export type ToastOptions = {
  title?: ReactNode;
  description?: ReactNode;
  duration?: number;
  variant?: "error" | "success" | "warning" | "default";
};

function hasTitle(t?: ReactNode): boolean {
  if (t === undefined || t === null) return false;
  if (typeof t === "string") return t.trim() !== "";
  return true;
}

export function toast(opts: ToastOptions): string {
  const titled = hasTitle(opts.title);
  const primary = titled ? opts.title! : opts.description ?? "";
  const description = titled ? opts.description : undefined;
  const base = {
    description,
    ...(opts.duration !== undefined ? { timeout: opts.duration } : {}),
  };
  if (opts.variant === "error") {
    return herouiToast.danger(primary, base);
  }
  if (opts.variant === "success") {
    return herouiToast.success(primary, base);
  }
  if (opts.variant === "warning") {
    return herouiToast.warning(primary, base);
  }
  return herouiToast(primary, base);
}

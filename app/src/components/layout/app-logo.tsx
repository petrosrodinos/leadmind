import { cn } from "@/lib/utils";

const LOGO_SRC = "/leadfinder-logo.png";

interface AppLogoProps {
  className?: string;
}

export function AppLogo({ className }: AppLogoProps) {
  return (
    <img src={LOGO_SRC} alt="" aria-hidden className={cn("object-contain shrink-0", className)} />
  );
}

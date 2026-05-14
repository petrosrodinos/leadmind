import type { ComponentProps, ReactNode } from "react";
import { Button, Spinner } from "@heroui/react";

type ButtonProps = ComponentProps<typeof Button>;

export type ActionButtonWithPendingProps = Omit<ButtonProps, "children"> & {
  children: ReactNode;
  idleLeading?: ReactNode;
};

export function ActionButtonWithPending({
  children,
  idleLeading,
  isPending,
  ...rest
}: ActionButtonWithPendingProps) {
  return (
    <Button isPending={isPending} {...rest}>
      {({ isPending: p }) => (
        <>
          {p ? <Spinner color="current" size="sm" className="shrink-0" /> : idleLeading}
          {children}
        </>
      )}
    </Button>
  );
}

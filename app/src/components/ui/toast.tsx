import type { ReactElement } from 'react';

export type ToastProps = {
  id?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: 'default' | 'destructive' | 'error';
  duration?: number;
};

export type ToastActionElement = ReactElement;

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Form, Label, Input, FieldError } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { SignUpSchema, type SignUpFormValues } from "../../../validation-schemas/auth";
import { useSignup } from "@/features/auth/hooks/use-auth";

export function SignUpForm() {
  const { mutate, isPending } = useSignup();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { email: "", password: "", confirm_password: "" },
  });

  function onSubmit(data: SignUpFormValues) {
    mutate({ email: data.email, password: data.password });
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 text-left">
      <div className="flex flex-col gap-1">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          {...register("email")}
          placeholder="name@example.com"
          type="email"
          fullWidth
        />
        {errors.email && <FieldError>{errors.email.message}</FieldError>}
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input
            id="signup-password"
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="********"
            fullWidth
            className="pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-default"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <FieldError>{errors.password.message}</FieldError>}
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="signup-confirm">Confirm Password</Label>
        <div className="relative">
          <Input
            id="signup-confirm"
            {...register("confirm_password")}
            type={showConfirm ? "text" : "password"}
            placeholder="********"
            fullWidth
            className="pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-default"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirm_password && <FieldError>{errors.confirm_password.message}</FieldError>}
      </div>

      <ActionButtonWithPending
        type="submit"
        isDisabled={isPending}
        isPending={isPending}
        fullWidth
        className="mt-2"
      >
        Create Account
      </ActionButtonWithPending>
    </Form>
  );
}

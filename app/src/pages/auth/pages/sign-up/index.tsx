import { Card } from "@heroui/react";
import { SignUpForm } from "./components/sign-up-form";
import { Suspense } from "react";
import { Link } from "react-router-dom";
import { Routes } from "@/routes/routes";

export default function SignUp() {
  return (
    <Card className="w-full max-w-md mx-auto p-8">
      <div className="flex flex-col gap-1 text-left mb-6">
        <p className="text-2xl font-semibold">Create an account</p>
        <p className="text-sm text-muted">
          Fill in the details below to create your account
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4 animate-pulse" aria-hidden>
            <div className="h-10 w-full rounded-lg bg-surface-secondary" />
            <div className="h-10 w-full rounded-lg bg-surface-secondary" />
            <div className="h-10 w-full rounded-lg bg-surface-secondary" />
            <div className="h-10 w-full rounded-lg bg-surface-secondary" />
            <div className="h-10 w-28 rounded-lg bg-surface-secondary" />
          </div>
        }
      >
        <SignUpForm />
      </Suspense>

      <div className="text-center text-sm mt-4 text-muted">
        Already have an account?{" "}
        <Link to={Routes.auth.sign_in} className="underline underline-offset-4 hover:opacity-80">
          Sign In
        </Link>
      </div>
    </Card>
  );
}

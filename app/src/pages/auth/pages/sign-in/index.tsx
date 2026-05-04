import type { FC } from "react";
import { Card } from "@/components/ui/card";
import { SignInForm } from "./components/sign-in-form";
import { Link } from "react-router-dom";
import { Routes } from "@/routes/routes";

const Login: FC = () => {
  return (
    <Card className="w-full max-w-md mx-auto p-8">
      <div className="flex flex-col gap-1 text-left mb-6">
        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Login</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your email and password below to log into your account
        </p>
      </div>

      <SignInForm />

      <div className="text-center text-sm mt-4 text-gray-500 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link to={Routes.auth.sign_up} className="text-gray-900 dark:text-gray-100 underline underline-offset-4 hover:opacity-80">
          Sign up
        </Link>
      </div>
    </Card>
  );
};

export default Login;

import Navbar from "@/components/layout/navbar";
import { environments } from "@/config/environments";
import { Command } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <Navbar />
      <main className="flex min-h-0 flex-1 justify-center overflow-y-auto p-4 pt-10 sm:pt-16">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-center gap-2">
            <Command className="h-6 w-6 text-accent" />
            <span className="text-xl font-semibold text-foreground">{environments.APP_NAME}</span>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

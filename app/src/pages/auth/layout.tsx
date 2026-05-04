import Navbar from "@/components/layout/navbar";
import { environments } from "@/config/environments";
import { Command } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex justify-center p-4 pt-10 sm:pt-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-center gap-2">
            <Command className="h-6 w-6 text-gray-900" />
            <span className="text-xl font-semibold text-gray-900">{environments.APP_NAME}</span>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

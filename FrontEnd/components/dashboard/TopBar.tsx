"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white hidden sm:block">
            Admin Portal
          </h2>
        </div>

        <div className="flex items-center gap-3">

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-slate-400 hover:text-white"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}

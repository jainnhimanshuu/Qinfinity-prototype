"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useStore } from "@/lib/storage";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const initialized = useStore((state) => state.initialized);
  const initRef = useRef(false);

  // Initialize store on mount (only once)
  useEffect(() => {
    if (!initialized && !initRef.current) {
      initRef.current = true;
      useStore.getState().initialize();
    }
  }, [initialized]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}


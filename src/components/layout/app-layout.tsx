// App Layout - Main layout with navbar and offline banner

import { Navbar } from "./navbar";
import { useAppStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isOnline } = useAppStore();

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />
      <main>{children}</main>

      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3.5 rounded-2xl border border-destructive/20 bg-background/80 backdrop-blur-xl shadow-2xl flex items-center gap-3.5 max-w-sm sm:max-w-md w-[calc(100%-2rem)]"
          >
            <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/10 text-destructive flex items-center justify-center animate-pulse">
              <WifiOff className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug">
                You are offline
              </p>
              <p className="text-xs text-muted-foreground leading-normal mt-0.5">
                We'll cache your changes locally and sync them when you reconnect.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
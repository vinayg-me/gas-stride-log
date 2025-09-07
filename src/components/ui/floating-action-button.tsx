// Floating Action Button - CRED-inspired FAB

import { motion } from "framer-motion";
import { Plus, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick?: () => void;
  icon?: LucideIcon;
  label?: string;
  className?: string;
}

export function FloatingActionButton({
  onClick,
  icon: Icon = Plus,
  label = "Add",
  className,
}: FloatingActionButtonProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        delay: 0.5 
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        className
      )}
    >
      <Button
        onClick={onClick}
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-glow bg-gradient-primary hover:opacity-90",
          "glow-primary animate-glow-pulse",
          "border-2 border-primary/20"
        )}
      >
        <Icon className="w-6 h-6 text-white" />
        <span className="sr-only">{label}</span>
      </Button>
    </motion.div>
  );
}
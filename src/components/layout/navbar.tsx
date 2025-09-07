// Navbar Component - CRED-inspired navigation

import { motion } from "framer-motion";
import { Fuel, Menu, Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const { syncStatus, isOnline } = useAppStore();

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'synced': return 'bg-accent';
      case 'syncing': return 'bg-secondary animate-pulse';
      case 'pending': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getSyncStatusText = () => {
    if (!isOnline) return 'Offline';
    switch (syncStatus) {
      case 'synced': return 'Synced';
      case 'syncing': return 'Syncing...';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "sticky top-0 z-50 w-full glass-card border-b border-border/20 backdrop-blur-xl",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-xl bg-gradient-primary">
            <Fuel className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">FuelTrackr</h1>
            <p className="text-xs text-muted-foreground">Smart Fuel Management</p>
          </div>
        </motion.div>

        {/* Sync Status */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="hidden sm:flex items-center gap-2"
        >
          <div className={cn("w-2 h-2 rounded-full", getSyncStatusColor())} />
          <span className="text-sm text-muted-foreground">
            {getSyncStatusText()}
          </span>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-primary/10"
          >
            <Bell className="w-4 h-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              2
            </Badge>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-primary/10"
          >
            <Settings className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-primary/10"
          >
            <User className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden hover:bg-primary/10"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
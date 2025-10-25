// Navbar Component - CRED-inspired navigation

import { motion } from "framer-motion";
import { Fuel, Menu, Bell, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/store";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { useMemo } from "react";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const { syncStatus, isOnline } = useAppStore();
  const { user, signOut } = useAuth();
  const { data: flags } = useFeatureFlags();
  const settingsMenuEnabled = useMemo(() => flags?.isEnabled("navbar_settings_icon") ?? false, [flags]);
  const notificationsMenuEnabled = useMemo(() => flags?.isEnabled("navbar_notifications_icon") ?? false, [flags]);
  const handleSignOut = async () => {
    await signOut();
  };

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
          {notificationsMenuEnabled && (<Button
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
          </Button>)}
          
          {settingsMenuEnabled && (<Button
            variant="ghost"
            size="sm"
            className="hover:bg-primary/10"
          >
            <Settings className="w-4 h-4" />
          </Button>)}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10"
              >
                <User className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
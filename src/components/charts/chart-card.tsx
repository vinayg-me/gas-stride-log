import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  isLoading?: boolean;
  error?: Error | null;
  dataLength?: number;
  emptyMessage?: string;
  height?: number;
  className?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  icon: Icon,
  isLoading,
  error,
  dataLength = 0,
  emptyMessage = "No data available.",
  height = 300,
  className,
  children,
  action,
}: ChartCardProps) {
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load chart data. Please try refreshing.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5" />}
              {title}
            </CardTitle>
            {subtitle && (
              <CardDescription>
                {subtitle}
              </CardDescription>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <LoadingSpinner size="lg" />
          </div>
        ) : dataLength === 0 ? (
          <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div style={{ height, width: '100%' }}>
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

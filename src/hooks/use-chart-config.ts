export function useChartConfig() {
  const commonAxisProps = {
    className: "fill-muted-foreground text-xs",
  };

  const commonTooltipProps = {
    contentStyle: {
      backgroundColor: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '6px',
    },
    labelFormatter: (value: any) => {
        // Handle both ISO strings and regular date strings
        try {
            return new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) {
            return value;
        }
    },
  };

  const commonGridProps = {
    strokeDasharray: "3 3",
    className: "stroke-muted",
  };

  const defaultMargin = { top: 5, right: 30, left: 20, bottom: 5 };

  return {
    commonAxisProps,
    commonTooltipProps,
    commonGridProps,
    defaultMargin,
  };
}

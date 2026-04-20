import * as React from "react";

import { cn } from "@/lib/utils";

type AlertVariant = "default" | "destructive" | "success" | "warning";

const variantClasses: Record<AlertVariant, string> = {
  default: "border-border bg-card text-card-foreground",
  destructive: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  success: "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function Alert({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: AlertVariant }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        "[&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-current",
        "[&>div]:min-w-0 [&>div]:flex-1",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return <h5 className={cn("font-medium leading-none tracking-tight", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />;
}

export { Alert, AlertDescription, AlertTitle };

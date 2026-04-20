import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type StatusAlertVariant = "error" | "success" | "warning" | "info";

const iconByVariant = {
  error: AlertCircle,
  success: CheckCircle2,
  warning: TriangleAlert,
  info: Info,
} satisfies Record<StatusAlertVariant, typeof AlertCircle>;

const alertVariantByStatus = {
  error: "destructive",
  success: "success",
  warning: "warning",
  info: "default",
} as const;

interface StatusAlertProps {
  variant: StatusAlertVariant;
  title?: string;
  lines: string[];
  className?: string;
}

export function StatusAlert({ variant, title, lines, className }: StatusAlertProps) {
  const Icon = iconByVariant[variant];

  return (
    <Alert variant={alertVariantByStatus[variant]} className={cn("items-start", className)}>
      <Icon />
      <div>
        {title ? <AlertTitle>{title}</AlertTitle> : null}
        <AlertDescription>
          {lines.length > 1 ? (
            <ul className={cn("space-y-1", title ? "mt-2" : "")}>
              {lines.map((line, index) => (
                <li key={`${line}-${index}`}>{title ? `- ${line}` : line}</li>
              ))}
            </ul>
          ) : (
            <p className={title ? "mt-2" : ""}>{lines[0]}</p>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
}

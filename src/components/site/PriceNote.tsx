import { cn } from "@/lib/utils";

export function PriceNote({ className }: { className?: string }) {
  return (
    <span className={cn("block text-xs font-normal text-muted-foreground", className)}>
      Точная цена после осмотра
    </span>
  );
}

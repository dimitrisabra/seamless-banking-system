import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showWordmark?: boolean;
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn(
      'relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-accent/20 shadow-sm',
      className,
    )}>
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.26),transparent_55%)]" />
      <svg viewBox="0 0 48 48" className="relative h-7 w-7" aria-hidden="true" fill="none">
        <path
          d="M24 5 36 10v12.5c0 7.33-4.8 13.92-12 16.5-7.2-2.58-12-9.17-12-16.5V10L24 5Z"
          className="stroke-primary"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M17 30V18l14 12V18"
          className="stroke-foreground"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function BrandLogo({
  className,
  markClassName,
  textClassName,
  showWordmark = true,
}: BrandLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <BrandMark className={markClassName} />
      {showWordmark && (
        <div className={cn('leading-none', textClassName)}>
          <div className="text-lg font-bold tracking-tight">NexusBank</div>
          <div className="text-[11px] uppercase tracking-[0.24em] opacity-70">Secure Banking</div>
        </div>
      )}
    </div>
  );
}

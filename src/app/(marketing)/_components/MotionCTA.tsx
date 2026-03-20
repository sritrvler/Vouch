export function MotionCTA({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

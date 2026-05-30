type TopBarProps = {
  title: string;
  subtitle: string;
};

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="border-b border-app-border bg-app-panel px-8 py-5">
      <h1 className="text-2xl font-semibold tracking-normal text-app-ink">{title}</h1>
      <p className="mt-1 max-w-3xl text-sm text-app-muted">{subtitle}</p>
    </header>
  );
}

export default function AmbientGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-signal/20 blur-[110px] animate-drift" />
      <div className="absolute top-40 -right-40 w-[420px] h-[420px] rounded-full bg-success/10 blur-[110px] animate-drift [animation-delay:-6s]" />
      <div className="absolute bottom-0 left-1/3 w-[380px] h-[380px] rounded-full bg-alert/10 blur-[110px] animate-drift [animation-delay:-3s]" />
    </div>
  );
}

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--accent-cyan)', animation: 'spin 0.8s linear infinite' }} />
          <div className="absolute inset-2 rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--accent-violet)', animation: 'spin 1.2s linear infinite reverse' }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>loading FinaxaCore...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
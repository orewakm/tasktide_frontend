// Shows a grey placeholder block while content loads.
// TR: İçerik yüklenirken gri bir yer tutucu blok gösterir.
export function Skeleton({ className = '' }: { className?: string }) {
    return <div aria-hidden className={`rounded-lg bg-sunken motion-safe:animate-pulse ${className}`} />;
}

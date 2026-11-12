// A placeholder block shaped like the content that is still loading.
// TR: Hâlâ yüklenen içeriğin şeklinde bir yer tutucu blok.
export function Skeleton({ className = '' }: { className?: string }) {
    return <div aria-hidden className={`rounded-lg bg-sunken motion-safe:animate-pulse ${className}`} />;
}

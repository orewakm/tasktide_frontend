import { ClosingCta } from '@/components/landing/ClosingCta';
import { Features } from '@/components/landing/Features';
import { Hero } from '@/components/landing/Hero';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNav } from '@/components/landing/LandingNav';

// Shows the landing page.
// TR: Tanıtım sayfasını gösterir.
export default function HomePage() {
    return (
        <>
            <LandingNav />
            <main className="flex-1">
                <Hero />
                <Features />
                <ClosingCta />
            </main>
            <LandingFooter />
        </>
    );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useEffectEvent, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Logo } from '@/components/Logo';
import { Button, buttonClass } from '@/components/ui/Button';
import { useLanguage } from '@/i18n/useLanguage';
import { clearToken } from '@/lib/token';
import { startDemo } from '@/lib/demo';

// Lets people try the app without signing up; they get the same guest account back when they return.
// TR: Uygulamanın kayıt olmadan denenmesini sağlar; geri gelen kişi aynı misafir hesabına döner.
export default function DemoPage() {
    const router = useRouter();
    const { user, loading, login } = useAuth();
    const { t } = useLanguage();
    const [failed, setFailed] = useState(false);

    // Opens this browser's guest account, or creates one with a sample board.
    // TR: Bu tarayıcının misafir hesabını açar ya da örnek panolu yeni bir hesap oluşturur.
    function run() {
        startDemo(t)
            .then(({ token, user: guest, path }) => {
                login(token, guest);
                router.replace(path);
            })
            .catch(() => {
                clearToken();
                setFailed(true);
            });
    }

    // Hides the error and starts the demo again.
    // TR: Hatayı gizler ve demoyu yeniden başlatır.
    function retry() {
        setFailed(false);
        run();
    }

    // Sends logged-in people to their boards and starts the demo for everyone else.
    // TR: Giriş yapmış kişileri panolarına gönderir, diğerleri için demoyu başlatır.
    const begin = useEffectEvent(() => {
        if (user) router.replace('/boards');
        else run();
    });

    useEffect(() => {
        if (!loading) begin();
    }, [loading]);

    return (
        <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 text-center">
            {failed ? (
                <>
                    <Logo />
                    <p role="alert" className="text-sm text-danger">
                        {t.demo.failed}
                    </p>
                    <div className="flex gap-3">
                        <Button onClick={retry}>{t.demo.retry}</Button>
                        <Link href="/" className={buttonClass('secondary')}>
                            {t.demo.home}
                        </Link>
                    </div>
                </>
            ) : (
                <>
                    <div className="motion-safe:animate-pulse">
                        <Logo withText={false} />
                    </div>
                    <p className="text-sm text-muted">{t.demo.preparing}</p>
                </>
            )}
        </main>
    );
}

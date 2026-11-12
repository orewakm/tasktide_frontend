'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type SubmitEvent } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useLanguage } from '@/i18n/useLanguage';
import { api } from '@/lib/api';
import { errorText } from '@/lib/errors';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const { t } = useLanguage();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { token, user } = await api.auth.login({ email, password });
            login(token, user);
            router.push('/boards');
        } catch (err) {
            setError(errorText(err, t));
            setLoading(false);
        }
    }

    return (
        <AuthShell
            title={t.auth.loginTitle}
            subtitle={t.auth.loginSubtitle}
            footer={
                <>
                    {t.auth.noAccount}{' '}
                    <Link href="/register" className="font-medium text-accent-ink hover:underline">
                        {t.auth.toRegister}
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <TextField
                    label={t.auth.email}
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label={t.auth.password}
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                    <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                        {error}
                    </p>
                )}

                <Button type="submit" disabled={loading} className="mt-1 w-full">
                    {loading ? t.auth.loggingIn : t.auth.loginButton}
                </Button>
            </form>
        </AuthShell>
    );
}

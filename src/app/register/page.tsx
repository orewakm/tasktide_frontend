'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type SubmitEvent } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useLanguage } from '@/i18n/useLanguage';
import { api, ApiError } from '@/lib/api';
import { errorText } from '@/lib/errors';

// Shows the sign-up form.
// TR: Kayıt formunu gösterir.
export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();
    const { t } = useLanguage();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // Creates the account, logs in and opens the boards page.
    // TR: Hesabı oluşturur, giriş yapar ve panolar sayfasını açar.
    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setFieldErrors({});
        setLoading(true);

        try {
            await api.auth.register({ name, email, password });
            const { token, user } = await api.auth.login({ email, password });
            login(token, user);
            router.push('/boards');
        } catch (err) {
            if (err instanceof ApiError && err.details.length > 0) {
                setFieldErrors(err.fieldErrors);
            } else {
                setError(errorText(err, t));
            }
            setLoading(false);
        }
    }

    return (
        <AuthShell
            title={t.auth.registerTitle}
            subtitle={t.auth.registerSubtitle}
            footer={
                <>
                    {t.auth.haveAccount}{' '}
                    <Link href="/login" className="font-medium text-accent-ink hover:underline">
                        {t.auth.toLogin}
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <TextField
                    label={t.auth.name}
                    required
                    maxLength={100}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={fieldErrors.name}
                />
                <TextField
                    label={t.auth.email}
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={fieldErrors.email}
                />
                <TextField
                    label={t.auth.password}
                    type="password"
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    hint={t.auth.passwordHint}
                    error={fieldErrors.password}
                />

                {error && (
                    <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                        {error}
                    </p>
                )}

                <Button type="submit" disabled={loading} className="mt-1 w-full">
                    {loading ? t.auth.registering : t.auth.registerButton}
                </Button>
            </form>
        </AuthShell>
    );
}

'use client';

import { ClockIcon, KanbanIcon, ListChecksIcon, ShieldCheckIcon, SignOutIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useCurrentUser } from '@/components/AuthProvider';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Logo } from '@/components/Logo';
import { RunningTimer } from '@/components/RunningTimer';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { useLanguage } from '@/i18n/useLanguage';

// Shows the top bar with navigation, the running timer and logout.
// TR: Gezinme, çalışan zamanlayıcı ve çıkış ile üst çubuğu gösterir.
export function Header() {
    const user = useCurrentUser();
    const { logout } = useAuth();
    const { t } = useLanguage();
    const pathname = usePathname();

    const links = [
        { href: '/boards', label: t.header.boards, icon: <KanbanIcon size={17} /> },
        { href: '/tasks', label: t.header.tasks, icon: <ListChecksIcon size={17} /> },
        { href: '/me/stats', label: t.header.myTime, icon: <ClockIcon size={17} /> },
        ...(user.role === 'user' ? [] : [{ href: '/admin', label: t.header.admin, icon: <ShieldCheckIcon size={17} /> }]),
    ];

    return (
        <header className="theme-deep sticky top-0 z-20 border-b border-line bg-canvas text-ink">
            <div className="flex h-14 items-center gap-3 px-4 sm:gap-5 sm:px-6">
                <Link href="/boards" aria-label="TaskTide" className="rounded-lg">
                    <span className="sm:hidden">
                        <Logo withText={false} />
                    </span>
                    <span className="hidden sm:inline">
                        <Logo />
                    </span>
                </Link>

                <nav aria-label={t.header.mainNav} className="flex items-center gap-0.5">
                    {links.map((link) => {
                        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={active ? 'page' : undefined}
                                title={link.label}
                                className={`flex h-8 items-center gap-2 rounded-lg px-2.5 text-[13px] font-medium transition-colors ${
                                    active ? 'bg-surface text-ink' : 'text-muted hover:bg-surface/60 hover:text-ink'
                                }`}
                            >
                                {link.icon}
                                <span className="hidden md:inline">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="ml-auto flex items-center gap-2">
                    <RunningTimer />
                    <LanguageSwitch />
                    <div className="ml-1 hidden items-center gap-2 lg:flex">
                        <Avatar name={user.name} size="md" />
                        <span className="max-w-32 truncate text-[13px] font-medium">{user.name}</span>
                    </div>
                    <IconButton label={t.header.logout} onClick={() => void logout()}>
                        <SignOutIcon size={19} />
                    </IconButton>
                </div>
            </div>
        </header>
    );
}

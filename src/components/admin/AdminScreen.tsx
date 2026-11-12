'use client';

import { ArrowLeftIcon, LockSimpleIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/components/AuthProvider';
import { Avatar } from '@/components/ui/Avatar';
import { buttonClass } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { inputClass } from '@/components/ui/TextField';
import { useLanguage } from '@/i18n/useLanguage';
import type { AdminUser, Role } from '@/interfaces';
import { api } from '@/lib/api';
import { errorText } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { queryKeys } from '@/lib/queryKeys';

type Filter = 'all' | 'admins' | 'users';

const ROLE_ORDER: Record<Role, number> = { super_admin: 0, admin: 1, user: 2 };
const ROLE_STYLES: Record<Role, string> = {
    super_admin: 'bg-deep text-on-deep',
    admin: 'bg-accent/10 text-accent-ink',
    user: 'bg-sunken text-muted',
};
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Admins see every account. Only the super admin can change roles, and never their own
// or the super admin's (the API checks the same rules).
// TR: Adminler tüm hesapları görür. Rolleri sadece süper admin değiştirebilir; kendi rolünü
// TR: veya süper adminin rolünü asla (API de aynı kuralları kontrol eder).
export function AdminScreen() {
    const { t } = useLanguage();
    const me = useCurrentUser();
    const canView = me.role !== 'user';

    if (!canView) {
        return (
            <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
                <EmptyState
                    icon={<LockSimpleIcon size={22} />}
                    title={t.admin.noAccessTitle}
                    body={t.admin.noAccessBody}
                    action={
                        <Link href="/boards" className={buttonClass('secondary', 'sm')}>
                            <ArrowLeftIcon size={14} weight="bold" />
                            {t.board.backToBoards}
                        </Link>
                    }
                />
            </main>
        );
    }

    return <UserDirectory canEditRoles={me.role === 'super_admin'} />;
}

function UserDirectory({ canEditRoles }: { canEditRoles: boolean }) {
    const { t } = useLanguage();
    const users = useQuery({ queryKey: queryKeys.adminUsers, queryFn: api.admin.users });
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    // Read the clock once, for the "joined this week" count.
    const [now] = useState(() => Date.now());

    const all = users.data ?? [];
    const needle = search.trim().toLocaleLowerCase();
    const shown = all
        .filter((u) => filter === 'all' || (filter === 'admins' ? u.role !== 'user' : u.role === 'user'))
        .filter(
            (u) =>
                !needle || u.name.toLocaleLowerCase().includes(needle) || u.email.toLocaleLowerCase().includes(needle),
        )
        .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.name.localeCompare(b.name));

    const adminCount = all.filter((u) => u.role !== 'user').length;
    const recentCount = all.filter((u) => now - new Date(u.created_at).getTime() < WEEK_MS).length;

    return (
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{t.admin.title}</h1>
                    <p className="mt-1 text-sm text-muted">{t.admin.subtitle}</p>
                </div>
                {users.data && (
                    <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
                        <span>{t.admin.accounts(all.length)}</span>
                        <span aria-hidden>·</span>
                        <span>{t.admin.adminCount(adminCount)}</span>
                        <span aria-hidden>·</span>
                        <span>{t.admin.joinedRecently(recentCount)}</span>
                    </p>
                )}
            </div>

            {!canEditRoles && (
                <p className="flex items-center gap-2 rounded-lg bg-sunken px-3 py-2 text-[13px] text-muted">
                    <LockSimpleIcon size={15} className="shrink-0" />
                    {t.admin.readOnly}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-80">
                    <MagnifyingGlassIcon
                        size={16}
                        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                    />
                    <input
                        type="search"
                        aria-label={t.admin.search}
                        placeholder={t.admin.search}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${inputClass} h-9 border-line pl-9`}
                    />
                </div>
                <div
                    role="radiogroup"
                    aria-label={t.admin.filter}
                    className="inline-flex h-9 w-fit items-center rounded-lg border border-line bg-sunken p-0.5"
                >
                    {(['all', 'admins', 'users'] as Filter[]).map((value) => (
                        <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={filter === value}
                            onClick={() => setFilter(value)}
                            className={`h-full rounded-md px-3 text-[13px] font-medium transition-colors ${
                                filter === value ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
                            }`}
                        >
                            {t.admin.filters[value]}
                        </button>
                    ))}
                </div>
            </div>

            {users.isError ? (
                <p role="alert" className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                    {errorText(users.error, t)}
                </p>
            ) : (
                <div className="overflow-hidden rounded-xl border border-line bg-surface">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-line bg-sunken/60 text-xs text-muted">
                            <tr>
                                <th scope="col" className="px-4 py-2.5 font-medium">
                                    {t.admin.person}
                                </th>
                                <th scope="col" className="px-4 py-2.5 font-medium">
                                    {t.admin.role}
                                </th>
                                <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">
                                    {t.admin.joined}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {users.isPending
                                ? [0, 1, 2, 3, 4].map((i) => (
                                      <tr key={i}>
                                          <td className="px-4 py-3" colSpan={3}>
                                              <Skeleton className="h-9" />
                                          </td>
                                      </tr>
                                  ))
                                : shown.map((user) => (
                                      <UserRow key={user.id} user={user} canEditRoles={canEditRoles} />
                                  ))}
                        </tbody>
                    </table>
                    {users.data && shown.length === 0 && (
                        <p className="px-4 py-10 text-center text-sm text-muted">{t.admin.noResults}</p>
                    )}
                </div>
            )}
        </main>
    );
}

function UserRow({ user, canEditRoles }: { user: AdminUser; canEditRoles: boolean }) {
    const { t, language } = useLanguage();
    const me = useCurrentUser();
    const queryClient = useQueryClient();
    const [busy, setBusy] = useState(false);

    const isMe = user.id === me.id;
    const editable = canEditRoles && !isMe && user.role !== 'super_admin';

    async function changeRole(role: 'user' | 'admin') {
        setBusy(true);
        try {
            const updated = await api.admin.setRole(user.id, role);
            queryClient.setQueryData<AdminUser[]>(queryKeys.adminUsers, (list) =>
                list?.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
            );
            toast.success(t.admin.roleChanged(updated.name, t.admin.roles[updated.role]));
        } catch (err) {
            toast.error(errorText(err, t));
        } finally {
            setBusy(false);
        }
    }

    return (
        <tr className="transition-colors hover:bg-sunken/50">
            {/* max-w-0 + w-full lets this column take the free space and cut long names with "..." */}
            <td className="w-full max-w-0 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Avatar name={user.name} size="md" />
                    <div className="min-w-0">
                        <p className="truncate font-medium">
                            {user.name}
                            {isMe && <span className="font-normal text-muted"> ({t.common.you})</span>}
                        </p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                {editable ? (
                    <select
                        aria-label={t.admin.roleOf(user.name)}
                        value={user.role}
                        disabled={busy}
                        onChange={(e) => void changeRole(e.target.value as 'user' | 'admin')}
                        className={`${inputClass} h-8 min-w-32 border-line pr-8 disabled:opacity-60`}
                    >
                        <option value="user">{t.admin.roles.user}</option>
                        <option value="admin">{t.admin.roles.admin}</option>
                    </select>
                ) : (
                    <span
                        className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium ${ROLE_STYLES[user.role]}`}
                    >
                        {t.admin.roles[user.role]}
                    </span>
                )}
            </td>
            <td className="hidden px-4 py-3 whitespace-nowrap text-muted sm:table-cell">
                {formatDate(user.created_at, language)}
            </td>
        </tr>
    );
}

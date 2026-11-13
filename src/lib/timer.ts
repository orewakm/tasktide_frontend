import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/useLanguage';
import type { TimeEntryDetails } from '@/interfaces';
import { api } from '@/lib/api';
import { errorText } from '@/lib/errors';
import { formatDuration } from '@/lib/format';
import { queryKeys } from '@/lib/queryKeys';

// Returns my running timer, or null.
// TR: Çalışan zamanlayıcımı ya da null döndürür.
export function useMyTimer() {
    return useQuery({ queryKey: queryKeys.timer, queryFn: api.time.current });
}

// Returns the seconds on the timer right now.
// TR: Zamanlayıcıdaki şu anki saniyeyi döndürür.
export function elapsedSeconds(entry: TimeEntryDetails, receivedAt: number, now: number): number {
    return entry.duration_seconds + Math.max(0, now - receivedAt) / 1000;
}

// Returns the functions that start and stop my timer.
// TR: Zamanlayıcımı başlatan ve durduran fonksiyonları döndürür.
export function useTimerActions() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    // Reloads a card's time entries and total time.
    // TR: Bir kartın zaman kayıtlarını ve toplam süresini yeniden yükler.
    function refreshCard(cardId: string) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries(cardId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.cardStats(cardId) });
    }

    // Stops my running timer.
    // TR: Çalışan zamanlayıcımı durdurur.
    async function stop(options: { quiet?: boolean } = {}) {
        try {
            const entry = await api.time.stop();
            queryClient.setQueryData(queryKeys.timer, null);
            refreshCard(entry.card_id);
            if (!options.quiet) toast.success(t.card.timerStopped(formatDuration(entry.duration_seconds, t)));
            return entry;
        } catch (err) {
            toast.error(errorText(err, t));
            throw err;
        }
    }

    // Starts my timer on a card, stopping a running one first.
    // TR: Önce çalışanı durdurarak bir kartta zamanlayıcımı başlatır.
    async function start(cardId: string) {
        const running = queryClient.getQueryData<TimeEntryDetails | null>(queryKeys.timer);
        if (running) await stop({ quiet: true });
        try {
            const entry = await api.time.start(cardId);
            queryClient.setQueryData(queryKeys.timer, entry);
            refreshCard(cardId);
            toast.success(t.card.timerStarted);
        } catch (err) {
            toast.error(errorText(err, t));
        }
    }

    return { start, stop };
}

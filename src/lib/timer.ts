import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/useLanguage';
import type { TimeEntryDetails } from '@/interfaces';
import { api } from '@/lib/api';
import { errorText } from '@/lib/errors';
import { formatDuration } from '@/lib/format';
import { queryKeys } from '@/lib/queryKeys';

// My running timer (or null). The header, the board and the card panel all read this.
// TR: Çalışan zamanlayıcım (veya null). Header, pano ve kart paneli hepsi bunu okur.
export function useMyTimer() {
    return useQuery({ queryKey: queryKeys.timer, queryFn: api.time.current });
}

// Seconds on the clock right now. duration_seconds is counted by the server up to the moment
// it answered, so we only add the time since then. That avoids clock differences between
// the browser and the server.
// TR: Şu an saatteki saniye. duration_seconds sunucunun cevap verdiği ana kadar sayılmıştır,
// TR: bu yüzden sadece o andan beri geçen süreyi ekleriz. Böylece tarayıcı ile sunucu arasındaki
// TR: saat farkı sorun olmaz.
export function elapsedSeconds(entry: TimeEntryDetails, receivedAt: number, now: number): number {
    return entry.duration_seconds + Math.max(0, now - receivedAt) / 1000;
}

export function useTimerActions() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    function refreshCard(cardId: string) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries(cardId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.cardStats(cardId) });
    }

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

    // Only one timer can run, so a running one elsewhere is stopped first.
    // TR: Tek bir zamanlayıcı çalışabilir, bu yüzden başka yerde çalışan önce durdurulur.
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

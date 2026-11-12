import type { Board, User } from '@/interfaces';

// The same rules the API checks. The UI uses them to hide buttons the user can't use;
// the server still has the final say.
// TR: API'nin kontrol ettiği kuralların aynısı. Arayüz bunları kullanıcının kullanamayacağı
// TR: butonları gizlemek için kullanır; son söz yine sunucudadır.
export function isBoardOwner(board: Board, user: User): boolean {
    return board.owner_id === user.id || user.role === 'super_admin';
}

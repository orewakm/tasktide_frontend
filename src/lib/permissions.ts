import type { Board, User } from '@/interfaces';

// Returns true if the user owns the board or is the super admin.
// TR: Kullanıcı panonun sahibiyse ya da süper yöneticiyse true döndürür.
export function isBoardOwner(board: Board, user: User): boolean {
    return board.owner_id === user.id || user.role === 'super_admin';
}

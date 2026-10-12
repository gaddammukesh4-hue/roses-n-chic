export type AdminActionState = { status: 'idle' | 'error' | 'success'; message?: string };
export const initialAdminState: AdminActionState = { status: 'idle' };

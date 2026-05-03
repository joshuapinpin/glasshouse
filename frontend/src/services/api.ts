const BASE = "http://localhost:8000";

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface ApiAuthResponse {
    user: { id: string; email: string } | null;
    session: { access_token: string; refresh_token: string } | null;
}

export async function signUp(email: string, password: string): Promise<ApiAuthResponse> {
    const res = await fetch(`${BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Sign up failed');
    }
    return res.json();
}

export async function signIn(email: string, password: string): Promise<ApiAuthResponse> {
    const res = await fetch(`${BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Invalid email or password');
    }
    return res.json();
}

export async function signOut(): Promise<void> {
    await fetch(`${BASE}/auth/signout`, { method: 'POST' });
}

export async function resetPassword(email: string): Promise<void> {
    const res = await fetch(`${BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Failed to send reset email');
    }
}

// ── Fundraisers ───────────────────────────────────────────────────────────────

export interface ApiFundraiser {
    fundraiserID: number;
    name: string;
    description: string;
    email: string;
    target_amount: number;
    current_amount: number;
    akahu_access_token: string;
}

export async function fetchFundraisers(email: string): Promise<ApiFundraiser[]> {
    const res = await fetch(`${BASE}/fundraisers/getAll?email=${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error('Failed to load fundraisers');
    return res.json();
}

export async function fetchFundraiser(fundraiserId: number): Promise<ApiFundraiser> {
    const res = await fetch(`${BASE}/fundraisers/get?fundraiserID=${fundraiserId}`);
    if (!res.ok) throw new Error('Failed to load fundraiser');
    return res.json();
}

export async function createFundraiser(data: Omit<ApiFundraiser, 'fundraiserID' | 'current_amount' | 'akahu_access_token'>): Promise<ApiFundraiser> {
    const res = await fetch(`${BASE}/fundraisers/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, current_amount: 0 }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Failed to create fundraiser');
    }
    return res.json();
}

// ── Transactions ──────────────────────────────────────────────────────────────

export interface ApiTransaction {
    transactionID: number;
    fundraiserID: number;
    amount: number;
    payee: string;
    created_at: string;
    description: string | null;
    file: string | null;
}

export async function fetchTransactions(fundraiserId: number): Promise<ApiTransaction[]> {
    const res = await fetch(`${BASE}/transactions/get_by_fundraiser_id?fundraiser_id=${fundraiserId}`);
    if (!res.ok) throw new Error('Failed to load transactions');
    return res.json();
}

export async function refreshBank(): Promise<void> {
    const res = await fetch(`${BASE}/transactions/refresh_bank`, { method: 'POST' });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Bank refresh failed');
    }
}

export async function syncTransactions(fundraiserId: number): Promise<{ synced: number }> {
    const res = await fetch(`${BASE}/transactions/sync?fundraiser_id=${fundraiserId}`, { method: 'POST' });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Sync failed');
    }
    return res.json();
}

export async function uploadTransactionFile(transactionId: number, file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE}/transactions/upload_file?transaction_id=${transactionId}`, {
        method: 'POST',
        body: form,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Upload failed');
    }
    const data = await res.json();
    return data.filename;
}

export async function updateTransactionDescription(transactionId: number, description: string): Promise<void> {
    const res = await fetch(
        `${BASE}/transactions/update_description?transaction_id=${transactionId}&description=${encodeURIComponent(description)}`,
        { method: 'PUT' },
    );
    if (!res.ok) throw new Error('Failed to update transaction');
}

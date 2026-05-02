const BASE = "http://localhost:8000";

export interface ApiTransaction {
    Amount: number;
    Payee: string;
    Date: string;
    Description: string;
    File: string;
    }

export interface ApiFundraiserDetail {
    Name: string;
    Date: string;
    Description: string;
    TargetAmount: number;
    CurrentAmount: number;
    Transactions: ApiTransaction[];
    }

export interface ApiFundraiserSummary {
    id: string;
    Name: string;
    CurrentAmount: number;
    TargetAmount: number;
    }

export async function fetchFundraisers():
Promise<ApiFundraiserSummary[]> {
    const res = await fetch(`${BASE}/fundraisers`);
    if (!res.ok) throw new Error("Failed to load fundraisers");
    return res.json();
    }

export async function fetchFundraiser(id: string):
Promise<ApiFundraiserDetail> {
    const res = await fetch (`${BASE}/fundraisers/${id}`);
    if (!res.ok) throw new Error("Failed to load fundraiser");
    return res.json();
   }
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LoanTransaction {
    id?: string;
    loan_id: string;
    borrower_address: string;
    collateral_amount: string;
    borrowed_amount: string;
    interest_rate: number;
    start_time: number;
    duration: number;
    status: 'active' | 'repaid' | 'liquidated';
    tx_hash: string;
    created_at?: string;
    repaid_at?: string | null;
    repaid_on_time?: boolean | null;
}

export interface ReputationData {
    id?: string;
    user_address: string;
    level: number;
    total_loans: number;
    repaid_on_time: number;
    total_volume: string;
    last_update: number;
    created_at?: string;
}

export async function saveLoanTransaction(transaction: LoanTransaction) {
    const { data, error } = await supabase
        .from('loan_transactions')
        .insert([transaction])
        .select();
    
    if (error) {
        console.error('Error saving loan transaction:', error);
        throw error;
    }
    
    return data;
}

export async function updateLoanTransaction(loanId: string, updates: Partial<LoanTransaction>) {
    const { data, error } = await supabase
        .from('loan_transactions')
        .update(updates)
        .eq('loan_id', loanId)
        .select();
    
    if (error) {
        console.error('Error updating loan transaction:', error);
        throw error;
    }
    
    return data;
}

export async function getUserLoans(userAddress: string) {
    const { data, error } = await supabase
        .from('loan_transactions')
        .select('*')
        .eq('borrower_address', userAddress.toLowerCase())
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching user loans:', error);
        throw error;
    }
    
    return data;
}

export async function saveReputationData(reputation: ReputationData) {
    const { data, error } = await supabase
        .from('user_reputation')
        .upsert([
            {
                user_address: reputation.user_address.toLowerCase(),
                ...reputation
            }
        ], { onConflict: 'user_address' })
        .select();
    
    if (error) {
        console.error('Error saving reputation data:', error);
        throw error;
    }
    
    return data;
}

export async function getUserReputation(userAddress: string) {
    const { data, error } = await supabase
        .from('user_reputation')
        .select('*')
        .eq('user_address', userAddress.toLowerCase())
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error fetching user reputation:', error);
        throw error;
    }
    
    return data;
}

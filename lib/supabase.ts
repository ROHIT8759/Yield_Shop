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

export interface WalletConnection {
    id?: string;
    wallet_address: string;
    ip_address?: string;
    country?: string;
    city?: string;
    region?: string;
    timezone?: string;
    user_agent?: string;
    first_connected_at?: string;
    last_connected_at?: string;
    connection_count?: number;
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
                ...reputation,
                user_address: reputation.user_address.toLowerCase()
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

/**
 * Save or update wallet connection data
 */
export async function saveWalletConnection(connectionData: WalletConnection) {
    const walletAddress = connectionData.wallet_address.toLowerCase();
    
    // Check if wallet already exists
    const { data: existing } = await supabase
        .from('wallet_connections')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();
    
    if (existing) {
        // Update existing record
        const { data, error } = await supabase
            .from('wallet_connections')
            .update({
                ip_address: connectionData.ip_address,
                country: connectionData.country,
                city: connectionData.city,
                region: connectionData.region,
                timezone: connectionData.timezone,
                user_agent: connectionData.user_agent,
                last_connected_at: new Date().toISOString(),
                connection_count: (existing.connection_count || 0) + 1
            })
            .eq('wallet_address', walletAddress)
            .select();
        
        if (error) {
            console.error('Error updating wallet connection:', error);
            throw error;
        }
        
        return data;
    } else {
        // Insert new record
        const { data, error } = await supabase
            .from('wallet_connections')
            .insert([{
                wallet_address: walletAddress,
                ip_address: connectionData.ip_address,
                country: connectionData.country,
                city: connectionData.city,
                region: connectionData.region,
                timezone: connectionData.timezone,
                user_agent: connectionData.user_agent,
                first_connected_at: new Date().toISOString(),
                last_connected_at: new Date().toISOString(),
                connection_count: 1
            }])
            .select();
        
        if (error) {
            console.error('Error saving wallet connection:', error);
            throw error;
        }
        
        return data;
    }
}

/**
 * Get wallet connection history
 */
export async function getWalletConnection(walletAddress: string) {
    const { data, error } = await supabase
        .from('wallet_connections')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();
    
    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching wallet connection:', error);
        throw error;
    }
    
    return data;
}

/**
 * Get location data from IP using free API
 */
export async function getLocationFromIP(): Promise<{
    ip: string;
    country: string;
    city: string;
    region: string;
    timezone: string;
} | null> {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) return null;
        
        const data = await response.json();
        return {
            ip: data.ip || '',
            country: data.country_name || '',
            city: data.city || '',
            region: data.region || '',
            timezone: data.timezone || ''
        };
    } catch (error) {
        console.error('Error fetching location:', error);
        return null;
    }
}

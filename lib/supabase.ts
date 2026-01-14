import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

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

// ==================== ORDER MANAGEMENT ====================

export interface OrderData {
    id?: string;
    order_id: string;
    wallet_address: string;
    // Customer Information
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    // Shipping Address
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    // Product Information
    product_id: string;
    product_name: string;
    product_image?: string;
    product_price: number;
    quantity: number;
    // Retailer Information
    retailer: string;
    category: string;
    // Payment Information
    payment_method: 'crypto' | 'cashback';
    transaction_hash?: string;
    total_amount: number;
    cashback_earned: number;
    shop_tokens_earned: number;
    // Order Status
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    // Timestamps
    created_at?: string;
    updated_at?: string;
    shipped_at?: string;
    delivered_at?: string;
}

export async function createOrder(order: OrderData) {
    const { data, error } = await supabase
        .from('orders')
        .insert([{
            ...order,
            wallet_address: order.wallet_address.toLowerCase()
        }])
        .select();

    if (error) {
        console.error('Error creating order:', error);
        throw error;
    }

    return data;
}

export async function getUserOrders(walletAddress: string) {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }

    return data;
}

export async function getOrderById(orderId: string) {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

    if (error) {
        console.error('Error fetching order:', error);
        throw error;
    }

    return data;
}

export async function updateOrderStatus(
    orderId: string,
    status: OrderData['status'],
    additionalUpdates?: Partial<OrderData>
) {
    const updates: any = { status, ...additionalUpdates };

    // Set timestamps based on status
    if (status === 'shipped' && !updates.shipped_at) {
        updates.shipped_at = new Date().toISOString();
    }
    if (status === 'delivered' && !updates.delivered_at) {
        updates.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('order_id', orderId)
        .select();

    if (error) {
        console.error('Error updating order status:', error);
        throw error;
    }

    return data;
}

export async function addOrderNote(orderId: string, note: string) {
    const { data, error } = await supabase
        .from('order_notes')
        .insert([{ order_id: orderId, note }])
        .select();

    if (error) {
        console.error('Error adding order note:', error);
        throw error;
    }

    return data;
}

export async function getOrderNotes(orderId: string) {
    const { data, error } = await supabase
        .from('order_notes')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching order notes:', error);
        throw error;
    }

    return data;
}

// ==================== LIQUIDITY POOL MANAGEMENT ====================

export interface PoolBalance {
    id?: string;
    pool_name: string;
    total_balance: number;
    available_balance: number;
    reserved_balance: number;
    total_orders_processed: number;
    total_volume_processed: number;
    last_updated?: string;
    created_at?: string;
}

export interface PoolTransaction {
    id?: string;
    pool_name: string;
    transaction_type: 'order' | 'refund' | 'deposit' | 'withdrawal' | 'fee_collection';
    amount: number;
    balance_before: number;
    balance_after: number;
    order_id?: string;
    wallet_address?: string;
    description?: string;
    created_at?: string;
}

export async function getPoolBalance(poolName: string = 'shopping_pool') {
    const { data, error } = await supabase
        .from('liquidity_pool_balance')
        .select('*')
        .eq('pool_name', poolName)
        .single();

    if (error) {
        console.error('Error fetching pool balance:', error);
        throw error;
    }

    return data as PoolBalance;
}

export async function deductFromPool(
    amount: number,
    orderId: string,
    walletAddress: string,
    poolName: string = 'shopping_pool'
) {
    try {
        // Get current balance
        const currentBalance = await getPoolBalance(poolName);

        if (currentBalance.available_balance < amount) {
            throw new Error('Insufficient pool balance');
        }

        const newAvailableBalance = currentBalance.available_balance - amount;
        const newTotalOrders = currentBalance.total_orders_processed + 1;
        const newTotalVolume = currentBalance.total_volume_processed + amount;

        // Update pool balance
        const { data: updatedBalance, error: updateError } = await supabase
            .from('liquidity_pool_balance')
            .update({
                available_balance: newAvailableBalance,
                total_orders_processed: newTotalOrders,
                total_volume_processed: newTotalVolume
            })
            .eq('pool_name', poolName)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating pool balance:', updateError);
            throw updateError;
        }

        // Log transaction
        const { data: transaction, error: txError } = await supabase
            .from('pool_transactions')
            .insert([{
                pool_name: poolName,
                transaction_type: 'order',
                amount: amount,
                balance_before: currentBalance.available_balance,
                balance_after: newAvailableBalance,
                order_id: orderId,
                wallet_address: walletAddress.toLowerCase(),
                description: `Order payment deducted: ${orderId}`
            }])
            .select()
            .single();

        if (txError) {
            console.error('Error logging pool transaction:', txError);
        }

        return { balance: updatedBalance, transaction };
    } catch (error) {
        console.error('Error deducting from pool:', error);
        throw error;
    }
}

export async function addToPool(
    amount: number,
    transactionType: PoolTransaction['transaction_type'],
    orderId?: string,
    walletAddress?: string,
    description?: string,
    poolName: string = 'shopping_pool'
) {
    try {
        // Get current balance
        const currentBalance = await getPoolBalance(poolName);

        const newAvailableBalance = currentBalance.available_balance + amount;
        const newTotalBalance = currentBalance.total_balance + amount;

        // Update pool balance
        const { data: updatedBalance, error: updateError } = await supabase
            .from('liquidity_pool_balance')
            .update({
                available_balance: newAvailableBalance,
                total_balance: newTotalBalance
            })
            .eq('pool_name', poolName)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating pool balance:', updateError);
            throw updateError;
        }

        // Log transaction
        const { data: transaction, error: txError } = await supabase
            .from('pool_transactions')
            .insert([{
                pool_name: poolName,
                transaction_type: transactionType,
                amount: amount,
                balance_before: currentBalance.available_balance,
                balance_after: newAvailableBalance,
                order_id: orderId,
                wallet_address: walletAddress?.toLowerCase(),
                description: description || `${transactionType} transaction`
            }])
            .select()
            .single();

        if (txError) {
            console.error('Error logging pool transaction:', txError);
        }

        return { balance: updatedBalance, transaction };
    } catch (error) {
        console.error('Error adding to pool:', error);
        throw error;
    }
}

export async function getPoolTransactions(
    poolName: string = 'shopping_pool',
    limit: number = 50
) {
    const { data, error } = await supabase
        .from('pool_transactions')
        .select('*')
        .eq('pool_name', poolName)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching pool transactions:', error);
        throw error;
    }

    return data as PoolTransaction[];
}

export async function getPoolStats(poolName: string = 'shopping_pool') {
    const balance = await getPoolBalance(poolName);
    const transactions = await getPoolTransactions(poolName, 10);

    return {
        balance,
        recentTransactions: transactions,
        utilizationRate: ((balance.total_balance - balance.available_balance) / balance.total_balance * 100).toFixed(2)
    };
}

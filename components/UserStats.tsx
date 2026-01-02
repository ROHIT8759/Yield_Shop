'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { Wallet, TrendingUp, Coins, DollarSign } from 'lucide-react';
import { YIELDSHOP_ABI, SHOPTOKEN_ABI, CONTRACTS } from '@/config/contracts';

export default function UserStats() {
    const { address, isConnected } = useAccount();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Read SHOP token balance
    const { data: shopBalance } = useReadContract({
        address: CONTRACTS.SHOP,
        abi: SHOPTOKEN_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    // Read user purchases (returns array of purchase IDs)
    const { data: userPurchaseIds } = useReadContract({
        address: CONTRACTS.YIELDSHOP,
        abi: YIELDSHOP_ABI,
        functionName: 'getUserPurchases',
        args: address ? [address] : undefined,
    });

    // Read user APY
    const { data: userAPY } = useReadContract({
        address: CONTRACTS.YIELDSHOP,
        abi: YIELDSHOP_ABI,
        functionName: 'getUserAPY',
        args: address ? [address] : undefined,
    });

    // Don't render until mounted to prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    if (!isConnected) {
        return (
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="glass-card p-8 rounded-2xl text-center">
                    <Wallet className="h-12 w-12 text-sol-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
                    <p className="text-gray-400">Connect to see your earnings and token balances</p>
                </div>
            </div>
        );
    }

    const shopBalanceFormatted = shopBalance ? parseFloat(formatEther(shopBalance as bigint)).toFixed(2) : '0.00';
    const apyFormatted = userAPY ? (Number(userAPY) / 100).toFixed(2) : '0.00';
    const purchasesCount = userPurchaseIds ? (userPurchaseIds as Array<unknown>).length : 0;

    // For demonstration - these would come from actual contract functions
    // For now, show placeholder values
    const pendingCashbackFormatted = '0.00';
    const totalYieldFormatted = '0.00';

    // Calculate total earnings (pending + yield)
    const totalEarnings = (parseFloat(pendingCashbackFormatted) + parseFloat(totalYieldFormatted)).toFixed(2);

    return (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Your Dashboard</h2>
                <p className="text-gray-400">Real-time stats from the blockchain</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* SHOP Token Balance */}
                <div className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-transform duration-300 border border-sol-primary/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-sol-primary/20 p-3 rounded-lg">
                            <Coins className="h-6 w-6 text-sol-primary" />
                        </div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">$SHOP Tokens</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        {shopBalanceFormatted}
                    </div>
                    <p className="text-sm text-gray-400">Reward tokens earned</p>
                </div>

                {/* Total Earnings */}
                <div className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-transform duration-300 border border-green-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-500/20 p-3 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-400" />
                        </div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Total Earnings</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        ${totalEarnings}
                    </div>
                    <p className="text-sm text-gray-400">Cashback + Yield</p>
                </div>

                {/* Pending Cashback */}
                <div className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-transform duration-300 border border-yellow-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-yellow-500/20 p-3 rounded-lg">
                            <DollarSign className="h-6 w-6 text-yellow-400" />
                        </div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Pending Cashback</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        ${pendingCashbackFormatted}
                    </div>
                    <p className="text-sm text-gray-400">Ready to claim</p>
                </div>

                {/* Yield Earned */}
                <div className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-transform duration-300 border border-blue-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-500/20 p-3 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-blue-400" />
                        </div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">DeFi Yield</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        ${totalYieldFormatted}
                    </div>
                    <p className="text-sm text-gray-400">From staking</p>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="mt-8 glass-card p-6 rounded-xl border border-sol-primary/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-sol-primary">{purchasesCount}</div>
                        <div className="text-sm text-gray-400 mt-1">Total Purchases</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-sol-primary">
                            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '—'}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Wallet Address</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-400">Active</div>
                        <div className="text-sm text-gray-400 mt-1">Status</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-400">Mantle</div>
                        <div className="text-sm text-gray-400 mt-1">Network</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

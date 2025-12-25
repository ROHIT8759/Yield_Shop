'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAccount, useReadContract } from 'wagmi';
import { Building2, TrendingUp, FileText, DollarSign, Calendar, Shield, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { RWA_CONTRACTS, RWA_FACTORY_ABI, KYC_REGISTRY_ABI, ASSET_TYPES } from '../../config/rwa-contracts';

interface RWAToken {
    address: string;
    name: string;
    symbol: string;
    assetType: number;
    totalValue: bigint;
    yieldRate: bigint;
    maturityDate: bigint;
    description: string;
}

export default function RWAMarketplace() {
    const { address, isConnected } = useAccount();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [tokens, setTokens] = useState<RWAToken[]>([]);
    const [filter, setFilter] = useState<number | null>(null);

    // Check KYC status
    const { data: isKYCVerified } = useReadContract({
        address: RWA_CONTRACTS.KYC_REGISTRY as `0x${string}`,
        abi: KYC_REGISTRY_ABI,
        functionName: 'isKYCVerified',
        args: address ? [address] : undefined,
    });

    // Get total tokens
    const { data: totalTokens } = useReadContract({
        address: RWA_CONTRACTS.RWA_FACTORY as `0x${string}`,
        abi: RWA_FACTORY_ABI,
        functionName: 'totalTokens',
    });

    const getAssetIcon = (type: number) => {
        switch (type) {
            case 0: return <Building2 className="h-6 w-6" />;
            case 1: return <TrendingUp className="h-6 w-6" />;
            case 2: return <FileText className="h-6 w-6" />;
            case 3: return <DollarSign className="h-6 w-6" />;
            default: return <Building2 className="h-6 w-6" />;
        }
    };

    const filteredTokens = filter !== null
        ? tokens.filter(t => t.assetType === filter)
        : tokens;

    return (
        <div className="min-h-screen bg-mantle-dark">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Real World Asset Marketplace
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Invest in tokenized real estate, bonds, invoices, and cash-flow assets
                    </p>
                </div>

                {/* KYC Warning */}
                {isConnected && !isKYCVerified && (
                    <div className="mb-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <div className="flex items-center gap-4">
                            <Shield className="h-8 w-8 text-yellow-500" />
                            <div>
                                <p className="text-lg font-semibold text-yellow-400 mb-1">
                                    KYC Verification Required
                                </p>
                                <p className="text-yellow-400/80 text-sm mb-2">
                                    Complete KYC verification to trade Real World Asset tokens
                                </p>
                                <Link href="/kyc">
                                    <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-all">
                                        Verify Now
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="mb-8 flex flex-wrap gap-3">
                    <button
                        onClick={() => setFilter(null)}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${filter === null
                                ? 'bg-sol-primary text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        All Assets
                    </button>
                    {Object.entries(ASSET_TYPES).map(([key, value]) => (
                        <button
                            key={key}
                            onClick={() => setFilter(Number(key))}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all ${filter === Number(key)
                                    ? 'bg-sol-primary text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            {value}
                        </button>
                    ))}
                </div>

                {/* Token Grid */}
                {filteredTokens.length === 0 ? (
                    <div className="glass-card p-12 rounded-xl text-center">
                        <Building2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-xl text-gray-400 mb-2">No RWA Tokens Available</p>
                        <p className="text-sm text-gray-500">
                            Check back soon for new tokenized real world assets
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTokens.map((token) => (
                            <div key={token.address} className="glass-card p-6 rounded-xl hover:border-sol-primary/40 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-sol-primary/20 p-3 rounded-lg text-sol-primary">
                                            {getAssetIcon(token.assetType)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{token.name}</h3>
                                            <p className="text-sm text-gray-400">{token.symbol}</p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {token.description || 'No description available'}
                                </p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Asset Type</span>
                                        <span className="text-white font-semibold">
                                            {ASSET_TYPES[token.assetType as keyof typeof ASSET_TYPES]}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Total Value</span>
                                        <span className="text-white font-semibold">
                                            ${(Number(token.totalValue) / 100).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Annual Yield</span>
                                        <span className="text-green-400 font-semibold">
                                            {(Number(token.yieldRate) / 100).toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Maturity
                                        </span>
                                        <span className="text-white font-semibold">
                                            {token.maturityDate > 0
                                                ? new Date(Number(token.maturityDate) * 1000).toLocaleDateString()
                                                : 'Perpetual'}
                                        </span>
                                    </div>
                                </div>

                                <Link href={`/rwa/${token.address}`}>
                                    <button className="w-full bg-sol-primary hover:bg-sol-primary/80 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                                        View Details
                                        <ExternalLink className="h-4 w-4" />
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats Section */}
                <div className="mt-16 grid md:grid-cols-4 gap-6">
                    <div className="glass-card p-6 rounded-xl text-center">
                        <Building2 className="h-10 w-10 text-sol-primary mx-auto mb-3" />
                        <p className="text-3xl font-bold text-white mb-1">
                            {totalTokens ? totalTokens.toString() : '0'}
                        </p>
                        <p className="text-gray-400 text-sm">Total Assets</p>
                    </div>
                    <div className="glass-card p-6 rounded-xl text-center">
                        <DollarSign className="h-10 w-10 text-sol-primary mx-auto mb-3" />
                        <p className="text-3xl font-bold text-white mb-1">$0</p>
                        <p className="text-gray-400 text-sm">Total Value Locked</p>
                    </div>
                    <div className="glass-card p-6 rounded-xl text-center">
                        <TrendingUp className="h-10 w-10 text-sol-primary mx-auto mb-3" />
                        <p className="text-3xl font-bold text-white mb-1">0%</p>
                        <p className="text-gray-400 text-sm">Avg. Yield</p>
                    </div>
                    <div className="glass-card p-6 rounded-xl text-center">
                        <Shield className="h-10 w-10 text-sol-primary mx-auto mb-3" />
                        <p className="text-3xl font-bold text-white mb-1">100%</p>
                        <p className="text-gray-400 text-sm">KYC Compliant</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

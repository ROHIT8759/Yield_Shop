'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Shield, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { RWA_CONTRACTS, KYC_REGISTRY_ABI, KYC_STATUS, KYC_TIERS } from '../../config/rwa-contracts';

export default function KYCPage() {
    const { address, isConnected } = useAccount();
    const [mounted, setMounted] = useState(false);
    const [country, setCountry] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

    // Read KYC data
    const { data: kycData, refetch } = useReadContract({
        address: RWA_CONTRACTS.KYC_REGISTRY as `0x${string}`,
        abi: KYC_REGISTRY_ABI,
        functionName: 'kycData',
        args: address ? [address] : undefined,
    }) as { data: readonly [bigint, bigint, bigint, string, bigint] | undefined; refetch: () => void };

    const handleSubmitKYC = async () => {
        if (!country) {
            alert('Please select a country');
            return;
        }

        try {
            await writeContract({
                address: RWA_CONTRACTS.KYC_REGISTRY as `0x${string}`,
                abi: KYC_REGISTRY_ABI,
                functionName: 'submitKYC',
                args: [country],
            });
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                refetch();
            }, 3000);
        } catch (error) {
            console.error('KYC submission failed:', error);
        }
    };

    const getStatusIcon = (status: number) => {
        switch (status) {
            case 1: return <Clock className="h-8 w-8 text-yellow-500" />;
            case 2: return <CheckCircle className="h-8 w-8 text-green-500" />;
            case 3: return <XCircle className="h-8 w-8 text-red-500" />;
            case 4: return <AlertCircle className="h-8 w-8 text-orange-500" />;
            default: return <Shield className="h-8 w-8 text-gray-500" />;
        }
    };

    const status = kycData ? Number(kycData[0]) : 0;
    const tier = kycData ? Number(kycData[4]) : 0;
    const expiresAt = kycData ? Number(kycData[2]) : 0;

    return (
        <div className="min-h-screen bg-black">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        KYC Verification
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Complete KYC to access Real World Asset tokenization
                    </p>
                </div>

                {!mounted || !isConnected ? (
                    <div className="glass-card p-8 rounded-xl text-center">
                        <Shield className="h-16 w-16 text-sol-primary mx-auto mb-4" />
                        <p className="text-xl text-white mb-2">Connect Your Wallet</p>
                        <p className="text-gray-400">Please connect your wallet to proceed with KYC</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* KYC Status Card */}
                        <div className="glass-card p-8 rounded-xl">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Shield className="h-6 w-6 text-sol-primary" />
                                Your KYC Status
                            </h2>

                            <div className="flex flex-col items-center py-8">
                                {getStatusIcon(status)}
                                <p className="text-3xl font-bold text-white mt-4">
                                    {KYC_STATUS[status as keyof typeof KYC_STATUS]}
                                </p>
                                {status === 2 && (
                                    <>
                                        <p className="text-lg text-sol-primary mt-2">
                                            Tier: {KYC_TIERS[tier as keyof typeof KYC_TIERS]}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            Expires: {new Date(expiresAt * 1000).toLocaleDateString()}
                                        </p>
                                    </>
                                )}
                            </div>

                            {status === 2 && (
                                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <p className="text-green-400 text-sm">
                                        ✓ You can now trade Real World Asset tokens
                                    </p>
                                    <p className="text-green-400 text-sm">
                                        ✓ Access to custody and yield distribution
                                    </p>
                                </div>
                            )}

                            {status === 1 && (
                                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <p className="text-yellow-400 text-sm">
                                        Your KYC application is under review. This typically takes 24-48 hours.
                                    </p>
                                </div>
                            )}

                            {status === 3 && (
                                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-red-400 text-sm">
                                        Your KYC application was rejected. Please contact support for more information.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* KYC Application Form */}
                        {status === 0 && (
                            <div className="glass-card p-8 rounded-xl">
                                <h2 className="text-2xl font-bold text-white mb-6">
                                    Submit KYC Application
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Country of Residence *
                                        </label>
                                        <select
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sol-primary"
                                        >
                                            <option value="">Select Country</option>
                                            <option value="US">United States</option>
                                            <option value="UK">United Kingdom</option>
                                            <option value="SG">Singapore</option>
                                            <option value="HK">Hong Kong</option>
                                            <option value="AE">United Arab Emirates</option>
                                            <option value="JP">Japan</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>

                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                        <p className="text-blue-400 text-sm mb-2 font-semibold">
                                            What you&apos;ll need:
                                        </p>
                                        <ul className="text-blue-400 text-sm space-y-1">
                                            <li>• Government-issued ID</li>
                                            <li>• Proof of address</li>
                                            <li>• Selfie verification</li>
                                        </ul>
                                    </div>

                                    <button
                                        onClick={handleSubmitKYC}
                                        disabled={isPending || isConfirming}
                                        className="w-full bg-sol-primary hover:bg-sol-primary/80 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPending || isConfirming ? 'Submitting...' : 'Submit KYC Application'}
                                    </button>

                                    <p className="text-xs text-gray-500 text-center">
                                        By submitting, you agree to our Terms of Service and Privacy Policy
                                    </p>
                                </div>

                                {showSuccess && (
                                    <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                        <p className="text-green-400 text-sm">
                                            ✓ KYC application submitted successfully!
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Information Card */}
                        {status !== 0 && (
                            <div className="glass-card p-8 rounded-xl">
                                <h2 className="text-2xl font-bold text-white mb-6">
                                    KYC Tiers Explained
                                </h2>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-800 rounded-lg">
                                        <h3 className="text-lg font-semibold text-white mb-2">Basic Tier</h3>
                                        <p className="text-sm text-gray-400">
                                            • Trade up to $10,000 in RWA tokens
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            • Access to custody services
                                        </p>
                                    </div>

                                    <div className="p-4 bg-gray-800 rounded-lg">
                                        <h3 className="text-lg font-semibold text-white mb-2">Intermediate Tier</h3>
                                        <p className="text-sm text-gray-400">
                                            • Trade up to $100,000 in RWA tokens
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            • Enhanced yield distribution
                                        </p>
                                    </div>

                                    <div className="p-4 bg-gray-800 rounded-lg">
                                        <h3 className="text-lg font-semibold text-white mb-2">Advanced Tier</h3>
                                        <p className="text-sm text-gray-400">
                                            • Unlimited trading volume
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            • Priority support and premium features
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

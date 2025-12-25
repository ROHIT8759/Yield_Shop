'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Shield, Clock, DollarSign, Star, CheckCircle, Loader2, AlertTriangle, Trophy, Zap, Droplet } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { saveLoanTransaction, updateLoanTransaction, getUserLoans, saveReputationData, getUserReputation, type LoanTransaction, type ReputationData } from '@/lib/supabase';
import { CONTRACTS, LENDING_ABI, FLASHLOAN_ABI } from '@/config/contracts';

export default function LoansPage() {
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState<'borrow' | 'flashloan' | 'myloans'>('borrow');

    // Loan form states
    const [collateralAmount, setCollateralAmount] = useState('');
    const [borrowAmount, setBorrowAmount] = useState('');
    const [duration, setDuration] = useState('30');
    const [selectedCollateral, setSelectedCollateral] = useState('MNT');
    const [selectedBorrow, setSelectedBorrow] = useState('USDC');

    // Flash loan states
    const [flashLoanAmount, setFlashLoanAmount] = useState('');
    const [flashLoanToken, setFlashLoanToken] = useState('USDC');
    const [receiverContract, setReceiverContract] = useState('');

    // UI states
    const [userLoansData, setUserLoansData] = useState<LoanTransaction[]>([]);
    const [reputation, setReputation] = useState<ReputationData | null>(null);
    const [loading, setLoading] = useState(false);

    // Read user reputation from blockchain
    const { data: onChainReputation } = useReadContract({
        address: CONTRACTS.LENDING,
        abi: LENDING_ABI,
        functionName: 'userReputation',
        args: address ? [address] : undefined,
    });

    // Read user's interest rate
    const { data: interestRate } = useReadContract({
        address: CONTRACTS.LENDING,
        abi: LENDING_ABI,
        functionName: 'calculateInterestRate',
        args: address ? [address] : undefined,
    });

    // Read flash loan liquidity
    const { data: flashLoanLiquidity } = useReadContract({
        address: CONTRACTS.FLASHLOAN,
        abi: FLASHLOAN_ABI,
        functionName: 'getAvailableLiquidity',
        args: flashLoanToken === 'USDC' ? [CONTRACTS.USDC] : [CONTRACTS.MNT],
    });

    // Read flash loan stats
    const { data: flashLoanStats } = useReadContract({
        address: CONTRACTS.FLASHLOAN,
        abi: FLASHLOAN_ABI,
        functionName: 'getUserStats',
        args: address ? [address] : undefined,
    });

    // Write contracts
    const { writeContract: createLoan, data: createHash } = useWriteContract();
    const { writeContract: repayLoan, data: repayHash } = useWriteContract();
    const { writeContract: executeFlashLoan, data: flashLoanHash } = useWriteContract();

    const { isLoading: isCreating, isSuccess: createSuccess } = useWaitForTransactionReceipt({ hash: createHash });
    const { isLoading: isRepaying, isSuccess: repaySuccess } = useWaitForTransactionReceipt({ hash: repayHash });
    const { isLoading: isFlashLoaning, isSuccess: flashLoanSuccess } = useWaitForTransactionReceipt({ hash: flashLoanHash });

    // Load user data from Supabase
    useEffect(() => {
        if (address) {
            loadUserData();
        }
    }, [address, createSuccess, repaySuccess]);

    // Sync on-chain reputation to Supabase
    useEffect(() => {
        if (address && onChainReputation) {
            const [level, totalLoans, repaidOnTime, totalVolume, lastUpdate] = onChainReputation;
            saveReputationData({
                user_address: address,
                level: Number(level),
                total_loans: Number(totalLoans),
                repaid_on_time: Number(repaidOnTime),
                total_volume: totalVolume.toString(),
                last_update: Number(lastUpdate)
            }).catch(console.error);
        }
    }, [address, onChainReputation]);

    const loadUserData = async () => {
        if (!address) return;

        setLoading(true);
        try {
            const [loans, rep] = await Promise.all([
                getUserLoans(address),
                getUserReputation(address)
            ]);

            setUserLoansData(loans || []);
            setReputation(rep);
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLoan = async () => {
        if (!address || !collateralAmount || !borrowAmount) return;

        try {
            const collateralToken = selectedCollateral === 'MNT' ? CONTRACTS.MNT : CONTRACTS.USDC;
            const borrowToken = selectedBorrow === 'USDC' ? CONTRACTS.USDC : CONTRACTS.MNT;
            const durationSeconds = BigInt(parseInt(duration) * 24 * 60 * 60);

            createLoan({
                address: CONTRACTS.LENDING,
                abi: LENDING_ABI,
                functionName: 'createLoan',
                args: [
                    parseEther(collateralAmount),
                    parseEther(borrowAmount),
                    durationSeconds,
                    collateralToken,
                    borrowToken
                ],
            });

            // Save to Supabase
            if (createHash) {
                await saveLoanTransaction({
                    loan_id: createHash,
                    borrower_address: address,
                    collateral_amount: collateralAmount,
                    borrowed_amount: borrowAmount,
                    interest_rate: interestRate ? Number(interestRate) / 100 : 5,
                    start_time: Math.floor(Date.now() / 1000),
                    duration: parseInt(duration) * 24 * 60 * 60,
                    status: 'active',
                    tx_hash: createHash
                });
            }

            // Reset form
            setCollateralAmount('');
            setBorrowAmount('');
        } catch (error) {
            console.error('Error creating loan:', error);
        }
    };

    const handleRepayLoan = async (loanId: string) => {
        if (!address) return;

        try {
            repayLoan({
                address: CONTRACTS.LENDING,
                abi: LENDING_ABI,
                functionName: 'repayLoan',
                args: [BigInt(loanId)],
            });

            // Update Supabase
            if (repayHash) {
                const now = Math.floor(Date.now() / 1000);
                const loan = userLoansData.find(l => l.loan_id === loanId);
                const onTime = loan ? now <= (loan.start_time + loan.duration) : false;

                await updateLoanTransaction(loanId, {
                    status: 'repaid',
                    repaid_at: new Date().toISOString(),
                    repaid_on_time: onTime
                });
            }
        } catch (error) {
            console.error('Error repaying loan:', error);
        }
    };

    const handleFlashLoan = async () => {
        if (!address || !flashLoanAmount || !receiverContract) return;

        try {
            const tokenAddress = flashLoanToken === 'USDC' ? CONTRACTS.USDC : CONTRACTS.MNT;

            executeFlashLoan({
                address: CONTRACTS.FLASHLOAN,
                abi: FLASHLOAN_ABI,
                functionName: 'flashLoan',
                args: [
                    receiverContract as `0x${string}`,
                    tokenAddress,
                    parseEther(flashLoanAmount),
                    '0x' // Empty params
                ],
            });

            // Reset form
            setFlashLoanAmount('');
            setReceiverContract('');
        } catch (error) {
            console.error('Error executing flash loan:', error);
        }
    };

    const calculateFlashLoanFee = () => {
        if (!flashLoanAmount) return '0';
        return (parseFloat(flashLoanAmount) * 0.0009).toFixed(4);
    };

    const calculateCollateralRatio = () => {
        if (!collateralAmount || !borrowAmount) return 0;
        return (parseFloat(collateralAmount) / parseFloat(borrowAmount)) * 100;
    };

    const getReputationColor = (level: number) => {
        if (level >= 4) return 'text-yellow-400';
        if (level >= 3) return 'text-green-400';
        if (level >= 2) return 'text-blue-400';
        return 'text-gray-400';
    };

    const getReputationLabel = (level: number) => {
        const labels = ['New', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
        return labels[level] || 'New';
    };

    return (
        <div className="min-h-screen bg-sol-dark">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Decentralized <span className="text-sol-primary">Lending</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Collateral-based loans with on-chain reputation rewards
                    </p>
                </div>

                {/* Reputation Card */}
                {isConnected && address && (
                    <div className="glass-card rounded-2xl p-8 mb-8 border-2 border-sol-primary/30">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-sol-primary/30 to-purple-600/30 p-4 rounded-2xl border border-sol-primary/50">
                                    <Trophy className="h-10 w-10 text-sol-primary" />
                                </div>
                                <div>
                                    <h3 className="text-white text-2xl font-bold mb-1">Your Reputation Score</h3>
                                    <p className="text-gray-400 text-sm">Build reputation to unlock better rates and higher limits</p>
                                </div>
                            </div>
                            <div className="text-right">
                                {/* Reputation Score Circle */}
                                <div className="relative inline-block">
                                    <div className={`w-32 h-32 rounded-full border-8 ${reputation?.level === 5 ? 'border-yellow-400 bg-yellow-500/10' :
                                            reputation?.level === 4 ? 'border-purple-400 bg-purple-500/10' :
                                                reputation?.level === 3 ? 'border-green-400 bg-green-500/10' :
                                                    reputation?.level === 2 ? 'border-blue-400 bg-blue-500/10' :
                                                        reputation?.level === 1 ? 'border-orange-400 bg-orange-500/10' :
                                                            'border-gray-600 bg-gray-600/10'
                                        } flex items-center justify-center`}>
                                        <div className="text-center">
                                            <div className={`text-4xl font-black ${getReputationColor(reputation?.level || 0)}`}>
                                                {reputation?.level || 0}
                                            </div>
                                            <div className="text-xs text-gray-400 font-medium">/ 5</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reputation Badge */}
                        <div className="flex items-center justify-between mb-6 p-4 bg-sol-dark rounded-xl border border-sol-primary/20">
                            <div className="flex items-center gap-3">
                                <div className={`text-2xl font-bold ${getReputationColor(reputation?.level || 0)}`}>
                                    {getReputationLabel(reputation?.level || 0)}
                                </div>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-5 w-5 ${i < (reputation?.level || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-gray-400 text-sm">Next Level</div>
                                <div className="text-white font-bold">
                                    {reputation?.level === 5 ? 'Max Level!' : `${getReputationLabel((reputation?.level || 0) + 1)}`}
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="bg-sol-card rounded-xl p-4 border border-sol-primary/20">
                                <div className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Score</div>
                                <div className={`text-3xl font-bold ${getReputationColor(reputation?.level || 0)}`}>
                                    {reputation?.level || 0}/5
                                </div>
                            </div>
                            <div className="bg-sol-card rounded-xl p-4 border border-sol-primary/20">
                                <div className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Total Loans</div>
                                <div className="text-white text-3xl font-bold">{reputation?.total_loans || 0}</div>
                            </div>
                            <div className="bg-sol-card rounded-xl p-4 border border-sol-primary/20">
                                <div className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Repaid On Time</div>
                                <div className="text-green-400 text-3xl font-bold">{reputation?.repaid_on_time || 0}</div>
                            </div>
                            <div className="bg-sol-card rounded-xl p-4 border border-sol-primary/20">
                                <div className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Success Rate</div>
                                <div className="text-white text-3xl font-bold">
                                    {reputation?.total_loans ? Math.round((reputation.repaid_on_time / reputation.total_loans) * 100) : 0}%
                                </div>
                            </div>
                            <div className="bg-sol-card rounded-xl p-4 border border-green-500/20 bg-green-500/5">
                                <div className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Interest Rate</div>
                                <div className="text-green-400 text-3xl font-bold">
                                    {interestRate ? Number(interestRate) / 100 : 5}%
                                </div>
                            </div>
                        </div>

                        {/* Progress to Next Level */}
                        {reputation && reputation.level < 5 && (
                            <div className="mt-6 p-4 bg-sol-dark rounded-xl border border-sol-primary/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">Progress to {getReputationLabel((reputation.level || 0) + 1)}</span>
                                    <span className="text-sol-primary text-sm font-bold">
                                        {reputation.total_loans ? Math.round((reputation.repaid_on_time / reputation.total_loans) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-sol-primary to-purple-500 h-3 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${reputation.total_loans ? Math.min(100, (reputation.repaid_on_time / reputation.total_loans) * 100) : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('borrow')}
                        className={`flex-1 py-4 rounded-xl font-semibold transition-all ${activeTab === 'borrow'
                            ? 'bg-sol-primary text-white'
                            : 'bg-sol-card text-gray-400 hover:text-white'
                            }`}
                    >
                        Collateral Loan
                    </button>
                    <button
                        onClick={() => setActiveTab('flashloan')}
                        className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'flashloan'
                            ? 'bg-sol-primary text-white'
                            : 'bg-sol-card text-gray-400 hover:text-white'
                            }`}
                    >
                        <Zap className="h-5 w-5" />
                        Flash Loan
                    </button>
                    <button
                        onClick={() => setActiveTab('myloans')}
                        className={`flex-1 py-4 rounded-xl font-semibold transition-all ${activeTab === 'myloans'
                            ? 'bg-sol-primary text-white'
                            : 'bg-sol-card text-gray-400 hover:text-white'
                            }`}
                    >
                        My Loans
                    </button>
                </div>

                {activeTab === 'borrow' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Loan Form */}
                        <div className="glass-card rounded-2xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Create Loan</h2>

                            {/* Collateral */}
                            <div className="mb-6">
                                <label className="block text-gray-400 mb-3 text-sm font-medium">Collateral</label>
                                <div className="bg-sol-card border border-sol-primary/30 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <select
                                            value={selectedCollateral}
                                            onChange={(e) => setSelectedCollateral(e.target.value)}
                                            className="bg-sol-dark border border-sol-primary/30 rounded-lg px-4 py-2 text-black"
                                        >
                                            <option>MNT</option>
                                            <option>USDC</option>
                                        </select>
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="0.0"
                                        value={collateralAmount}
                                        onChange={(e) => setCollateralAmount(e.target.value)}
                                        className="bg-transparent text-3xl font-bold text-white outline-none w-full"
                                    />
                                </div>
                            </div>

                            {/* Borrow Amount */}
                            <div className="mb-6">
                                <label className="block text-gray-400 mb-3 text-sm font-medium">Borrow Amount</label>
                                <div className="bg-sol-card border border-sol-primary/30 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <select
                                            value={selectedBorrow}
                                            onChange={(e) => setSelectedBorrow(e.target.value)}
                                            className="bg-sol-dark border border-sol-primary/30 rounded-lg px-4 py-2 text-black"
                                        >
                                            <option>USDC</option>
                                            <option>MNT</option>
                                        </select>
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="0.0"
                                        value={borrowAmount}
                                        onChange={(e) => setBorrowAmount(e.target.value)}
                                        className="bg-transparent text-3xl font-bold text-white outline-none w-full"
                                    />
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="mb-6">
                                <label className="block text-gray-400 mb-3 text-sm font-medium">Duration (Days)</label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full bg-sol-card border border-sol-primary/30 rounded-xl px-4 py-3 text-white"
                                >
                                    <option value="7">7 Days</option>
                                    <option value="14">14 Days</option>
                                    <option value="30">30 Days</option>
                                    <option value="60">60 Days</option>
                                    <option value="90">90 Days</option>
                                </select>
                            </div>

                            {/* Collateral Ratio Warning */}
                            {collateralAmount && borrowAmount && (
                                <div className={`mb-6 p-4 rounded-xl border ${calculateCollateralRatio() >= 150
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : 'bg-red-500/10 border-red-500/30'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        {calculateCollateralRatio() >= 150 ? (
                                            <CheckCircle className="h-5 w-5 text-green-400" />
                                        ) : (
                                            <AlertTriangle className="h-5 w-5 text-red-400" />
                                        )}
                                        <span className="text-white font-medium">
                                            Collateral Ratio: {calculateCollateralRatio().toFixed(0)}%
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {calculateCollateralRatio() >= 150
                                            ? 'Good! Your collateral meets the minimum requirement.'
                                            : 'Insufficient! Minimum 150% collateral required.'}
                                    </p>
                                </div>
                            )}

                            {/* Borrow Button */}
                            {isConnected ? (
                                <button
                                    onClick={handleCreateLoan}
                                    disabled={isCreating || !collateralAmount || !borrowAmount || calculateCollateralRatio() < 150}
                                    className="w-full bg-sol-primary hover:bg-sol-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Creating Loan...
                                        </>
                                    ) : (
                                        <>Borrow Now</>
                                    )}
                                </button>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-400">Please connect your wallet to borrow</p>
                                </div>
                            )}
                        </div>

                        {/* Loan Details */}
                        <div className="space-y-6">
                            <div className="glass-card rounded-xl p-6">
                                <h3 className="text-white font-bold mb-4">Loan Terms</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Interest Rate</span>
                                        <span className="text-white font-medium">
                                            {interestRate ? Number(interestRate) / 100 : 5}% APR
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Collateral Ratio</span>
                                        <span className="text-white font-medium">150% minimum</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Liquidation</span>
                                        <span className="text-white font-medium">After due date</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Reputation Bonus</span>
                                        <span className="text-green-400 font-medium">Up to 2% off per level</span>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield className="h-6 w-6 text-sol-primary" />
                                    <h3 className="text-white font-bold">How It Works</h3>
                                </div>
                                <ol className="space-y-3 text-gray-300 text-sm">
                                    <li className="flex gap-2">
                                        <span className="text-sol-primary font-bold">1.</span>
                                        Deposit collateral (minimum 150% of borrow amount)
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-sol-primary font-bold">2.</span>
                                        Receive borrowed tokens instantly
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-sol-primary font-bold">3.</span>
                                        Repay before due date to avoid liquidation
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-sol-primary font-bold">4.</span>
                                        Build reputation for better interest rates
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'flashloan' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Flash Loan Form */}
                        <div className="glass-card rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-yellow-500/20 p-3 rounded-full">
                                    <Zap className="h-6 w-6 text-yellow-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Flash Loan</h2>
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                                <p className="text-sm text-yellow-200">
                                    <strong>Flash loans</strong> must be borrowed and repaid within the same transaction. No collateral required!
                                </p>
                            </div>

                            {/* Token Selection */}
                            <div className="mb-6">
                                <label className="block text-gray-400 mb-3 text-sm font-medium">Token</label>
                                <div className="bg-sol-card border border-sol-primary/30 rounded-xl p-4">
                                    <select
                                        value={flashLoanToken}
                                        onChange={(e) => setFlashLoanToken(e.target.value)}
                                        className="w-full bg-sol-dark border border-sol-primary/30 rounded-lg px-4 py-3 text-white"
                                    >
                                        <option>USDC</option>
                                        <option>MNT</option>
                                    </select>
                                    {flashLoanLiquidity && (
                                        <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                                            <Droplet className="h-4 w-4" />
                                            Available: {parseFloat(formatEther(flashLoanLiquidity as bigint)).toFixed(2)} {flashLoanToken}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="mb-6">
                                <label className="block text-gray-400 mb-3 text-sm font-medium">Borrow Amount</label>
                                <div className="bg-sol-card border border-sol-primary/30 rounded-xl p-4">
                                    <input
                                        type="number"
                                        placeholder="0.0"
                                        value={flashLoanAmount}
                                        onChange={(e) => setFlashLoanAmount(e.target.value)}
                                        className="bg-transparent text-3xl font-bold text-white outline-none w-full"
                                    />
                                </div>
                            </div>

                            {/* Receiver Contract */}
                            <div className="mb-6">
                                <label className="block text-gray-400 mb-3 text-sm font-medium">Receiver Contract Address</label>
                                <input
                                    type="text"
                                    placeholder="0x..."
                                    value={receiverContract}
                                    onChange={(e) => setReceiverContract(e.target.value)}
                                    className="w-full bg-sol-card border border-sol-primary/30 rounded-xl px-4 py-3 text-white"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Contract must implement IFlashLoanReceiver interface
                                </p>
                            </div>

                            {/* Fee Display */}
                            {flashLoanAmount && (
                                <div className="mb-6 p-4 rounded-xl border border-green-500/30 bg-green-500/10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Flash Loan Fee (0.09%)</span>
                                        <span className="text-green-400 font-bold">{calculateFlashLoanFee()} {flashLoanToken}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-gray-400">Total to Repay</span>
                                        <span className="text-white font-bold">
                                            {(parseFloat(flashLoanAmount) + parseFloat(calculateFlashLoanFee())).toFixed(4)} {flashLoanToken}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Execute Button */}
                            {isConnected ? (
                                <button
                                    onClick={handleFlashLoan}
                                    disabled={isFlashLoaning || !flashLoanAmount || !receiverContract}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {isFlashLoaning ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Executing...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="h-5 w-5" />
                                            Execute Flash Loan
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-400">Please connect your wallet</p>
                                </div>
                            )}

                            {flashLoanSuccess && (
                                <div className="mt-4 p-4 rounded-xl border border-green-500/30 bg-green-500/10">
                                    <div className="flex items-center gap-2 text-green-400">
                                        <CheckCircle className="h-5 w-5" />
                                        <span className="font-medium">Flash loan executed successfully!</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Flash Loan Info */}
                        <div className="space-y-6">
                            <div className="glass-card rounded-xl p-6">
                                <h3 className="text-white font-bold mb-4">Your Flash Loan Stats</h3>
                                {flashLoanStats ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Total Flash Loans</span>
                                            <span className="text-white font-medium">{flashLoanStats[0].toString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Total Volume</span>
                                            <span className="text-white font-medium">
                                                {parseFloat(formatEther(flashLoanStats[1] as bigint)).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Fee Rate</span>
                                            <span className="text-green-400 font-medium">0.09%</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm">No flash loans taken yet</p>
                                )}
                            </div>

                            <div className="glass-card rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Zap className="h-6 w-6 text-yellow-400" />
                                    <h3 className="text-white font-bold">What are Flash Loans?</h3>
                                </div>
                                <ol className="space-y-3 text-gray-300 text-sm">
                                    <li className="flex gap-2">
                                        <span className="text-yellow-400 font-bold">1.</span>
                                        Borrow any amount without collateral
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-yellow-400 font-bold">2.</span>
                                        Execute your strategy (arbitrage, liquidation, etc.)
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-yellow-400 font-bold">3.</span>
                                        Repay loan + 0.09% fee in same transaction
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-yellow-400 font-bold">4.</span>
                                        If not repaid, entire transaction reverts
                                    </li>
                                </ol>
                            </div>

                            <div className="glass-card rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield className="h-6 w-6 text-sol-primary" />
                                    <h3 className="text-white font-bold">Use Cases</h3>
                                </div>
                                <ul className="space-y-2 text-gray-300 text-sm">
                                    <li className="flex gap-2">
                                        <span className="text-sol-primary">•</span>
                                        Arbitrage between DEXs
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-sol-primary">•</span>
                                        Collateral swap
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-sol-primary">•</span>
                                        Liquidations
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-sol-primary">•</span>
                                        Self-liquidation
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">My Active Loans</h2>

                        {loading ? (
                            <div className="text-center py-12">
                                <Loader2 className="h-8 w-8 text-sol-primary animate-spin mx-auto mb-4" />
                                <p className="text-gray-400">Loading your loans...</p>
                            </div>
                        ) : userLoansData.length > 0 ? (
                            <div className="space-y-4">
                                {userLoansData.map((loan) => {
                                    const dueDate = new Date((loan.start_time + loan.duration) * 1000);
                                    const isOverdue = dueDate < new Date() && loan.status === 'active';

                                    return (
                                        <div key={loan.id} className="bg-sol-card border border-sol-primary/30 rounded-xl p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <DollarSign className="h-8 w-8 text-sol-primary" />
                                                    <div>
                                                        <div className="text-white font-bold text-xl">
                                                            {loan.borrowed_amount} {loan.loan_id.includes('USDC') ? 'USDC' : 'MNT'}
                                                        </div>
                                                        <div className="text-gray-400 text-sm">
                                                            Collateral: {loan.collateral_amount} {loan.loan_id.includes('MNT') ? 'MNT' : 'USDC'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`px-4 py-2 rounded-full font-medium ${loan.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                    loan.status === 'repaid' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <div className="text-gray-400 text-sm mb-1">Interest Rate</div>
                                                    <div className="text-white font-medium">{loan.interest_rate}%</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-400 text-sm mb-1">Due Date</div>
                                                    <div className={`font-medium ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                                                        {dueDate.toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-400 text-sm mb-1">Duration</div>
                                                    <div className="text-white font-medium">{loan.duration / (24 * 60 * 60)} days</div>
                                                </div>
                                            </div>

                                            {loan.status === 'active' && (
                                                <button
                                                    onClick={() => handleRepayLoan(loan.loan_id)}
                                                    disabled={isRepaying}
                                                    className="w-full bg-sol-primary hover:bg-sol-primary/80 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                                >
                                                    {isRepaying ? (
                                                        <>
                                                            <Loader2 className="h-5 w-5 animate-spin" />
                                                            Repaying...
                                                        </>
                                                    ) : (
                                                        <>Repay Loan</>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <DollarSign className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">You don't have any loans yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

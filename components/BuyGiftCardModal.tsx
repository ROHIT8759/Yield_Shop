'use client';

import { useState } from 'react';
import { X, Gift, Loader2 } from 'lucide-react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { YIELDSHOP_ABI, ERC20_ABI, CONTRACTS } from '@/config/contracts';

interface BuyGiftCardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BuyGiftCardModal({ isOpen, onClose }: BuyGiftCardModalProps) {
    const { address, isConnected } = useAccount();
    const [retailer, setRetailer] = useState('Amazon');
    const [amount, setAmount] = useState('');
    const [paymentToken, setPaymentToken] = useState<'MNT' | 'USDC'>('USDC');
    const [step, setStep] = useState<'input' | 'approve' | 'purchase' | 'success'>('input');

    const tokenAddress = paymentToken === 'MNT' ? CONTRACTS.MNT : CONTRACTS.USDC;

    // Read token balance
    const { data: balance } = useReadContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    // Read allowance
    const { data: allowance } = useReadContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address ? [address, CONTRACTS.YIELDSHOP] : undefined,
    });

    // Approve token spending
    const {
        writeContract: approve,
        data: approveHash,
        isPending: isApprovePending
    } = useWriteContract();

    const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
        hash: approveHash,
    });

    // Purchase gift card
    const {
        writeContract: purchase,
        data: purchaseHash,
        isPending: isPurchasePending
    } = useWriteContract();

    const { isLoading: isPurchaseConfirming, isSuccess: isPurchaseSuccess } = useWaitForTransactionReceipt({
        hash: purchaseHash,
    });

    if (!isOpen) return null;

    const handleApprove = async () => {
        if (!amount) return;

        try {
            setStep('approve');
            approve({
                address: tokenAddress,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [CONTRACTS.YIELDSHOP, parseEther(amount)],
            });
        } catch (error) {
            console.error('Approval failed:', error);
            setStep('input');
        }
    };

    const handlePurchase = async () => {
        if (!amount || !retailer) return;

        try {
            setStep('purchase');
            purchase({
                address: CONTRACTS.YIELDSHOP,
                abi: YIELDSHOP_ABI,
                functionName: 'purchaseGiftCard',
                args: [retailer, parseEther(amount), tokenAddress],
            });
        } catch (error) {
            console.error('Purchase failed:', error);
            setStep('input');
        }
    };

    const needsApproval = allowance !== undefined &&
        amount !== '' &&
        allowance < parseEther(amount);

    const handleSubmit = async () => {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }

        if (needsApproval) {
            await handleApprove();
        } else {
            await handlePurchase();
        }
    };

    const isLoading = isApprovePending || isApproveConfirming || isPurchasePending || isPurchaseConfirming;

    if (isPurchaseSuccess && step !== 'success') {
        setStep('success');
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card rounded-2xl p-8 max-w-md w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>

                {step === 'success' ? (
                    <div className="text-center py-8">
                        <div className="mb-6 flex justify-center">
                            <div className="bg-green-500/20 p-4 rounded-full">
                                <Gift className="h-12 w-12 text-green-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h3>
                        <p className="text-gray-400 mb-6">
                            Your gift card has been purchased. You've earned {(parseFloat(amount) * 0.01).toFixed(2)} $SHOP tokens!
                        </p>
                        <button
                            onClick={() => {
                                onClose();
                                setStep('input');
                                setAmount('');
                            }}
                            className="bg-sol-primary hover:bg-sol-primary/80 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-6">Buy Gift Card</h2>

                        <div className="space-y-4">
                            {/* Retailer Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Retailer
                                </label>
                                <select
                                    value={retailer}
                                    onChange={(e) => setRetailer(e.target.value)}
                                    className="w-full bg-sol-card border border-sol-primary/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sol-primary"
                                    disabled={isLoading}
                                >
                                    <option value="Amazon">Amazon</option>
                                    <option value="Flipkart">Flipkart</option>
                                    <option value="Target">Target</option>
                                    <option value="Walmart">Walmart</option>
                                </select>
                            </div>

                            {/* Amount Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Amount (USD)
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-sol-card border border-sol-primary/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sol-primary"
                                    disabled={isLoading}
                                />
                                {balance && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Balance: {formatEther(balance as bigint)} {paymentToken}
                                    </p>
                                )}
                            </div>

                            {/* Payment Token Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Payment Token
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setPaymentToken('USDC')}
                                        className={`px-4 py-3 rounded-lg border transition-all ${paymentToken === 'USDC'
                                            ? 'bg-sol-primary border-sol-primary text-white'
                                            : 'bg-sol-card border-sol-primary/30 text-gray-400 hover:border-sol-primary/50'
                                            }`}
                                        disabled={isLoading}
                                    >
                                        USDC
                                    </button>
                                    <button
                                        onClick={() => setPaymentToken('MNT')}
                                        className={`px-4 py-3 rounded-lg border transition-all ${paymentToken === 'MNT'
                                            ? 'bg-sol-primary border-sol-primary text-white'
                                            : 'bg-sol-card border-sol-primary/30 text-gray-400 hover:border-sol-primary/50'
                                            }`}
                                        disabled={isLoading}
                                    >
                                        $MNT
                                    </button>
                                </div>
                            </div>

                            {/* Rewards Info */}
                            {amount && (
                                <div className="bg-sol-primary/10 border border-sol-primary/30 rounded-lg p-4">
                                    <p className="text-sm text-gray-400 mb-1">You will receive:</p>
                                    <p className="text-lg font-bold text-sol-primary">
                                        +{(parseFloat(amount) * 0.01).toFixed(2)} $SHOP tokens
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">1% instant reward for using crypto</p>
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={!amount || !isConnected || isLoading}
                                className="w-full bg-sol-primary hover:bg-sol-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        {step === 'approve' ? 'Approving...' : 'Processing...'}
                                    </>
                                ) : needsApproval ? (
                                    'Approve & Purchase'
                                ) : (
                                    'Purchase Gift Card'
                                )}
                            </button>

                            {!isConnected && (
                                <p className="text-sm text-yellow-400 text-center">
                                    Please connect your wallet to continue
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

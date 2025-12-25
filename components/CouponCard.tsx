'use client';

import { useReadContract } from 'wagmi';
import { CONTRACTS, YIELDSHOP_ABI } from '@/config/contracts';
import { formatEther } from 'viem';
import { Tag, Clock, BadgeCheck, ShoppingBag } from 'lucide-react';

interface CouponCardProps {
    couponId: bigint;
    onBuy: (couponId: number) => void;
    isBuyPending: boolean;
}

export default function CouponCard({ couponId, onBuy, isBuyPending }: CouponCardProps) {
    // Read individual coupon data from the blockchain
    const { data: couponData } = useReadContract({
        address: CONTRACTS.YIELDSHOP,
        abi: YIELDSHOP_ABI,
        functionName: 'couponListings',
        args: [couponId],
    });

    if (!couponData) {
        return (
            <div className="bg-sol-card border border-sol-primary/30 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-sol-primary/20 rounded mb-4"></div>
                <div className="h-4 bg-sol-primary/20 rounded mb-2"></div>
                <div className="h-4 bg-sol-primary/20 rounded mb-2"></div>
                <div className="h-10 bg-sol-primary/20 rounded mt-4"></div>
            </div>
        );
    }

    // Destructure coupon data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [id, seller, retailer, faceValue, sellingPrice, expiryDate, _couponCodeHash, active, sold] = couponData as [
        bigint,
        string,
        string,
        bigint,
        bigint,
        bigint,
        string,
        boolean,
        boolean
    ];

    // Skip if not active or already sold
    if (!active || sold) {
        return null;
    }

    // Calculate discount percentage
    const faceValueNum = Number(formatEther(faceValue));
    const sellingPriceNum = Number(formatEther(sellingPrice));
    const discount = ((faceValueNum - sellingPriceNum) / faceValueNum * 100).toFixed(0);

    // Calculate days remaining
    const expiryTimestamp = Number(expiryDate) * 1000;
    const now = Date.now();
    const daysRemaining = Math.max(0, Math.ceil((expiryTimestamp - now) / (1000 * 60 * 60 * 24)));

    // Format seller address
    const shortSeller = `${seller.slice(0, 6)}...${seller.slice(-4)}`;

    return (
        <div className="bg-sol-card border border-sol-primary/30 rounded-xl p-6 hover:border-sol-primary transition-all">
            {/* Header with Retailer */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-sol-primary" />
                    <h3 className="text-lg font-bold text-white">{retailer}</h3>
                </div>
                <div title="Verified Seller">
                    <BadgeCheck className="h-5 w-5 text-green-500" />
                </div>
            </div>

            {/* Discount Badge */}
            <div className="mb-4">
                <span className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {discount}% OFF
                </span>
            </div>

            {/* Pricing */}
            <div className="mb-4 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Face Value:</span>
                    <span className="text-white font-semibold">{faceValueNum.toFixed(2)} MNT</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Selling Price:</span>
                    <span className="text-sol-primary font-bold text-lg">{sellingPriceNum.toFixed(2)} MNT</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">You Save:</span>
                    <span className="text-green-500 font-semibold">{(faceValueNum - sellingPriceNum).toFixed(2)} MNT</span>
                </div>
            </div>

            {/* Expiry */}
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{daysRemaining} days remaining</span>
            </div>

            {/* Seller Info */}
            <div className="mb-4 pb-4 border-b border-sol-primary/20">
                <span className="text-xs text-gray-500">Seller: {shortSeller}</span>
            </div>

            {/* Buy Button */}
            <button
                onClick={() => onBuy(Number(id))}
                disabled={isBuyPending}
                className="w-full bg-sol-primary hover:bg-sol-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
                <Tag className="h-5 w-5" />
                {isBuyPending ? 'Processing...' : 'Buy Now'}
            </button>

            {/* Rewards Note */}
            <p className="mt-3 text-xs text-center text-gray-500">
                + 1% SHOP tokens on purchase
            </p>
        </div>
    );
}

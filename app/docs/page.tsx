'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Book, ShoppingCart, Coins, TrendingUp, Ticket, DollarSign, Zap, Shield, ChevronDown, ChevronUp, Wallet, Gift, CreditCard, Users, Lock } from 'lucide-react';

interface Section {
    id: string;
    title: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

export default function DocsPage() {
    const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');

    const toggleSection = (id: string) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    const sections: Section[] = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: <Book className="w-6 h-6" />,
            content: (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-blue-400">Welcome to YieldShop!</h3>
                    <p className="text-gray-300 leading-relaxed">
                        YieldShop is a revolutionary DeFi platform that combines e-commerce with yield generation.
                        Shop for gift cards, earn cashback that generates DeFi yield, trade coupons, and access
                        collateral-based lending - all powered by Mantle's high-performance L2 infrastructure.
                    </p>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-blue-400 mb-2">Quick Setup</h4>
                        <ol className="list-decimal list-inside space-y-2 text-gray-300">
                            <li>Connect your Web3 wallet (MetaMask, WalletConnect, etc.)</li>
                            <li>Switch to Mantle Network (Chain ID: 5003 for testnet)</li>
                            <li>Get test tokens from the <a href="https://www.hackquest.io/faucets/5003" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Mantle Faucet</a></li>
                            <li>Start shopping and earning rewards!</li>
                        </ol>
                    </div>
                </div>
            )
        },
        {
            id: 'shopping',
            title: 'Shopping Options',
            icon: <ShoppingCart className="w-6 h-6" />,
            content: (
                <div className="space-y-6">
                    <div className="border border-purple-500/30 rounded-lg p-6 bg-purple-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <Gift className="w-6 h-6 text-purple-400" />
                            <h4 className="text-xl font-semibold text-purple-400">Option A: Affiliate Cashback (Yield-Bearing)</h4>
                        </div>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span>Shop through affiliate links at Amazon, Flipkart, and more</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span><strong className="text-blue-400">Earn 1% instant cashback</strong> in stablecoins (USDT/USDC)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span>Cashback generates <strong className="text-green-400">DeFi yield for 30 days</strong> (return period)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span>Claim cashback + accumulated yield after 30 days</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span>Receive <strong className="text-yellow-400">1% SHOP tokens</strong> as bonus rewards</span>
                            </li>
                        </ul>
                    </div>

                    <div className="border border-cyan-500/30 rounded-lg p-6 bg-cyan-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCard className="w-6 h-6 text-cyan-400" />
                            <h4 className="text-xl font-semibold text-cyan-400">Option B: Crypto Gift Cards (Instant)</h4>
                        </div>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>Buy gift cards directly with <strong className="text-blue-400">MNT or USDC</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>Instant delivery of gift card codes to your wallet</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span><strong className="text-yellow-400">2-5% SHOP token rewards</strong> on every purchase</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>No waiting period - use gift cards immediately</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <p className="text-gray-300">
                            <strong className="text-yellow-400">💡 Pro Tip:</strong> Choose Option A for maximum returns if you can wait 30 days.
                            Choose Option B for instant rewards and immediate use.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'shop-tokens',
            title: 'SHOP Token Rewards',
            icon: <Coins className="w-6 h-6" />,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-300 leading-relaxed">
                        SHOP is YieldShop's native ERC20 reward token with a maximum supply of 1 billion tokens.
                        Earn SHOP tokens on every purchase and transaction on the platform.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/5">
                            <h4 className="text-lg font-semibold text-blue-400 mb-3">How to Earn SHOP</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li>• 1% on affiliate purchases</li>
                                <li>• 2-5% on gift card purchases</li>
                                <li>• 1% on coupon marketplace trades</li>
                                <li>• Bonus rewards for early adopters</li>
                            </ul>
                        </div>

                        <div className="border border-purple-500/30 rounded-lg p-4 bg-purple-500/5">
                            <h4 className="text-lg font-semibold text-purple-400 mb-3">Token Benefits</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li>• Governance rights (coming soon)</li>
                                <li>• Platform fee discounts</li>
                                <li>• Exclusive deals & promotions</li>
                                <li>• Tradeable on DEXs</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <p className="text-gray-300">
                            <strong className="text-green-400">🎯 Token Address:</strong> Check the platform for the official SHOP token contract address on Mantle Network.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'yield-generation',
            title: 'Yield Generation',
            icon: <TrendingUp className="w-6 h-6" />,
            content: (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-green-400">How DeFi Yield Works</h3>
                    <p className="text-gray-300 leading-relaxed">
                        When you choose Option A (Affiliate Cashback), your 1% cashback is automatically deposited into
                        our DeFi liquidity pool, where it generates yield for 30 days.
                    </p>

                    <div className="space-y-3">
                        <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/5">
                            <h4 className="text-lg font-semibold text-green-400 mb-2">The Process</h4>
                            <ol className="list-decimal list-inside space-y-2 text-gray-300">
                                <li>You make a purchase through affiliate links</li>
                                <li>1% cashback is credited to your account</li>
                                <li>Cashback enters the liquidity pool for 30 days</li>
                                <li>Pool generates yield through DeFi strategies</li>
                                <li>After 30 days, claim cashback + accumulated yield</li>
                            </ol>
                        </div>

                        <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/5">
                            <h4 className="text-lg font-semibold text-blue-400 mb-2">Expected Returns</h4>
                            <p className="text-gray-300">
                                Yield rates vary based on market conditions but typically range from 3-8% APY.
                                For a 30-day period, you can expect approximately 0.25-0.67% additional returns on your cashback.
                            </p>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                            <p className="text-gray-300">
                                <strong className="text-yellow-400">⚠️ Important:</strong> The 30-day lock period matches typical e-commerce return windows.
                                This ensures the liquidity pool can safely generate yield without risk of sudden withdrawals.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'coupon-marketplace',
            title: 'Coupon Marketplace',
            icon: <Ticket className="w-6 h-6" />,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-300 leading-relaxed">
                        Buy and sell unused coupons and gift cards in our peer-to-peer marketplace.
                        Get discounts on coupons or monetize ones you won't use.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="border border-purple-500/30 rounded-lg p-4 bg-purple-500/5">
                            <h4 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Selling Coupons
                            </h4>
                            <ol className="list-decimal list-inside space-y-2 text-gray-300">
                                <li>Navigate to Trading page</li>
                                <li>Click "List Coupon"</li>
                                <li>Enter coupon details & code</li>
                                <li>Set your price (below face value)</li>
                                <li>Coupon goes live in marketplace</li>
                                <li>Receive payment when sold (minus 2% fee)</li>
                            </ol>
                        </div>

                        <div className="border border-cyan-500/30 rounded-lg p-4 bg-cyan-500/5">
                            <h4 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5" />
                                Buying Coupons
                            </h4>
                            <ol className="list-decimal list-inside space-y-2 text-gray-300">
                                <li>Browse available coupons</li>
                                <li>Filter by retailer & category</li>
                                <li>Check discount percentage</li>
                                <li>Purchase with MNT or USDC</li>
                                <li>Coupon code revealed instantly</li>
                                <li>Earn 1% SHOP token rewards</li>
                            </ol>
                        </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-blue-400 mb-2">Marketplace Fees</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li>• <strong>Platform Fee:</strong> 2% on all transactions</li>
                            <li>• <strong>Buyer Rewards:</strong> 1% in SHOP tokens</li>
                            <li>• <strong>No Listing Fee:</strong> List coupons for free</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'lending',
            title: 'Collateral-Based Lending',
            icon: <DollarSign className="w-6 h-6" />,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-300 leading-relaxed">
                        Borrow stablecoins by depositing crypto as collateral. No credit checks required -
                        your on-chain reputation determines your interest rate.
                    </p>

                    <div className="space-y-3">
                        <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/5">
                            <h4 className="text-lg font-semibold text-green-400 mb-3">How to Borrow</h4>
                            <ol className="list-decimal list-inside space-y-2 text-gray-300">
                                <li>Navigate to Loans page</li>
                                <li>Connect your wallet</li>
                                <li>Deposit collateral (MNT, ETH, or other supported tokens)</li>
                                <li>Choose loan amount (up to 66% of collateral value)</li>
                                <li>Confirm transaction and receive stablecoins</li>
                            </ol>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/5">
                                <h4 className="text-lg font-semibold text-blue-400 mb-2">Loan Parameters</h4>
                                <ul className="space-y-2 text-gray-300">
                                    <li>• <strong>Min Collateral:</strong> 150%</li>
                                    <li>• <strong>Max LTV:</strong> 66%</li>
                                    <li>• <strong>Interest Rate:</strong> 1-5% based on reputation</li>
                                    <li>• <strong>Liquidation:</strong> Below 120% collateral</li>
                                </ul>
                            </div>

                            <div className="border border-purple-500/30 rounded-lg p-4 bg-purple-500/5">
                                <h4 className="text-lg font-semibold text-purple-400 mb-2">Reputation System</h4>
                                <ul className="space-y-2 text-gray-300">
                                    <li>• <strong>Level 0:</strong> 5% interest (new users)</li>
                                    <li>• <strong>Level 1:</strong> 4% interest</li>
                                    <li>• <strong>Level 2:</strong> 3% interest</li>
                                    <li>• <strong>Level 3+:</strong> 1-2% interest</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <p className="text-gray-300">
                                <strong className="text-red-400">⚠️ Liquidation Risk:</strong> If your collateral value drops below 120% of loan value,
                                your position may be liquidated. Monitor your collateral ratio closely and add more collateral if needed.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'flash-loans',
            title: 'Flash Loans',
            icon: <Zap className="w-6 h-6" />,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-300 leading-relaxed">
                        Flash loans are uncollateralized loans that must be borrowed and repaid within a single transaction.
                        Perfect for arbitrage, liquidations, and advanced DeFi strategies.
                    </p>

                    <div className="border border-yellow-500/30 rounded-lg p-4 bg-yellow-500/5">
                        <h4 className="text-lg font-semibold text-yellow-400 mb-3">Flash Loan Features</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li>• <strong>No Collateral Required:</strong> Borrow any amount without upfront capital</li>
                            <li>• <strong>0.09% Fee:</strong> Low-cost borrowing for quick strategies</li>
                            <li>• <strong>Atomic Transactions:</strong> Borrow & repay in one blockchain transaction</li>
                            <li>• <strong>Instant Execution:</strong> No waiting periods or approvals</li>
                        </ul>
                    </div>

                    <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/5">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">Common Use Cases</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li>• <strong>Arbitrage:</strong> Exploit price differences across DEXs</li>
                            <li>• <strong>Liquidations:</strong> Liquidate undercollateralized positions for profit</li>
                            <li>• <strong>Collateral Swap:</strong> Change loan collateral without closing position</li>
                            <li>• <strong>Debt Refinancing:</strong> Move loans to better rates</li>
                        </ul>
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                        <p className="text-gray-300">
                            <strong className="text-orange-400">🔧 Developer Tool:</strong> Flash loans require smart contract development.
                            You must implement the IFlashLoanReceiver interface and ensure your contract can repay the loan + fee in the same transaction.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'kyc',
            title: 'KYC & Verification',
            icon: <Shield className="w-6 h-6" />,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-300 leading-relaxed">
                        YieldShop implements optional KYC verification to comply with regulations and provide access to
                        premium features. KYC is stored on-chain for transparency and portability.
                    </p>

                    <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/5">
                        <h4 className="text-lg font-semibold text-green-400 mb-3">Why Complete KYC?</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li>• Access higher lending limits</li>
                            <li>• Better interest rates on loans</li>
                            <li>• Participate in exclusive promotions</li>
                            <li>• Build on-chain reputation faster</li>
                            <li>• Priority customer support</li>
                        </ul>
                    </div>

                    <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/5">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">KYC Process</h4>
                        <ol className="list-decimal list-inside space-y-2 text-gray-300">
                            <li>Navigate to KYC page</li>
                            <li>Connect your wallet</li>
                            <li>Submit required information</li>
                            <li>Upload verification documents</li>
                            <li>Wait for approval (24-48 hours)</li>
                            <li>Verification status recorded on-chain</li>
                        </ol>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Lock className="w-5 h-5 text-blue-400 mt-1" />
                            <div>
                                <h4 className="text-lg font-semibold text-blue-400 mb-2">Privacy & Security</h4>
                                <p className="text-gray-300">
                                    Your personal information is encrypted and stored securely. Only your verification status
                                    (verified/not verified) is recorded on-chain. We never share your data with third parties.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'security',
            title: 'Security & Safety',
            icon: <Lock className="w-6 h-6" />,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-300 leading-relaxed">
                        YieldShop is built with security as the top priority. All smart contracts are audited and
                        follow industry best practices.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/5">
                            <h4 className="text-lg font-semibold text-green-400 mb-3">Platform Security</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li>• OpenZeppelin contract libraries</li>
                                <li>• Regular security audits</li>
                                <li>• Multisig wallet controls</li>
                                <li>• Time-locked upgrades</li>
                                <li>• Bug bounty program</li>
                            </ul>
                        </div>

                        <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/5">
                            <h4 className="text-lg font-semibold text-blue-400 mb-3">User Safety Tips</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li>• Never share your private keys</li>
                                <li>• Double-check contract addresses</li>
                                <li>• Use hardware wallets for large amounts</li>
                                <li>• Monitor your collateral ratios</li>
                                <li>• Report suspicious activity</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <p className="text-gray-300">
                            <strong className="text-red-400">🚨 Phishing Warning:</strong> Always verify you're on the official YieldShop domain.
                            We will NEVER ask for your seed phrase or private keys. Be cautious of fake websites and social media scams.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'faq',
            title: 'FAQ',
            icon: <Book className="w-6 h-6" />,
            content: (
                <div className="space-y-4">
                    <div className="space-y-4">
                        <div className="border border-gray-700 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-blue-400 mb-2">What is Mantle Network?</h4>
                            <p className="text-gray-300">
                                Mantle is a high-performance Layer 2 blockchain that offers low transaction fees and fast confirmation times.
                                YieldShop is built on Mantle to provide users with affordable DeFi experiences.
                            </p>
                        </div>

                        <div className="border border-gray-700 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-blue-400 mb-2">How do I get MNT tokens?</h4>
                            <p className="text-gray-300">
                                You can get test MNT tokens from the <a href="https://www.hackquest.io/faucets/5003" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Mantle Faucet</a>.
                                For mainnet, you can bridge tokens from Ethereum or buy directly on exchanges.
                            </p>
                        </div>

                        <div className="border border-gray-700 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-blue-400 mb-2">Is my cashback guaranteed?</h4>
                            <p className="text-gray-300">
                                Yes, your 1% cashback is guaranteed after the 30-day return period. The cashback is locked in our smart contract
                                and automatically available for claim after 30 days plus any generated yield.
                            </p>
                        </div>

                        <div className="border border-gray-700 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-blue-400 mb-2">What happens if I get liquidated?</h4>
                            <p className="text-gray-300">
                                If your collateral ratio drops below 120%, your collateral will be sold to repay the loan. You'll lose your collateral
                                but won't owe any additional debt. Always monitor your positions and add collateral if needed.
                            </p>
                        </div>

                        <div className="border border-gray-700 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-blue-400 mb-2">Can I sell my SHOP tokens?</h4>
                            <p className="text-gray-300">
                                Yes! SHOP tokens are ERC20 tokens that can be traded on decentralized exchanges (DEXs).
                                You can also hold them for governance rights and platform benefits.
                            </p>
                        </div>

                        <div className="border border-gray-700 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-blue-400 mb-2">How are yield rates determined?</h4>
                            <p className="text-gray-300">
                                Yield rates vary based on DeFi market conditions, liquidity pool utilization, and lending demand.
                                The platform uses conservative strategies to ensure capital safety while maximizing returns.
                            </p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-black">
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            YieldShop Documentation
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400">
                        Everything you need to know about shopping, earning, and generating yield
                    </p>
                </div>

                {/* Documentation Sections */}
                <div className="space-y-4">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/50 backdrop-blur-sm"
                        >
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-6 hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-blue-400">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl font-semibold text-white">
                                        {section.title}
                                    </h2>
                                </div>
                                {expandedSection === section.id ? (
                                    <ChevronUp className="w-6 h-6 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-6 h-6 text-gray-400" />
                                )}
                            </button>

                            {expandedSection === section.id && (
                                <div className="p-6 pt-0 border-t border-gray-800">
                                    {section.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Support Section */}
                <div className="mt-12 border border-blue-500/30 rounded-lg p-8 bg-blue-500/5 text-center">
                    <h3 className="text-2xl font-semibold text-blue-400 mb-4">Need More Help?</h3>
                    <p className="text-gray-300 mb-6">
                        Can't find what you're looking for? Our support team is here to help!
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="mailto:support@yieldshop.io"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Email Support
                        </a>
                        <a
                            href="https://discord.gg/yieldshop"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                            Join Discord
                        </a>
                        <a
                            href="https://github.com/yieldshop"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            View on GitHub
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

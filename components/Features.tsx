import { Gift, RefreshCw, Zap, Coins } from 'lucide-react';

export default function Features() {
    return (
        <div id="features" className="py-24 bg-black relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="lg:text-center mb-16">
                    <h2 className="text-base text-blue-500 font-semibold tracking-widest uppercase animate-pulse">Features</h2>
                    <p className="mt-2 text-4xl leading-8 font-bold tracking-tight text-white sm:text-5xl">
                        Two Ways to Earn on <span className="text-blue-500">Mantle</span>
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-zinc-400 lg:mx-auto font-light">
                        Choose how you want to shop and earn. Whether it&apos;s cashback that grows or direct crypto payments, we&apos;ve got you covered.
                    </p>
                </div>

                <div className="mt-10">
                    <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                        <div className="glass-card p-8 rounded-2xl group cursor-pointer">
                            <dt>
                                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 mb-6">
                                    <RefreshCw className="h-7 w-7" aria-hidden="true" />
                                </div>
                                <p className="text-xl leading-6 font-bold text-white mb-4">Option A: Yield-Bearing Cashback</p>
                            </dt>
                            <dd className="text-base text-zinc-400 leading-relaxed">
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        <span>Shop at your favorite stores like Amazon &amp; Flipkart.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        <span>Earn cashback that is instantly staked on Mantle Network.</span>
                                    </li>
                                    <li className="flex items-start gap-2 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800 group-hover:border-blue-500/30 transition-colors">
                                        <span className="text-blue-400 mt-1">⚡</span>
                                        <span className="text-zinc-300"><strong>The Twist:</strong> While you wait for the return period, your cashback earns DeFi yields!</span>
                                    </li>
                                </ul>
                            </dd>
                        </div>

                        <div className="glass-card p-8 rounded-2xl group cursor-pointer">
                            <dt>
                                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 mb-6">
                                    <Gift className="h-7 w-7" aria-hidden="true" />
                                </div>
                                <p className="text-xl leading-6 font-bold text-white mb-4">Option B: Crypto Gift Cards</p>
                            </dt>
                            <dd className="text-base text-zinc-400 leading-relaxed">
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-500 mt-1">•</span>
                                        <span>Pay with $MNT or $USDC directly from your wallet.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-500 mt-1">•</span>
                                        <span>Instantly receive Gift Cards for top retailers.</span>
                                    </li>
                                    <li className="flex items-start gap-2 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800 group-hover:border-purple-500/30 transition-colors">
                                        <span className="text-purple-400 mt-1">🎁</span>
                                        <span className="text-zinc-300">Get 2-5% extra rewards in $SHOP tokens for using crypto.</span>
                                    </li>
                                </ul>
                            </dd>
                        </div>

                        <div className="glass-card p-8 rounded-2xl group cursor-pointer">
                            <dt>
                                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-green-500/10 text-green-500 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300 mb-6">
                                    <Zap className="h-7 w-7" aria-hidden="true" />
                                </div>
                                <p className="text-xl leading-6 font-bold text-white mb-4">Powered by Mantle</p>
                            </dt>
                            <dd className="text-base text-zinc-400 leading-relaxed">
                                Leveraging Mantle&apos;s low gas fees to process micro-rewards efficiently. No more waiting for high thresholds to cash out.
                            </dd>
                        </div>

                        <div className="glass-card p-8 rounded-2xl group cursor-pointer">
                            <dt>
                                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-orange-500/10 text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 mb-6">
                                    <Coins className="h-7 w-7" aria-hidden="true" />
                                </div>
                                <p className="text-xl leading-6 font-bold text-white mb-4">DeFi Integration</p>
                            </dt>
                            <dd className="text-base text-zinc-400 leading-relaxed">
                                Your pending funds work for you. We integrate with protocols like Lendle and mETH to generate yield on &quot;sleeping&quot; money.
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}

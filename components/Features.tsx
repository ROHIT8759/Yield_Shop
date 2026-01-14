import { Gift, RefreshCw, Zap, Coins, Shield, TrendingUp } from 'lucide-react';

export default function Features() {
    return (
        <div id="features" className="py-32 bg-black relative overflow-hidden">
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
            <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Enhanced Section Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-bold text-blue-400 tracking-wider uppercase">Core Features</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6">
                        Two Powerful Ways to
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 mt-2">
                            Earn on Mantle
                        </span>
                    </h2>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-zinc-400 font-light leading-relaxed">
                        Choose your preferred shopping experience. Whether it&apos;s yield-bearing cashback or instant crypto gift cards,
                        <span className="text-white font-semibold"> maximize your returns</span> with every purchase.
                    </p>
                </div>

                {/* Main Feature Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Option A - Yield-Bearing Cashback */}
                    <div className="glass-card-premium p-10 rounded-3xl group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <RefreshCw className="h-8 w-8" />
                                </div>
                                <span className="badge badge-info">Option A</span>
                            </div>

                            <h3 className="text-2xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 transition-all">
                                Yield-Bearing Cashback
                            </h3>

                            <p className="text-zinc-400 mb-6 leading-relaxed">
                                Shop at your favorite retailers and watch your cashback multiply through DeFi yields while you wait for the return period.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-black/30 border border-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <span className="text-blue-400 font-bold">1</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold mb-1">Shop & Earn</p>
                                        <p className="text-sm text-zinc-400">Purchase from Amazon, Flipkart, and more</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 rounded-xl bg-black/30 border border-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <span className="text-blue-400 font-bold">2</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold mb-1">Auto-Stake</p>
                                        <p className="text-sm text-zinc-400">Cashback instantly staked on Mantle</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 group-hover:border-blue-400/50 transition-colors">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-blue-300" />
                                    </div>
                                    <div>
                                        <p className="text-blue-100 font-bold mb-1">Earn DeFi Yields</p>
                                        <p className="text-sm text-blue-200">Your money works for you during the return period</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Option B - Crypto Gift Cards */}
                    <div className="glass-card-premium p-10 rounded-3xl group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <Gift className="h-8 w-8" />
                                </div>
                                <span className="badge badge-warning">Option B</span>
                            </div>

                            <h3 className="text-2xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
                                Crypto Gift Cards
                            </h3>

                            <p className="text-zinc-400 mb-6 leading-relaxed">
                                Pay directly with MNT or USDC and receive instant gift cards with bonus rewards in SHOP tokens.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-black/30 border border-purple-500/10 group-hover:border-purple-500/30 transition-colors">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <span className="text-purple-400 font-bold">1</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold mb-1">Pay with Crypto</p>
                                        <p className="text-sm text-zinc-400">Use MNT or USDC from your wallet</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 rounded-xl bg-black/30 border border-purple-500/10 group-hover:border-purple-500/30 transition-colors">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <span className="text-purple-400 font-bold">2</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold mb-1">Instant Delivery</p>
                                        <p className="text-sm text-zinc-400">Receive gift cards immediately</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 group-hover:border-purple-400/50 transition-colors">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                        <Coins className="w-4 h-4 text-purple-300" />
                                    </div>
                                    <div>
                                        <p className="text-purple-100 font-bold mb-1">Bonus Rewards</p>
                                        <p className="text-sm text-purple-200">Earn 2-5% extra in SHOP tokens</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Features Grid */}
                <div className="grid md:grid-cols-2 gap-8 mt-12">
                    <div className="glass-card p-8 rounded-2xl group cursor-pointer">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-500/10 text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h4 className="text-xl font-bold text-white">Lightning Fast</h4>
                        </div>
                        <p className="text-zinc-400 leading-relaxed">
                            Powered by Mantle&apos;s ultra-low gas fees. Process micro-rewards efficiently without high thresholds.
                        </p>
                    </div>

                    <div className="glass-card p-8 rounded-2xl group cursor-pointer">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                <Shield className="h-6 w-6" />
                            </div>
                            <h4 className="text-xl font-bold text-white">Fully Secured</h4>
                        </div>
                        <p className="text-zinc-400 leading-relaxed">
                            Your funds work for you through audited DeFi protocols like Lendle and mETH. Non-custodial and transparent.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

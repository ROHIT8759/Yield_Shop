'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Wallet, User, Copy, Check, DollarSign, Ticket, Shield } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';

export default function LandingNavbar() {
    const pathname = usePathname();
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const [mounted, setMounted] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [copiedShort, setCopiedShort] = useState(false);
    const [copiedFull, setCopiedFull] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        setMounted(true);

        // Track hash changes
        const handleHashChange = () => {
            setActiveSection(window.location.hash);
        };

        // Set initial hash
        setActiveSection(window.location.hash);

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleConnect = async () => {
        try {
            const injectedConnector = connectors[0]; // Use the first available connector
            if (injectedConnector) {
                await connect({ connector: injectedConnector });
            } else {
                alert('Please install MetaMask extension');
            }
        } catch (err) {
            console.error('Connection failed:', err);
            alert('Failed to connect to MetaMask. Please make sure MetaMask is installed and unlocked.');
        }
    };

    const copyToClipboard = async (text: string, isShort: boolean) => {
        try {
            await navigator.clipboard.writeText(text);
            if (isShort) {
                setCopiedShort(true);
                setTimeout(() => setCopiedShort(false), 2000);
            } else {
                setCopiedFull(true);
                setTimeout(() => setCopiedFull(false), 2000);
            }
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-blue-500/20 p-2 rounded-full group-hover:bg-blue-500/40 transition-all duration-300">
                                <ShoppingBag className="h-6 w-6 text-blue-500 group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-wider">YieldShop</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <a
                            href="#about"
                            className={`text-sm tracking-wide uppercase transition-colors pb-1 ${activeSection === '#about'
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-zinc-300 hover:text-blue-500'
                                }`}
                        >
                            About
                        </a>
                        <a
                            href="#features"
                            className={`text-sm tracking-wide uppercase transition-colors pb-1 ${activeSection === '#features'
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-zinc-300 hover:text-blue-500'
                                }`}
                        >
                            Features
                        </a>
                        <a
                            href="https://www.hackquest.io/faucets/5003"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-blue-500 transition-colors text-sm tracking-wide uppercase"
                        >
                            Faucet
                        </a>
                        <Link
                            href="/docs"
                            className="text-gray-300 hover:text-blue-500 transition-colors text-sm tracking-wide uppercase"
                        >
                            Docs
                        </Link>
                    </div>

                    <div className="flex items-center">
                        {!mounted ? (
                            <button
                                disabled
                                className="bg-zinc-800 text-zinc-400 px-6 py-2.5 rounded-xl border border-zinc-700 flex items-center gap-2 cursor-wait"
                            >
                                <Wallet className="h-5 w-5" />
                                <span className="hidden sm:inline">Loading...</span>
                            </button>
                        ) : mounted && isConnected ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2 bg-zinc-900/50 px-4 py-2.5 rounded-xl border border-zinc-800">
                                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                                    <span className="text-sm text-zinc-300 font-mono">
                                        {address?.slice(0, 6)}...{address?.slice(-4)}
                                    </span>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="bg-zinc-900/50 hover:bg-zinc-800/50 p-2.5 rounded-xl transition-all duration-300 border border-zinc-800 hover:border-zinc-700"
                                    >
                                        <User className="h-5 w-5 text-zinc-300" />
                                    </button>
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
                                            <div className="p-4 border-b border-zinc-800">
                                                <p className="text-xs text-zinc-400 mb-2">Wallet Address</p>
                                                <div className="flex items-center justify-between gap-2 bg-zinc-800/50 p-3 rounded-lg">
                                                    <span className="text-sm text-zinc-300 font-mono">
                                                        {address?.slice(0, 8)}...{address?.slice(-6)}
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(address?.slice(0, 8) + '...' + address?.slice(-6) || '', true)}
                                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                                    >
                                                        {copiedShort ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-4 border-b border-zinc-800">
                                                <p className="text-xs text-zinc-400 mb-2">Full Address</p>
                                                <div className="flex items-center justify-between gap-2 bg-zinc-800/50 p-3 rounded-lg">
                                                    <span className="text-xs text-zinc-300 font-mono break-all">
                                                        {address}
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(address || '', false)}
                                                        className="text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0"
                                                    >
                                                        {copiedFull ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-2">
                                                <Link
                                                    href="/shop"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-zinc-300 hover:text-white"
                                                >
                                                    <ShoppingBag className="h-5 w-5 text-blue-400" />
                                                    <div>
                                                        <p className="text-sm font-medium">My Orders</p>
                                                        <p className="text-xs text-zinc-500">View purchase history</p>
                                                    </div>
                                                </Link>
                                                <Link
                                                    href="/loans"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-zinc-300 hover:text-white"
                                                >
                                                    <DollarSign className="h-5 w-5 text-green-400" />
                                                    <div>
                                                        <p className="text-sm font-medium">My Loans</p>
                                                        <p className="text-xs text-zinc-500">Manage your loans</p>
                                                    </div>
                                                </Link>
                                                <Link
                                                    href="/trading"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-zinc-300 hover:text-white"
                                                >
                                                    <Ticket className="h-5 w-5 text-purple-400" />
                                                    <div>
                                                        <p className="text-sm font-medium">My Coupons</p>
                                                        <p className="text-xs text-zinc-500">Listed coupons</p>
                                                    </div>
                                                </Link>
                                                <Link
                                                    href="/kyc"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-zinc-300 hover:text-white"
                                                >
                                                    <Shield className="h-5 w-5 text-cyan-400" />
                                                    <div>
                                                        <p className="text-sm font-medium">KYC Status</p>
                                                        <p className="text-xs text-zinc-500">Verification details</p>
                                                    </div>
                                                </Link>
                                            </div>

                                            <div className="p-4 border-t border-zinc-800">
                                                <button
                                                    onClick={() => {
                                                        disconnect();
                                                        setUserMenuOpen(false);
                                                    }}
                                                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-lg transition-all duration-300 border border-red-500/30 hover:border-red-500/50 font-semibold text-sm"
                                                >
                                                    Disconnect Wallet
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : mounted ? (
                            <button
                                onClick={handleConnect}
                                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center gap-2 font-semibold"
                            >
                                <Wallet className="h-5 w-5" />
                                <span className="hidden sm:inline">Connect Wallet</span>
                                <span className="sm:hidden">Connect</span>
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </nav>
    );
}

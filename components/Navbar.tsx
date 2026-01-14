'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Wallet, Menu, X, User, Copy, Check, DollarSign, Ticket, Shield } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function Navbar() {
    const pathname = usePathname();
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [copiedShort, setCopiedShort] = useState(false);
    const [copiedFull, setCopiedFull] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        if (userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen]);

    const handleConnect = async () => {
        try {
            const injectedConnector = connectors[0];
            if (injectedConnector) {
                await connect({ connector: injectedConnector });
            } else {
                alert('Please install MetaMask extension');
            }
        } catch (err) {
            console.error('Connection failed:', err);
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

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/shop', label: 'Shop' },
        { href: '/trading', label: 'Trading' },
        { href: '/rwa', label: 'RWA' },
        { href: '/liquidity', label: 'Liquidity' },
        { href: '/loans', label: 'Loans' },
        { href: '/bridge', label: 'Bridge' },
    ];

    return (
        <nav className="glass-nav fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                                <ShoppingBag className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-wider">YieldShop</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-lg transition-all text-sm font-semibold tracking-wide uppercase ${isActive
                                        ? 'text-blue-400 bg-blue-500/10 border-b-2 border-blue-400'
                                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Wallet Connection */}
                    <div className="flex items-center gap-3">
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
                                <div className="relative" ref={userMenuRef}>
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

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6 text-white" />
                            ) : (
                                <Menu className="h-6 w-6 text-white" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-zinc-800/50">
                        <div className="flex flex-col space-y-2">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`px-4 py-3 rounded-lg transition-all font-semibold tracking-wide uppercase ${isActive
                                            ? 'text-blue-400 bg-blue-500/10 border-l-4 border-blue-400'
                                            : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                        {mounted && isConnected && (
                            <div className="mt-4 pt-4 border-t border-zinc-800/50">
                                <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-3 rounded-xl border border-zinc-800">
                                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                                    <span className="text-sm text-zinc-300 font-mono">
                                        {address?.slice(0, 6)}...{address?.slice(-4)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}

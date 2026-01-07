'use client';

import Link from 'next/link';
import { ShoppingBag, Wallet } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';

export default function LandingNavbar() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
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

    return (
        <nav className="glass-nav sticky top-0 z-50">
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
                        <Link href="#about" className="text-zinc-300 hover:text-blue-500 transition-colors text-sm tracking-wide uppercase">
                            About
                        </Link>
                        <Link href="#features" className="text-zinc-300 hover:text-blue-500 transition-colors text-sm tracking-wide uppercase">
                            Features
                        </Link>
                        <Link href="#faucet" className="text-gray-300 hover:text-sol-primary transition-colors text-sm tracking-wide uppercase">
                            Faucet
                        </Link>
                        <Link href="#docs" className="text-gray-300 hover:text-sol-primary transition-colors text-sm tracking-wide uppercase">
                            Docs
                        </Link>
                    </div>

                    <div className="flex items-center">
                        {!mounted ? (
                            <button
                                disabled
                                className="bg-sol-primary/20 text-white px-6 py-2 rounded-lg border border-sol-primary/40 flex items-center gap-2"
                            >
                                <Wallet className="h-5 w-5" />
                                Loading...
                            </button>
                        ) : isConnected ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-300">
                                    {address?.slice(0, 6)}...{address?.slice(-4)}
                                </span>
                                <button
                                    onClick={() => disconnect()}
                                    className="bg-sol-primary/20 hover:bg-sol-primary/40 text-white px-4 py-2 rounded-lg transition-all duration-300 border border-sol-primary/40 hover:shadow-lg hover:shadow-sol-primary/20"
                                >
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleConnect}
                                className="bg-sol-primary/20 hover:bg-sol-primary/40 text-white px-6 py-2 rounded-lg transition-all duration-300 border border-sol-primary/40 hover:shadow-lg hover:shadow-sol-primary/20 flex items-center gap-2"
                            >
                                <Wallet className="h-5 w-5" />
                                Connect MetaMask
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

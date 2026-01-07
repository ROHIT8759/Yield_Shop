import Link from 'next/link';
import { ShoppingBag, Twitter, Github, Send, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-black text-white border-t border-zinc-900">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-500/20 p-2 rounded-lg">
                                <ShoppingBag className="h-8 w-8 text-blue-500" />
                            </div>
                            <span className="text-2xl font-bold">YieldShop</span>
                        </div>
                        <p className="text-zinc-400 text-sm max-w-md mb-4">
                            Decentralized shopping with DeFi yield. Shop, earn, and trade on Mantle Network with cashback rewards and on-chain reputation.
                        </p>
                        <p className="text-zinc-500 text-xs italic">
                            &quot;Shop smart, earn yield, build reputation.&quot;
                        </p>

                        {/* Social Icons */}
                        <div className="flex space-x-4 mt-6">
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-400 hover:text-blue-500 transition-colors"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-400 hover:text-blue-500 transition-colors"
                            >
                                <Github className="h-5 w-5" />
                            </a>
                            <a
                                href="https://t.me"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-400 hover:text-blue-500 transition-colors"
                            >
                                <Send className="h-5 w-5" />
                            </a>
                            <a
                                href="mailto:contact@yieldshop.io"
                                className="text-gray-400 hover:text-sol-primary transition-colors"
                            >
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/" className="text-gray-400 hover:text-sol-primary transition-colors text-sm">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop" className="text-gray-400 hover:text-sol-primary transition-colors text-sm">
                                    Shop
                                </Link>
                            </li>
                            <li>
                                <Link href="/trading" className="text-gray-400 hover:text-sol-primary transition-colors text-sm">
                                    Trading
                                </Link>
                            </li>
                            <li>
                                <Link href="/bridge" className="text-gray-400 hover:text-sol-primary transition-colors text-sm">
                                    Bridge
                                </Link>
                            </li>
                            <li>
                                <Link href="/loans" className="text-gray-400 hover:text-sol-primary transition-colors text-sm">
                                    Lending
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Community Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Community</h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-sol-primary transition-colors text-sm"
                                >
                                    X (Twitter)
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://t.me"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-sol-primary transition-colors text-sm"
                                >
                                    Telegram
                                </a>
                            </li>
                            <li>
                                <a
                                    href="mailto:contact@yieldshop.io"
                                    className="text-gray-400 hover:text-sol-primary transition-colors text-sm"
                                >
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://docs.yieldshop.io"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-sol-primary transition-colors text-sm"
                                >
                                    Documentation
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-900 pt-8">
                    <p className="text-center text-gray-500 text-sm">
                        © 2025 YieldShop. All rights reserved. Built for Mantle Global Hackathon.
                    </p>
                </div>
            </div>
        </footer>
    );
}

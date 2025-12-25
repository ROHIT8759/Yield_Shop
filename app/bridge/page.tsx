'use client';

import { useState, useEffect } from 'react';
import { ArrowDownUp, ChevronDown, AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Chain {
    id: 1 | 5000 | 5001 | 137 | 42161;
    name: string;
    logo: string;
    nativeCurrency: string;
}

interface Token {
    symbol: string;
    name: string;
    logo: string;
    address: `0x${string}`;
}

const SUPPORTED_CHAINS: Chain[] = [
    {
        id: 1,
        name: 'Ethereum',
        logo: '⟠',
        nativeCurrency: 'ETH'
    },
    {
        id: 5000,
        name: 'Mantle',
        logo: '🔷',
        nativeCurrency: 'MNT'
    },
    {
        id: 5001,
        name: 'Mantle Testnet',
        logo: '🔷',
        nativeCurrency: 'MNT'
    },
    {
        id: 137,
        name: 'Polygon',
        logo: '⬣',
        nativeCurrency: 'MATIC'
    },
    {
        id: 42161,
        name: 'Arbitrum',
        logo: '🔵',
        nativeCurrency: 'ETH'
    }
];

const SUPPORTED_TOKENS: Token[] = [
    {
        symbol: 'USDC',
        name: 'USD Coin',
        logo: '💵',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    },
    {
        symbol: 'USDT',
        name: 'Tether USD',
        logo: '💲',
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    },
    {
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        logo: '🪙',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    }
];

export default function BridgePage() {
    const { address, isConnected, chain: currentChain } = useAccount();
    const { switchChain } = useSwitchChain();

    const [fromChain, setFromChain] = useState<Chain>(SUPPORTED_CHAINS[1]); // Mantle
    const [toChain, setToChain] = useState<Chain>(SUPPORTED_CHAINS[0]); // Ethereum
    const [selectedToken, setSelectedToken] = useState<Token>(SUPPORTED_TOKENS[0]);
    const [amount, setAmount] = useState('');
    const [showFromChainDropdown, setShowFromChainDropdown] = useState(false);
    const [showToChainDropdown, setShowToChainDropdown] = useState(false);
    const [showTokenDropdown, setShowTokenDropdown] = useState(false);
    const [bridgeTxHash, setBridgeTxHash] = useState<`0x${string}` | undefined>(undefined);

    const { data: balance } = useReadContract({
        address: selectedToken.address,
        abi: [
            {
                name: 'balanceOf',
                type: 'function',
                stateMutability: 'view',
                inputs: [{ name: 'account', type: 'address' }],
                outputs: [{ name: '', type: 'uint256' }]
            }
        ],
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    const { writeContract: bridgeTokens, data: hash } = useWriteContract();
    const { isLoading: isBridging, isSuccess: bridgeSuccess } = useWaitForTransactionReceipt({
        hash: hash || bridgeTxHash
    });

    useEffect(() => {
        if (hash) {
            setBridgeTxHash(hash);
        }
    }, [hash]);

    const handleSwitchChains = () => {
        const temp = fromChain;
        setFromChain(toChain);
        setToChain(temp);
    };

    const handleBridge = async () => {
        if (!address || !amount) return;

        // Check if user is on the correct source chain
        if (currentChain?.id !== fromChain.id) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await switchChain({ chainId: fromChain.id as any });
            } catch (error) {
                console.error('Failed to switch chain:', error);
                return;
            }
        }

        try {
            // In a real implementation, this would call a bridge contract
            // For now, we'll simulate with a token approval/transfer
            bridgeTokens({
                address: selectedToken.address,
                abi: [
                    {
                        name: 'transfer',
                        type: 'function',
                        stateMutability: 'nonpayable',
                        inputs: [
                            { name: 'to', type: 'address' },
                            { name: 'amount', type: 'uint256' }
                        ],
                        outputs: [{ name: '', type: 'bool' }]
                    }
                ],
                functionName: 'transfer',
                args: [address, parseEther(amount)],
            });
        } catch (error) {
            console.error('Bridge failed:', error);
        }
    };

    const estimatedTime = '3-5 minutes';
    const bridgeFee = amount ? (parseFloat(amount) * 0.001).toFixed(4) : '0';
    const receiveAmount = amount ? (parseFloat(amount) - parseFloat(bridgeFee)).toFixed(4) : '0';

    return (
        <div className="min-h-screen bg-sol-dark">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Cross-Chain <span className="text-sol-primary">Bridge</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Transfer tokens seamlessly between different blockchains
                    </p>
                </div>

                {/* Bridge Card */}
                <div className="glass-card rounded-2xl p-8 mb-8">
                    {bridgeSuccess ? (
                        <div className="text-center py-8">
                            <div className="bg-green-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                <CheckCircle className="h-12 w-12 text-green-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-3">Bridge Initiated!</h2>
                            <p className="text-gray-400 mb-6">
                                Your tokens are being bridged. This usually takes {estimatedTime}.
                            </p>
                            {bridgeTxHash && (
                                <a
                                    href={`https://explorer.mantle.xyz/tx/${bridgeTxHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sol-primary hover:text-sol-primary/80 mb-6"
                                >
                                    View Transaction <ExternalLink className="h-4 w-4" />
                                </a>
                            )}
                            <button
                                onClick={() => {
                                    setBridgeTxHash(undefined);
                                    setAmount('');
                                }}
                                className="bg-sol-primary hover:bg-sol-primary/80 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Bridge More Tokens
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* From Chain */}
                            <div className="mb-6">
                                <label className="block text-gray-400 mb-3 text-sm font-medium">From</label>
                                <div className="bg-sol-card border border-sol-primary/30 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="relative flex-1 mr-4">
                                            <button
                                                onClick={() => setShowFromChainDropdown(!showFromChainDropdown)}
                                                className="w-full bg-sol-dark border border-sol-primary/30 rounded-lg px-4 py-3 text-white flex items-center justify-between hover:border-sol-primary/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{fromChain.logo}</span>
                                                    <span className="font-medium">{fromChain.name}</span>
                                                </div>
                                                <ChevronDown className="h-5 w-5 text-gray-400" />
                                            </button>
                                            {showFromChainDropdown && (
                                                <div className="absolute top-full mt-2 w-full bg-sol-card border border-sol-primary/30 rounded-lg shadow-xl z-10">
                                                    {SUPPORTED_CHAINS.filter(c => c.id !== toChain.id).map((chain) => (
                                                        <button
                                                            key={chain.id}
                                                            onClick={() => {
                                                                setFromChain(chain);
                                                                setShowFromChainDropdown(false);
                                                            }}
                                                            className="w-full px-4 py-3 text-left hover:bg-sol-primary/20 flex items-center gap-2 text-white transition-colors"
                                                        >
                                                            <span className="text-2xl">{chain.logo}</span>
                                                            <span>{chain.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                                                className="bg-sol-dark border border-sol-primary/30 rounded-lg px-4 py-3 text-white flex items-center gap-2 hover:border-sol-primary/50 transition-colors"
                                            >
                                                <span className="text-xl">{selectedToken.logo}</span>
                                                <span className="font-medium">{selectedToken.symbol}</span>
                                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                            </button>
                                            {showTokenDropdown && (
                                                <div className="absolute top-full mt-2 right-0 bg-sol-card border border-sol-primary/30 rounded-lg shadow-xl z-10 min-w-[180px]">
                                                    {SUPPORTED_TOKENS.map((token) => (
                                                        <button
                                                            key={token.symbol}
                                                            onClick={() => {
                                                                setSelectedToken(token);
                                                                setShowTokenDropdown(false);
                                                            }}
                                                            className="w-full px-4 py-3 text-left hover:bg-sol-primary/20 flex items-center gap-2 text-white transition-colors"
                                                        >
                                                            <span className="text-xl">{token.logo}</span>
                                                            <div>
                                                                <div className="font-medium">{token.symbol}</div>
                                                                <div className="text-xs text-gray-500">{token.name}</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <input
                                            type="number"
                                            placeholder="0.0"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="bg-transparent text-3xl font-bold text-white outline-none w-full"
                                        />
                                        {balance && (
                                            <button
                                                onClick={() => setAmount(formatEther(balance as bigint))}
                                                className="text-sm text-sol-primary hover:text-sol-primary/80 font-medium"
                                            >
                                                MAX
                                            </button>
                                        )}
                                    </div>
                                    {balance && (
                                        <div className="text-sm text-gray-500 mt-2">
                                            Balance: {parseFloat(formatEther(balance as bigint)).toFixed(4)} {selectedToken.symbol}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Switch Button */}
                            <div className="flex justify-center -my-3 relative z-10">
                                <button
                                    onClick={handleSwitchChains}
                                    className="bg-sol-card border-2 border-sol-primary/30 p-3 rounded-full hover:bg-sol-primary/20 hover:border-sol-primary transition-all"
                                >
                                    <ArrowDownUp className="h-5 w-5 text-sol-primary" />
                                </button>
                            </div>

                            {/* To Chain */}
                            <div className="mb-6">
                                <label className="block text-gray-400 mb-3 text-sm font-medium">To</label>
                                <div className="bg-sol-card border border-sol-primary/30 rounded-xl p-4">
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowToChainDropdown(!showToChainDropdown)}
                                            className="w-full bg-sol-dark border border-sol-primary/30 rounded-lg px-4 py-3 text-white flex items-center justify-between hover:border-sol-primary/50 transition-colors mb-4"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{toChain.logo}</span>
                                                <span className="font-medium">{toChain.name}</span>
                                            </div>
                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                        </button>
                                        {showToChainDropdown && (
                                            <div className="absolute top-full mt-2 w-full bg-sol-card border border-sol-primary/30 rounded-lg shadow-xl z-10">
                                                {SUPPORTED_CHAINS.filter(c => c.id !== fromChain.id).map((chain) => (
                                                    <button
                                                        key={chain.id}
                                                        onClick={() => {
                                                            setToChain(chain);
                                                            setShowToChainDropdown(false);
                                                        }}
                                                        className="w-full px-4 py-3 text-left hover:bg-sol-primary/20 flex items-center gap-2 text-white transition-colors"
                                                    >
                                                        <span className="text-2xl">{chain.logo}</span>
                                                        <span>{chain.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-3xl font-bold text-white">
                                        {receiveAmount || '0.0'}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-2">
                                        You will receive ≈ {receiveAmount} {selectedToken.symbol}
                                    </div>
                                </div>
                            </div>

                            {/* Bridge Details */}
                            <div className="bg-sol-primary/10 border border-sol-primary/30 rounded-xl p-4 mb-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Bridge Fee (0.1%)</span>
                                    <span className="text-white font-medium">{bridgeFee} {selectedToken.symbol}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Estimated Time</span>
                                    <span className="text-white font-medium">{estimatedTime}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Route</span>
                                    <span className="text-white font-medium">Official Bridge</span>
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-gray-300">
                                    <p className="font-medium text-yellow-500 mb-1">Important</p>
                                    Make sure the destination address is correct. Bridge transactions cannot be reversed.
                                </div>
                            </div>

                            {/* Bridge Button */}
                            {isConnected ? (
                                <button
                                    onClick={handleBridge}
                                    disabled={isBridging || !amount || parseFloat(amount) <= 0}
                                    className="w-full bg-sol-primary hover:bg-sol-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {isBridging ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Bridging...
                                        </>
                                    ) : (
                                        <>Bridge Tokens</>
                                    )}
                                </button>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-400">Please connect your wallet to use the bridge</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card rounded-xl p-6">
                        <div className="bg-sol-primary/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                            <ArrowDownUp className="h-6 w-6 text-sol-primary" />
                        </div>
                        <h3 className="text-white font-bold mb-2">Fast & Secure</h3>
                        <p className="text-gray-400 text-sm">
                            Bridging typically completes in 3-5 minutes with secure smart contracts
                        </p>
                    </div>
                    <div className="glass-card rounded-xl p-6">
                        <div className="bg-sol-primary/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                            <span className="text-2xl">💰</span>
                        </div>
                        <h3 className="text-white font-bold mb-2">Low Fees</h3>
                        <p className="text-gray-400 text-sm">
                            Only 0.1% bridge fee, one of the lowest in the industry
                        </p>
                    </div>
                    <div className="glass-card rounded-xl p-6">
                        <div className="bg-sol-primary/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                            <span className="text-2xl">🔗</span>
                        </div>
                        <h3 className="text-white font-bold mb-2">Multi-Chain</h3>
                        <p className="text-gray-400 text-sm">
                            Support for Ethereum, Mantle, Polygon, Arbitrum and more
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

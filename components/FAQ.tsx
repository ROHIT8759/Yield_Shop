'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "What is YieldShop?",
        answer: "YieldShop is a decentralized DeFi platform on Mantle Network offering shopping with crypto cashback, real-time crypto trading, Real World Asset (RWA) tokenization, cross-chain bridging, and lending services."
    },
    {
        question: "How do I earn rewards?",
        answer: "You earn 1% cashback in cryptocurrency and 1% in SHOP tokens on every purchase. Additional earnings come from coupon marketplace listings, providing flash loan liquidity, and maintaining good lending reputation."
    },
    {
        question: "What are Real World Assets (RWA)?",
        answer: "RWA are tokenized real estate, bonds, invoices, and cash-flow assets that you can invest in. Complete KYC verification to access RWA trading, custody services, and yield distribution."
    },
    {
        question: "How does the lending system work?",
        answer: "Borrow cryptocurrency by providing 150% collateral. Your interest rate (starting at 5%) decreases by 0.5% per reputation level (0-5). Build reputation through successful repayments."
    },
    {
        question: "What are flash loans?",
        answer: "Flash loans are uncollateralized loans that must be repaid within the same transaction. They charge 0.09% fee and are ideal for arbitrage and liquidation strategies."
    },
    {
        question: "Which networks are supported?",
        answer: "Built on Mantle Network with cross-chain bridging to Ethereum, Polygon, and Arbitrum. Transfer assets seamlessly between networks."
    },
    {
        question: "How do I connect my wallet?",
        answer: "Click 'Connect Wallet' in the navigation bar. Ensure MetaMask is installed and unlocked, then approve the connection and add Mantle Network if needed."
    },
    {
        question: "Are my funds safe?",
        answer: "Smart contracts use OpenZeppelin security libraries. KYC-verified RWA trading adds compliance. As with all DeFi, invest responsibly and do your own research."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Everything you need to know about YieldShop
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:border-sol-primary/40"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-sol-primary/5 transition-colors"
                            >
                                <span className="text-lg font-semibold text-white pr-8">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`h-5 w-5 text-sol-primary flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'transform rotate-180' : ''
                                        }`}
                                />
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                    }`}
                            >
                                <div className="px-6 pb-5 text-gray-300 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-400 mb-4">Still have questions?</p>
                    <a
                        href="mailto:support@yieldshop.com"
                        className="inline-block bg-sol-primary/20 hover:bg-sol-primary/40 text-white px-8 py-3 rounded-lg transition-all duration-300 border border-sol-primary/40 hover:shadow-lg hover:shadow-sol-primary/20"
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        </section>
    );
}

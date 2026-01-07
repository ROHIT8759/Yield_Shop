'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Tag, TrendingUp, Filter, Ticket } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { YIELDSHOP_ABI, CONTRACTS } from '@/config/contracts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CouponCard from '@/components/CouponCard';

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
    retailer: string;
    category: string;
    cashbackRate: number;
}

const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Wireless Headphones',
        price: 89.99,
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1524678606372-56527bb42343?w=400&h=400&fit=crop',
        ],
        retailer: 'Amazon',
        category: 'Electronics',
        cashbackRate: 1
    },
    {
        id: '2',
        name: 'Smart Watch',
        price: 199.99,
        images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1508685572021-98d3b9d82993?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop',
        ],
        retailer: 'Flipkart',
        category: 'Electronics',
        cashbackRate: 1
    },
    {
        id: '3',
        name: 'Running Shoes',
        price: 79.99,
        images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1560769625-aa57a22490aa?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop',
        ],
        retailer: 'Amazon',
        category: 'Fashion',
        cashbackRate: 1
    },
    {
        id: '4',
        name: 'Coffee Maker',
        price: 49.99,
        images: [
            'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1520970014086-2208d157c9e2?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&h=400&fit=crop',
        ],
        retailer: 'Target',
        category: 'Home',
        cashbackRate: 1
    },
    {
        id: '5',
        name: 'Laptop Backpack',
        price: 39.99,
        images: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=400&h=400&fit=crop',
        ],
        retailer: 'Amazon',
        category: 'Accessories',
        cashbackRate: 1
    },
    {
        id: '6',
        name: 'Gaming Mouse',
        price: 59.99,
        images: [
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1615663245857-acda847b8e3b?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?w=400&h=400&fit=crop',
        ],
        retailer: 'Flipkart',
        category: 'Electronics',
        cashbackRate: 1
    },
    {
        id: '7',
        name: 'Yoga Mat',
        price: 29.99,
        images: [
            'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1593164842264-85460449a6a0?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1545205566-3b4555a585b7?w=400&h=400&fit=crop',
        ],
        retailer: 'Walmart',
        category: 'Sports',
        cashbackRate: 1
    },
    {
        id: '8',
        name: 'Bluetooth Speaker',
        price: 69.99,
        images: [
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1615557960916-5f4791effe9d?w=400&h=400&fit=crop',
        ],
        retailer: 'Amazon',
        category: 'Electronics',
        cashbackRate: 1
    }
];

const PLATFORM_FEE_RATE = 0.0186; // 1.86% platform fee

export default function ShopPage() {
    const { address, isConnected } = useAccount();
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRetailer, setSelectedRetailer] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [activeImage, setActiveImage] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'products' | 'coupons'>('products');
    const [showSellModal, setShowSellModal] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Coupon form states
    const [couponRetailer, setCouponRetailer] = useState('Amazon');
    const [couponFaceValue, setCouponFaceValue] = useState('');
    const [couponSellingPrice, setCouponSellingPrice] = useState('');
    const [couponExpiry, setCouponExpiry] = useState('');
    const [couponCode, setCouponCode] = useState('');

    // Get active coupons from blockchain
    const { data: activeCouponIds, refetch: refetchCoupons } = useReadContract({
        address: CONTRACTS.YIELDSHOP,
        abi: YIELDSHOP_ABI,
        functionName: 'getActiveCoupons',
    });

    // Record affiliate purchase
    const {
        writeContract: recordPurchase,
        data: purchaseHash,
        isPending: isPurchasePending
    } = useWriteContract();

    const { isLoading: isPurchaseConfirming, isSuccess: isPurchaseSuccess } = useWaitForTransactionReceipt({
        hash: purchaseHash,
    });

    // List coupon
    const {
        writeContract: listCoupon,
        data: listHash,
        isPending: isListPending
    } = useWriteContract();

    const { isSuccess: isListSuccess } = useWaitForTransactionReceipt({
        hash: listHash,
    });

    // Buy coupon
    const {
        writeContract: buyCoupon,
        data: buyHash,
        isPending: isBuyPending
    } = useWriteContract();

    const { isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
        hash: buyHash,
    });

    // Refetch coupons after successful listing or purchase
    useEffect(() => {
        if (isListSuccess || isBuySuccess) {
            refetchCoupons();
        }
    }, [isListSuccess, isBuySuccess, refetchCoupons]);

    const handleSellCoupon = async () => {
        if (!address) return;

        try {
            const faceValue = parseEther(couponFaceValue);
            const sellingPrice = parseEther(couponSellingPrice);
            const expiryTimestamp = Math.floor(new Date(couponExpiry).getTime() / 1000);

            listCoupon({
                address: CONTRACTS.YIELDSHOP,
                abi: YIELDSHOP_ABI,
                functionName: 'listCoupon',
                args: [couponRetailer, faceValue, sellingPrice, BigInt(expiryTimestamp), couponCode],
            });
        } catch (error) {
            console.error('Failed to list coupon:', error);
        }
    };

    const handleBuyCoupon = async (couponId: number) => {
        if (!address) return;

        try {
            buyCoupon({
                address: CONTRACTS.YIELDSHOP,
                abi: YIELDSHOP_ABI,
                functionName: 'buyCoupon',
                args: [BigInt(couponId), CONTRACTS.USDC],
            });
        } catch (error) {
            console.error('Failed to buy coupon:', error);
        }
    };

    const handleBuyNow = (product: Product) => {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }
        setSelectedProduct(product);
        setActiveImage(product.images[0]);
    };

    const handleRecordPurchase = async (product: Product) => {
        if (!address) return;

        try {
            const platformFee = product.price * PLATFORM_FEE_RATE;
            const totalAmount = product.price + platformFee;

            recordPurchase({
                address: CONTRACTS.YIELDSHOP,
                abi: YIELDSHOP_ABI,
                functionName: 'recordAffiliatePurchase',
                args: [address, product.retailer, parseEther(totalAmount.toString())],
            });
        } catch (error) {
            console.error('Failed to record purchase:', error);
        }
    };

    const filteredProducts = mockProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRetailer = selectedRetailer === 'all' || product.retailer === selectedRetailer;
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesRetailer && matchesCategory;
    });

    const categories = ['all', ...Array.from(new Set(mockProducts.map(p => p.category)))];
    const retailers = ['all', 'Amazon', 'Flipkart', 'Target', 'Walmart'];

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-black pt-24 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 md:mb-12 text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 md:mb-4 text-glow">
                            Shop & Earn Rewards
                        </h1>
                        <p className="text-gray-400 text-base md:text-lg px-4">
                            Buy products and earn 1% cashback + 1% $SHOP tokens on every purchase
                        </p>
                    </div>

                    {/* Cashback Banner */}
                    <div className="glass-card rounded-xl p-4 md:p-6 mb-6 md:mb-8 border-2 border-sol-primary/30">
                        <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
                            <div className="flex items-center gap-3 text-center md:text-left">
                                <div className="bg-sol-primary/20 p-2 md:p-3 rounded-full">
                                    <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-sol-primary" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-base md:text-lg">Earn 2% Total Rewards</h3>
                                    <p className="text-gray-400 text-xs md:text-sm">1% instant $SHOP tokens + 1% cashback with 5% APY</p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto justify-center">
                                <div className="bg-green-500/20 px-3 md:px-4 py-2 rounded-lg border border-green-500/30 flex-1 md:flex-initial text-center">
                                    <p className="text-green-400 text-xs font-medium">Cashback</p>
                                    <p className="text-white font-bold text-base md:text-lg">1%</p>
                                </div>
                                <div className="bg-sol-primary/20 px-3 md:px-4 py-2 rounded-lg border border-sol-primary/30 flex-1 md:flex-initial text-center">
                                    <p className="text-sol-primary text-xs font-medium">APY</p>
                                    <p className="text-white font-bold text-base md:text-lg">5%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'products'
                                ? 'bg-sol-primary text-white'
                                : 'bg-sol-card text-gray-400 hover:bg-sol-primary/20'
                                }`}
                        >
                            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                            Shop Products
                        </button>
                        <button
                            onClick={() => setActiveTab('coupons')}
                            className={`flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'coupons'
                                ? 'bg-sol-primary text-white'
                                : 'bg-sol-card text-gray-400 hover:bg-sol-primary/20'
                                }`}
                        >
                            <Ticket className="h-4 w-4 md:h-5 md:w-5" />
                            Coupon Marketplace
                        </button>
                    </div>

                    {activeTab === 'coupons' && (
                        <>
                            {/* Sell Coupon Button */}
                            <div className="mb-6 md:mb-8 flex justify-center md:justify-end">
                                <button
                                    onClick={() => setShowSellModal(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm md:text-base"
                                >
                                    <Tag className="h-4 w-4 md:h-5 md:w-5" />
                                    Sell Your Coupon
                                </button>
                            </div>

                            {/* Coupon Marketplace Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {activeCouponIds && (activeCouponIds as bigint[]).length > 0 ? (
                                    (activeCouponIds as bigint[]).map((couponId) => (
                                        <CouponCard
                                            key={couponId.toString()}
                                            couponId={couponId}
                                            onBuy={handleBuyCoupon}
                                            isBuyPending={isBuyPending}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-3 text-center py-12">
                                        <Ticket className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400">No coupons listed yet. Be the first to list one!</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'products' && (
                        <>
                            {/* Search and Filters */}
                            <div className="mb-6 md:mb-8 space-y-4">
                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-sol-card border border-sol-primary/30 rounded-lg pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-sol-primary"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
                                    <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                                        <Filter className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                                        <select
                                            value={selectedRetailer}
                                            onChange={(e) => setSelectedRetailer(e.target.value)}
                                            className="flex-1 sm:flex-initial bg-sol-card border border-sol-primary/30 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-sol-primary"
                                        >
                                            {retailers.map(retailer => (
                                                <option key={retailer} value={retailer}>
                                                    {retailer === 'all' ? 'All Retailers' : retailer}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full sm:w-auto bg-sol-card border border-sol-primary/30 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-sol-primary"
                                    >
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category === 'all' ? 'All Categories' : category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Products Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="glass-card rounded-xl overflow-hidden hover:border-sol-primary/50 transition-all duration-300 group">
                                        <div className="relative h-40 sm:h-48 bg-gray-800 overflow-hidden">
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                            <div className="absolute top-2 right-2 bg-green-500 px-2 md:px-3 py-1 rounded-full shadow-lg">
                                                <span className="text-white text-xs font-bold">1% Cashback</span>
                                            </div>
                                            <div className="absolute top-2 left-2 bg-sol-primary px-2 md:px-3 py-1 rounded-full shadow-lg">
                                                <span className="text-white text-xs font-bold">+1% $SHOP</span>
                                            </div>
                                        </div>

                                        <div className="p-3 md:p-3 md:p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-sol-primary font-semibold uppercase tracking-wide">{product.category}</span>
                                                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">{product.retailer}</span>
                                            </div>
                                            <h3 className="text-white font-bold text-base md:text-lg mb-2 md:mb-3 line-clamp-2">{product.name}</h3>

                                            <div className="flex items-baseline justify-between mb-2 md:mb-3">
                                                <span className="text-xl md:text-2xl font-bold text-white">${product.price}</span>
                                                <div className="text-right">
                                                    <p className="text-green-400 text-xs md:text-sm font-medium">
                                                        +${(product.price * product.cashbackRate / 100).toFixed(2)}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">cashback</p>
                                                    <p className="text-sol-primary text-xs md:text-sm font-medium">
                                                        +${(product.price * 0.01).toFixed(2)}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">$SHOP</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleBuyNow(product)}
                                                disabled={!mounted || !isConnected}
                                                className="w-full bg-sol-primary hover:bg-sol-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 md:py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                                            >
                                                <ShoppingCart className="h-4 w-4" />
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-400">No products found matching your criteria</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Sell Coupon Modal */}
            {showSellModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Sell Your Coupon</h2>

                        {isListSuccess ? (
                            <div className="text-center">
                                <div className="bg-green-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Tag className="h-8 w-8 text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Coupon Listed!</h3>
                                <p className="text-gray-400 mb-6">
                                    Your coupon has been listed on the marketplace successfully.
                                </p>
                                <button
                                    onClick={() => {
                                        setShowSellModal(false);
                                        // Reset form
                                        setCouponRetailer('Amazon');
                                        setCouponFaceValue('');
                                        setCouponSellingPrice('');
                                        setCouponExpiry('');
                                        setCouponCode('');
                                    }}
                                    className="bg-sol-primary hover:bg-sol-primary/80 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-gray-400 mb-2">Retailer</label>
                                        <select
                                            value={couponRetailer}
                                            onChange={(e) => setCouponRetailer(e.target.value)}
                                            className="w-full bg-sol-card border border-sol-primary/30 rounded-lg px-4 py-3 text-white"
                                        >
                                            <option>Amazon</option>
                                            <option>Flipkart</option>
                                            <option>Target</option>
                                            <option>Walmart</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 mb-2">Face Value (MNT)</label>
                                        <input
                                            type="number"
                                            placeholder="100"
                                            value={couponFaceValue}
                                            onChange={(e) => setCouponFaceValue(e.target.value)}
                                            className="w-full bg-sol-card border border-sol-primary/30 rounded-lg px-4 py-3 text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 mb-2">Selling Price (MNT)</label>
                                        <input
                                            type="number"
                                            placeholder="95"
                                            value={couponSellingPrice}
                                            onChange={(e) => setCouponSellingPrice(e.target.value)}
                                            className="w-full bg-sol-card border border-sol-primary/30 rounded-lg px-4 py-3 text-white"
                                        />
                                        {couponFaceValue && couponSellingPrice && Number(couponSellingPrice) >= Number(couponFaceValue) && (
                                            <p className="text-red-500 text-sm mt-1">Selling price must be less than face value</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 mb-2">Expiry Date</label>
                                        <input
                                            type="date"
                                            value={couponExpiry}
                                            onChange={(e) => setCouponExpiry(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full bg-sol-card border border-sol-primary/30 rounded-lg px-4 py-3 text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 mb-2">Coupon Code</label>
                                        <input
                                            type="text"
                                            placeholder="XXXX-XXXX-XXXX"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="w-full bg-sol-card border border-sol-primary/30 rounded-lg px-4 py-3 text-white"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            This will be hashed and stored securely. Buyer will receive it after purchase.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowSellModal(false)}
                                        disabled={isListPending}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSellCoupon}
                                        disabled={
                                            isListPending ||
                                            !couponRetailer ||
                                            !couponFaceValue ||
                                            !couponSellingPrice ||
                                            !couponExpiry ||
                                            !couponCode ||
                                            Number(couponSellingPrice) >= Number(couponFaceValue)
                                        }
                                        className="flex-1 bg-sol-primary hover:bg-sol-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        {isListPending ? 'Listing...' : 'List Coupon'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Purchase Confirmation Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        {isPurchaseSuccess ? (
                            <div className="text-center">
                                <div className="bg-green-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <TrendingUp className="h-8 w-8 text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Purchase Complete!</h3>
                                <p className="text-gray-400 mb-6">
                                    Your purchase has been processed successfully. You will start earning cashback and yield rewards!
                                </p>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="bg-sol-primary hover:bg-sol-primary/80 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Confirm Purchase</h2>

                                <div className="mb-4 md:mb-6">
                                    <div className="relative">
                                        <img
                                            src={activeImage || selectedProduct.images[0]}
                                            alt={selectedProduct.name}
                                            className="w-full h-48 md:h-64 object-cover rounded-lg mb-3 transition-opacity duration-300"
                                        />
                                    </div>
                                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-sol-primary/30 scollbar-track-transparent">
                                        {selectedProduct.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImage(img)}
                                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img
                                                        ? 'border-sol-primary opacity-100'
                                                        : 'border-transparent opacity-60 hover:opacity-100'
                                                    }`}
                                            >
                                                <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                    <h3 className="text-white font-bold text-base md:text-lg mb-2">{selectedProduct.name}</h3>
                                    <p className="text-gray-400 text-sm mb-2">From: {selectedProduct.retailer}</p>
                                    <p className="text-xl md:text-2xl font-bold text-white">${selectedProduct.price}</p>
                                </div>

                                <div className="bg-sol-primary/10 border border-sol-primary/30 rounded-lg p-3 md:p-4 mb-4 md:mb-6 text-sm md:text-base">
                                    <div className="flex justify-between mb-2 pb-2">
                                        <span className="text-gray-400">Product Price</span>
                                        <span className="text-white font-bold">
                                            ${selectedProduct.price.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-3 pb-3 border-b border-gray-700">
                                        <span className="text-gray-400">Platform Fee (1.86%)</span>
                                        <span className="text-gray-400">
                                            +${(selectedProduct.price * PLATFORM_FEE_RATE).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-3 pb-3 border-b border-gray-700">
                                        <span className="text-white font-bold text-lg">Total Amount</span>
                                        <span className="text-white font-bold text-lg">
                                            ${(selectedProduct.price + selectedProduct.price * PLATFORM_FEE_RATE).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="bg-green-500/10 rounded p-2 mb-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Cashback (1%)</span>
                                            <span className="text-green-400 font-bold">
                                                +${(selectedProduct.price * 0.01).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-400">$SHOP Tokens (1%)</span>
                                        <span className="text-sol-primary font-bold">
                                            ${(selectedProduct.price * 0.01).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Estimated Yield (30 days)</span>
                                        <span className="text-yellow-400 font-bold">
                                            ${((selectedProduct.price * 0.01 * 0.05) / 12).toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        $SHOP tokens sent instantly. Cashback + yield claimable after 30-day return period
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleRecordPurchase(selectedProduct)}
                                        disabled={isPurchasePending || isPurchaseConfirming}
                                        className="w-full bg-sol-primary hover:bg-sol-primary/80 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isPurchasePending || isPurchaseConfirming ? (
                                            'Processing Payment...'
                                        ) : (
                                            <>
                                                <ShoppingCart className="h-5 w-5" />
                                                Complete Purchase
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        className="w-full bg-sol-card hover:bg-sol-card/80 text-gray-400 px-6 py-3 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    Payment will be processed securely on the blockchain.
                                    Your cashback and rewards will be available after the 30-day return period.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}

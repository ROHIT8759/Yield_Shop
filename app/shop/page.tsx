'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, ExternalLink, Tag, TrendingUp, Filter, Ticket } from 'lucide-react';
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
    image: string;
    retailer: 'Amazon' | 'Flipkart' | 'Target' | 'Walmart';
    category: string;
    cashbackRate: number;
    productUrl: string;
}

const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Wireless Headphones',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        retailer: 'Amazon',
        category: 'Electronics',
        cashbackRate: 5,
        productUrl: 'https://amazon.com'
    },
    {
        id: '2',
        name: 'Smart Watch',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
        retailer: 'Flipkart',
        category: 'Electronics',
        cashbackRate: 5,
        productUrl: 'https://flipkart.com'
    },
    {
        id: '3',
        name: 'Running Shoes',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        retailer: 'Amazon',
        category: 'Fashion',
        cashbackRate: 5,
        productUrl: 'https://amazon.com'
    },
    {
        id: '4',
        name: 'Coffee Maker',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop',
        retailer: 'Target',
        category: 'Home',
        cashbackRate: 5,
        productUrl: 'https://target.com'
    },
    {
        id: '5',
        name: 'Laptop Backpack',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
        retailer: 'Amazon',
        category: 'Accessories',
        cashbackRate: 5,
        productUrl: 'https://amazon.com'
    },
    {
        id: '6',
        name: 'Gaming Mouse',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
        retailer: 'Flipkart',
        category: 'Electronics',
        cashbackRate: 5,
        productUrl: 'https://flipkart.com'
    },
    {
        id: '7',
        name: 'Yoga Mat',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
        retailer: 'Walmart',
        category: 'Sports',
        cashbackRate: 5,
        productUrl: 'https://walmart.com'
    },
    {
        id: '8',
        name: 'Bluetooth Speaker',
        price: 69.99,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
        retailer: 'Amazon',
        category: 'Electronics',
        cashbackRate: 5,
        productUrl: 'https://amazon.com'
    },
];

export default function ShopPage() {
    const { address, isConnected } = useAccount();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRetailer, setSelectedRetailer] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState<'products' | 'coupons'>('products');
    const [showSellModal, setShowSellModal] = useState(false);

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
    };

    const handleRecordPurchase = async (product: Product) => {
        if (!address) return;

        try {
            recordPurchase({
                address: CONTRACTS.YIELDSHOP,
                abi: YIELDSHOP_ABI,
                functionName: 'recordAffiliatePurchase',
                args: [address, product.retailer, parseEther(product.price.toString())],
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
            <div className="min-h-screen bg-sol-bg pt-24 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-glow">
                            Shop & Earn Rewards
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Buy from your favorite retailers and earn 5% cashback + 1% $SHOP tokens
                        </p>
                    </div>

                    {/* Cashback Banner */}
                    <div className="glass-card rounded-xl p-6 mb-8 border-2 border-sol-primary/30">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-sol-primary/20 p-3 rounded-full">
                                    <TrendingUp className="h-6 w-6 text-sol-primary" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">1% Cashback + 1% $SHOP Tokens</h3>
                                    <p className="text-gray-400 text-sm">Get instant $SHOP tokens + cashback with yield after 30 days</p>
                                </div>
                            </div>
                            <div className="bg-sol-primary px-6 py-3 rounded-lg">
                                <span className="text-white font-bold text-xl">5% APY</span>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'products'
                                ? 'bg-sol-primary text-white'
                                : 'bg-sol-card text-gray-400 hover:bg-sol-primary/20'
                                }`}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            Shop Products
                        </button>
                        <button
                            onClick={() => setActiveTab('coupons')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'coupons'
                                ? 'bg-sol-primary text-white'
                                : 'bg-sol-card text-gray-400 hover:bg-sol-primary/20'
                                }`}
                        >
                            <Ticket className="h-5 w-5" />
                            Coupon Marketplace
                        </button>
                    </div>

                    {activeTab === 'coupons' && (
                        <>
                            {/* Sell Coupon Button */}
                            <div className="mb-8 flex justify-end">
                                <button
                                    onClick={() => setShowSellModal(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                                >
                                    <Tag className="h-5 w-5" />
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
                            <div className="mb-8 space-y-4">
                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-sol-card border border-sol-primary/30 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sol-primary"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-5 w-5 text-gray-400" />
                                        <select
                                            value={selectedRetailer}
                                            onChange={(e) => setSelectedRetailer(e.target.value)}
                                            className="bg-sol-card border border-sol-primary/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sol-primary"
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
                                        className="bg-sol-card border border-sol-primary/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sol-primary"
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="glass-card rounded-xl overflow-hidden hover:border-sol-primary/50 transition-all duration-300 group">
                                        <div className="relative h-48 bg-gray-800 overflow-hidden">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                            <div className="absolute top-2 right-2 bg-sol-primary px-3 py-1 rounded-full">
                                                <span className="text-white text-xs font-bold">5% Cashback</span>
                                            </div>
                                            <div className="absolute top-2 left-2 bg-black/70 px-3 py-1 rounded-full">
                                                <span className="text-white text-xs">{product.retailer}</span>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <span className="text-xs text-sol-primary font-medium">{product.category}</span>
                                            <h3 className="text-white font-bold mt-1 mb-2 line-clamp-2">{product.name}</h3>

                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-2xl font-bold text-white">${product.price}</span>
                                                <div className="text-right">
                                                    <p className="text-green-400 text-sm font-medium">
                                                        +${(product.price * product.cashbackRate / 100).toFixed(2)}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">cashback</p>
                                                    <p className="text-sol-primary text-sm font-medium">
                                                        +${(product.price * 0.01).toFixed(2)}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">$SHOP tokens</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleBuyNow(product)}
                                                disabled={!isConnected}
                                                className="w-full bg-sol-primary hover:bg-sol-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
                    <div className="glass-card rounded-2xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-6">Sell Your Coupon</h2>

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
                    <div className="glass-card rounded-2xl p-8 max-w-md w-full">
                        {isPurchaseSuccess ? (
                            <div className="text-center">
                                <div className="bg-green-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <TrendingUp className="h-8 w-8 text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Purchase Recorded!</h3>
                                <p className="text-gray-400 mb-6">
                                    Your purchase has been recorded. Complete your purchase on {selectedProduct.retailer} to start earning yield!
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
                                <h2 className="text-2xl font-bold text-white mb-4">Confirm Purchase</h2>

                                <div className="mb-6">
                                    <img
                                        src={selectedProduct.image}
                                        alt={selectedProduct.name}
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                    />
                                    <h3 className="text-white font-bold text-lg mb-2">{selectedProduct.name}</h3>
                                    <p className="text-gray-400 text-sm mb-2">From: {selectedProduct.retailer}</p>
                                    <p className="text-2xl font-bold text-white">${selectedProduct.price}</p>
                                </div>

                                <div className="bg-sol-primary/10 border border-sol-primary/30 rounded-lg p-4 mb-6">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-400">Cashback (5%)</span>
                                        <span className="text-green-400 font-bold">
                                            ${(selectedProduct.price * 0.01).toFixed(2)}
                                        </span>
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
                                        onClick={() => {
                                            handleRecordPurchase(selectedProduct);
                                            window.open(selectedProduct.productUrl, '_blank');
                                        }}
                                        disabled={isPurchasePending || isPurchaseConfirming}
                                        className="w-full bg-sol-primary hover:bg-sol-primary/80 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isPurchasePending || isPurchaseConfirming ? (
                                            'Recording Purchase...'
                                        ) : (
                                            <>
                                                <ExternalLink className="h-5 w-5" />
                                                Continue to {selectedProduct.retailer}
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
                                    You&apos;ll be redirected to {selectedProduct.retailer} to complete your purchase.
                                    Make sure to complete the transaction to earn your cashback!
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

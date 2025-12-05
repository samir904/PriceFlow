// ✅ UPDATED: src/pages/user/Home.jsx
// Replace "Add to Cart" with "Buy Now" (Direct to Checkout)

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, getTopProducts } from '../../REDUX/SLICES/productSlice';
import { getActiveDiscounts } from '../../REDUX/SLICES/discountSlice';
import { getCategories } from '../../REDUX/SLICES/categorySlice';
import { addToWishlist, removeFromWishlist } from '../../REDUX/SLICES/userSlice';
import { createOrder } from '../../REDUX/SLICES/orderSlice';

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [buyingProductId, setBuyingProductId] = useState(null);
    
    // Product state
    const { products, loading: productsLoading, error: productsError } = useSelector((state) => state.product);
    
    // Discount state
    const { activeDiscounts, loading: discountsLoading } = useSelector((state) => state.discount);
    
    // Category state
    const { categories, loading: categoriesLoading } = useSelector((state) => state.category);

    // Wishlist state
    const { wishlist } = useSelector((state) => state.user);
    const { isAuthenticated } = useSelector((state) => state.auth);
    
    // Order state
    const { loading: orderLoading } = useSelector((state) => state.order);

    useEffect(() => {
        dispatch(getProducts());
        // dispatch(getTopProducts(10));
        dispatch(getActiveDiscounts());
        dispatch(getCategories());
    }, [dispatch]);

    // Helper function to get discount for product
    const getProductDiscount = (productId) => {
        const discount = activeDiscounts?.find(d => 
            d.applicableProducts?.includes(productId)
        );
        return discount;
    };

    // Helper function to check if product is in wishlist
    const isInWishlist = (productId) => {
        return wishlist?.some(item => item._id === productId);
    };

    // Handle add/remove wishlist
    const handleWishlistToggle = (e, productId) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Please login to add items to wishlist');
            return;
        }
        
        if (isInWishlist(productId)) {
            dispatch(removeFromWishlist(productId));
        } else {
            dispatch(addToWishlist(productId));
        }
    };

    // Handle Buy Now (Direct Checkout)
    const handleBuyNow = (e, product) => {
        e.preventDefault();

        if (!isAuthenticated) {
            alert('Please login to checkout');
            navigate('/login');
            return;
        }

        // Create order directly
        const orderData = {
            items: [
                {
                    product: product._id,
                    quantity: 1,
                    price: product.pricing.sellingPrice
                }
            ],
            shippingAddress: {
                fullName: '',
                phone: '',
                email: '',
                street: '',
                city: '',
                state: '',
                country: 'India',
                postalCode: ''
            },
            billingAddress: {
                fullName: '',
                phone: '',
                email: '',
                street: '',
                city: '',
                state: '',
                country: 'India',
                postalCode: ''
            },
            paymentMethod: 'cod'
        };

        setBuyingProductId(product._id);
        
        // Redirect to checkout with product info
        navigate('/checkout', { 
            state: { 
                quickBuyProduct: {
                    _id: product._id,
                    name: product.name,
                    price: product.pricing.sellingPrice,
                    quantity: 1
                }
            } 
        });
    };

    return (
        <div className="min-h-screen bg-yellow-50">
            {/* ============================================
                HERO SECTION
                ============================================ */}
            <section className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-12 md:py-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">Smart Pricing Platform</h1>
                            <p className="text-lg mb-6 text-teal-100">Optimize your prices with AI-powered analytics and real-time market insights</p>
                            <div className="flex gap-4">
                                <Link to="/register" className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                                    Get Started
                                </Link>
                                <button className="border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-800 transition">
                                    Learn More
                                </button>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center justify-center">
                            <div className="text-6xl">📊</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================
                FEATURED DISCOUNTS SECTION
                ============================================ */}
            {activeDiscounts && activeDiscounts.length > 0 && !discountsLoading && (
                <section className="bg-red-50 py-8 px-4 md:px-8 border-b-4 border-red-300">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
                            🎉 Featured Discounts
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {activeDiscounts.slice(0, 4).map((discount) => (
                                <div key={discount._id} className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition">
                                    <div className="text-sm font-semibold text-red-600 mb-2">
                                        Code: <span className="text-lg">{discount.code}</span>
                                    </div>
                                    <div className="text-3xl font-bold text-red-600 mb-2">
                                        {discount.value}% OFF
                                    </div>
                                    <p className="text-xs text-gray-600 mb-3">
                                        {discount.description}
                                    </p>
                                    <div className="text-xs text-gray-500 mb-3">
                                        Valid until: {new Date(discount.validUntil).toLocaleDateString()}
                                    </div>
                                    <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition text-sm font-medium">
                                        Apply Code
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================
                CATEGORIES SECTION (DYNAMIC)
                ============================================ */}
            {!categoriesLoading && categories && categories.length > 0 && (
                <section className="py-12 px-4 md:px-8">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8">Browse Categories</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {categories.map((category) => (
                                <Link 
                                    key={category._id} 
                                    to={`/category/${category.slug}`}
                                    className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition cursor-pointer"
                                >
                                    <div className="text-4xl mb-2">
                                        {category.name === 'electronics' && '📱'}
                                        {category.name === 'fashion' && '👕'}
                                        {category.name === 'home' && '🏠'}
                                        {category.name === 'books' && '📚'}
                                        {category.name === 'sports' && '⚽'}
                                        {!['electronics', 'fashion', 'home', 'books', 'sports'].includes(category.name) && '📦'}
                                    </div>
                                    <p className="font-semibold text-sm text-gray-700 capitalize">
                                        {category.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {category.totalProducts || 0} products
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================
                FEATURED PRODUCTS SECTION (DYNAMIC)
                ============================================ */}
            <section className="py-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
                    
                    {/* Loading State */}
                    {productsLoading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse h-80">
                                    <div className="bg-gray-200 h-48"></div>
                                    <div className="p-4 space-y-2">
                                        <div className="bg-gray-200 h-4 rounded"></div>
                                        <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {productsError && !productsLoading && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                            ⚠️ Error loading products: {productsError}
                        </div>
                    )}

                   {/* Products Grid */}
{products && products.length > 0 && !productsLoading && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 8).map((product) => {
            const discount = getProductDiscount(product._id);
            const inWishlist = isInWishlist(product._id);
            return (
                <Link key={product._id} to={`/product/${product._id}`}>
                    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition h-full flex flex-col relative group">
                       {/* Display all images */}
{product.images && product.images.length > 0 ? (
    <div className="flex overflow-x-auto">
        {product.images.map((image, idx) => (
            <img
                key={idx}
                src={image.secure_url}
                alt={image.alt}
                className="w-80 h-60 object-cover"
            />
        ))}
    </div>
) : (
    <span className="text-4xl">📦</span>
)}


                        {/* Product Details */}
                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                {product.name}
                            </h3>

                            {/* Description */}
                            <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                                {product.description}
                            </p>

                            {/* SKU */}
                            <p className="text-xs text-gray-500 mb-3">
                                SKU: {product.sku}
                            </p>

                            {/* Pricing */}
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    {discount ? (
                                        <>
                                            <span className="text-lg font-bold text-teal-600">
                                                ₹{Math.round(product.pricing.sellingPrice * (1 - discount.value / 100))}
                                            </span>
                                            <span className="text-xs text-gray-500 line-through ml-2">
                                                ₹{product.pricing.sellingPrice}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-lg font-bold text-teal-600">
                                            ₹{product.pricing.sellingPrice}
                                        </span>
                                    )}
                                </div>
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                                    ⭐ {product.ratings?.average || 0}
                                </span>
                            </div>

                            {/* Stock Status */}
                            <div className="text-xs mb-3">
                                {product.stock.available > 0 ? (
                                    <span className="text-green-600 font-semibold">
                                        ✅ In Stock ({product.stock.available})
                                    </span>
                                ) : (
                                    <span className="text-red-600 font-semibold">
                                        ❌ Out of Stock
                                    </span>
                                )}
                            </div>

                            {/* Warranty & Return Info */}
                            <div className="text-xs text-gray-500 mb-3 space-y-1">
                                {product.warranty && (
                                    <p>🛡️ {product.warranty.period} {product.warranty.unit} warranty</p>
                                )}
                                {product.returnPolicy?.returnable && (
                                    <p>↩️ {product.returnPolicy.returnDays} days return</p>
                                )}
                            </div>

                            {/* BUY NOW Button */}
                            <button 
                                onClick={(e) => handleBuyNow(e, product)}
                                disabled={product.stock.available === 0 || orderLoading === product._id}
                                className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition font-medium text-sm mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Buy this product now"
                            >
                                {orderLoading === product._id ? (
                                    <span>⏳ Processing...</span>
                                ) : product.stock.available > 0 ? (
                                    <span>💳 Buy Now</span>
                                ) : (
                                    <span>Out of Stock</span>
                                )}
                            </button>
                        </div>
                    </div>
                </Link>
            );
        })}
    </div>
)}

                </div>
            </section>

            {/* ============================================
                WHY CHOOSE US SECTION
                ============================================ */}
            <section className="bg-gray-900 text-white py-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 text-center">Why Choose PriceFlow?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-5xl mb-4">🎯</div>
                            <h3 className="text-xl font-bold mb-2">Smart Pricing</h3>
                            <p className="text-gray-400">AI-powered algorithms optimize your prices in real-time</p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl mb-4">📈</div>
                            <h3 className="text-xl font-bold mb-2">Boost Revenue</h3>
                            <p className="text-gray-400">Increase profit margins with dynamic pricing strategies</p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl mb-4">🛡️</div>
                            <h3 className="text-xl font-bold mb-2">Secure & Reliable</h3>
                            <p className="text-gray-400">Enterprise-grade security for your business data</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================
                CTA SECTION
                ============================================ */}
            <section className="bg-teal-600 text-white py-12 px-4 md:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Pricing?</h2>
                    <p className="text-lg mb-8 text-teal-100">Join thousands of sellers using PriceFlow to optimize their pricing strategy</p>
                    <Link to="/register" className="inline-block bg-white text-teal-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                        Start Free Trial
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
import { useState, useEffect } from "react";
import { productsAPI } from "../api/products";
import AddProductModal from "./AddProductModal";
import SellProductModal from "./SellProductModal";

export default function MarketContent() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [marketplaceEnabled, setMarketplaceEnabled] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    const baseUrl = apiUrl.replace("/api", "");

    useEffect(() => {
        checkMarketplaceStatus();
    }, []);

    const checkMarketplaceStatus = async () => {
        try {
            const status = await productsAPI.getStatus();
            setMarketplaceEnabled(status.marketplace_enabled);
            if (status.marketplace_enabled) {
                fetchProducts();
            } else {
                setIsLoading(false);
            }
        } catch (err) {
            // If 403, marketplace is disabled
            if (err.response?.status === 403) {
                setMarketplaceEnabled(false);
            } else {
                setError("Marketplace holatini tekshirishda xato");
            }
            setIsLoading(false);
        }
    };

    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await productsAPI.getAll();
            setProducts(data);
        } catch (err) {
            if (err.response?.status === 403) {
                setMarketplaceEnabled(false);
            } else {
                setError("Mahsulotlarni yuklashda xato");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddProduct = async (productData, imageFile) => {
        try {
            await productsAPI.create(productData, imageFile);
            await fetchProducts();
            setIsAddModalOpen(false);
        } catch (err) {
            throw err;
        }
    };

    const handleSellProduct = async (productId, quantity, paymentMethod) => {
        try {
            await productsAPI.sell(productId, quantity, paymentMethod);
            await fetchProducts();
            setIsSellModalOpen(false);
        } catch (err) {
            throw err;
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?")) {
            return;
        }
        try {
            await productsAPI.delete(productId);
            await fetchProducts();
        } catch (err) {
            setError("Mahsulotni o'chirishda xato");
        }
    };

    const handleRestockProduct = async (productId) => {
        const amount = window.prompt("Qancha mahsulot qo'shmoqchisiz?", "10");
        if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
            return;
        }
        try {
            await productsAPI.restock(productId, parseInt(amount));
            await fetchProducts();
        } catch (err) {
            setError("Mahsulot qo'shishda xato");
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("uz-UZ").format(price);
    };

    const filteredProducts = products.filter((product) => {
        const query = searchQuery.toLowerCase();
        return (
            product.name?.toLowerCase().includes(query) ||
            product.supplier_name?.toLowerCase().includes(query)
        );
    });

    // If marketplace is disabled
    if (!marketplaceEnabled && !isLoading) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Market
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Mahsulotlarni boshqaring va sotuvlarni kuzating
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100">
                        <span className="text-3xl">🛒</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Marketplace yoqilmagan
                    </h3>
                    <p className="text-gray-600">
                        Bu funksiya zal uchun hali yoqilmagan. Super admin bilan bog'laning.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Market
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Mahsulotlarni boshqaring va sotuvlarni kuzating
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 sm:gap-3">
                    <button
                        onClick={() => setIsSellModalOpen(true)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Sotish</span>
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex-1 sm:flex-none px-4 py-2 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                        style={{ backgroundColor: "#f0453f" }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = "#d63a34")}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = "#f0453f")}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Qo'shish</span>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Mahsulot qidirish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 sm:py-3 pl-10 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="underline">
                        Yopish
                    </button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(240, 69, 63, 0.1)" }}>
                            <span className="text-xl">📦</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Jami mahsulot</p>
                            <p className="text-xl font-bold text-gray-900">{products.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
                            <span className="text-xl">✅</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Mavjud</p>
                            <p className="text-xl font-bold text-gray-900">
                                {products.filter(p => p.current_amount > 0).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
                            <span className="text-xl">💰</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Foyda</p>
                            <p className="text-xl font-bold text-green-600">
                                {formatPrice(products.reduce((sum, p) => {
                                    const soldAmount = p.total_amount - p.current_amount;
                                    const profit = (p.selling_price - p.purchase_price) * soldAmount;
                                    return sum + profit;
                                }, 0))} so'm
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Mahsulotlar ro'yxati
                    </h3>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-gray-600">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{ borderColor: "#f0453f" }}></div>
                        Yuklanmoqda...
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-gray-600">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100">
                            <span className="text-3xl">📦</span>
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-1">
                            {searchQuery ? "Mahsulot topilmadi" : "Mahsulotlar yo'q"}
                        </p>
                        <p className="text-sm text-gray-500">
                            {searchQuery ? "Boshqa so'z bilan qidiring" : "Yangi mahsulot qo'shishni boshlang"}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Mahsulot
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Sotish narxi
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Xarid narxi
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Mavjud / Jami
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Yetkazuvchi
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider sticky right-0 bg-gray-50">
                                            Amallar
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {product.image_path ? (
                                                        <img
                                                            src={`${baseUrl}${product.image_path}`}
                                                            alt={product.name}
                                                            className="w-10 h-10 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                                                            <span className="text-lg">📦</span>
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-gray-900 text-sm">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                                {formatPrice(product.selling_price)} so'm
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatPrice(product.purchase_price)} so'm
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.current_amount === 0
                                                    ? "bg-red-100 text-red-800"
                                                    : product.current_amount <= 5
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-green-100 text-green-800"
                                                    }`}>
                                                    {product.current_amount} / {product.total_amount}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {product.supplier_name || "—"}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right sticky right-0 bg-white">
                                                <div className="flex items-center justify-end gap-4">
                                                    <button
                                                        onClick={() => handleRestockProduct(product.id)}
                                                        className="text-green-600 hover:text-green-800 transition"
                                                        title="Qo'shish"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="text-red-600 hover:text-red-800 transition"
                                                        title="O'chirish"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden divide-y divide-gray-200">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-start gap-3">
                                        {product.image_path ? (
                                            <img
                                                src={`${baseUrl}${product.image_path}`}
                                                alt={product.name}
                                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gray-100 flex-shrink-0">
                                                <span className="text-2xl">📦</span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                                            <p className="text-sm text-green-600 font-medium">
                                                {formatPrice(product.selling_price)} so'm
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Xarid: {formatPrice(product.purchase_price)} so'm
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.current_amount === 0
                                                    ? "bg-red-100 text-red-800"
                                                    : product.current_amount <= 5
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-green-100 text-green-800"
                                                    }`}>
                                                    {product.current_amount} / {product.total_amount}
                                                </span>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => handleRestockProduct(product.id)}
                                                        className="text-green-600 hover:text-green-800 p-1"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="text-red-600 hover:text-red-800 p-1"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            {product.supplier_name && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Yetkazuvchi: {product.supplier_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddProduct}
            />
            <SellProductModal
                isOpen={isSellModalOpen}
                onClose={() => setIsSellModalOpen(false)}
                onSubmit={handleSellProduct}
                products={products.filter(p => p.current_amount > 0)}
            />
        </div>
    );
}

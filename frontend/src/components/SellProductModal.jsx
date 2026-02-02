import { useState, memo } from "react";

const SellProductModal = memo(function SellProductModal({ isOpen, onClose, onSubmit, products }) {
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const selectedProductData = products.find(p => p.id === selectedProduct);

    const formatPrice = (price) => {
        return new Intl.NumberFormat("uz-UZ").format(price);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!selectedProduct) {
            setError("Mahsulotni tanlang");
            return;
        }

        if (quantity < 1) {
            setError("Miqdor kamida 1 bo'lishi kerak");
            return;
        }

        if (selectedProductData && quantity > selectedProductData.current_amount) {
            setError(`Yetarli mahsulot yo'q. Mavjud: ${selectedProductData.current_amount}`);
            return;
        }

        setLoading(true);

        try {
            await onSubmit(selectedProduct, quantity, paymentMethod);

            // Reset form
            setSelectedProduct("");
            setQuantity(1);
            setPaymentMethod("cash");
        } catch (err) {
            setError(err.response?.data?.detail || err.message || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedProduct("");
        setQuantity(1);
        setPaymentMethod("cash");
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Mahsulot sotish
                        </h2>
                        <p className="text-gray-600 text-xs sm:text-sm mt-1">
                            Mahsulotni va miqdorni tanlang
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Product Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Mahsulot <span className="text-red-600">*</span>
                        </label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                            required
                        >
                            <option value="">Mahsulotni tanlang</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} - {formatPrice(product.selling_price)} so'm ({product.current_amount} ta mavjud)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selected Product Info */}
                    {selectedProductData && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-200">
                                    <span className="text-xl">📦</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{selectedProductData.name}</p>
                                    <p className="text-sm text-green-600">{formatPrice(selectedProductData.selling_price)} so'm</p>
                                    <p className="text-xs text-gray-500">Mavjud: {selectedProductData.current_amount} ta</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Miqdori <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={quantity}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setQuantity(value === '' ? '' : parseInt(value));
                            }}
                            onBlur={(e) => {
                                if (e.target.value === '' || parseInt(e.target.value) < 1) {
                                    setQuantity(1);
                                }
                            }}
                            placeholder="Miqdorni kiriting"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-lg font-medium"
                            required
                        />
                        {selectedProductData && (
                            <p className="text-xs text-gray-500 mt-1 text-center">
                                Maksimum: {selectedProductData.current_amount} ta
                            </p>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            To'lov usuli <span className="text-red-600">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("cash")}
                                className={`p-3 border rounded-lg font-medium transition flex items-center justify-center gap-2 ${paymentMethod === "cash"
                                    ? "border-green-500 bg-green-50 text-green-700"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                💵 Naqd
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("card")}
                                className={`p-3 border rounded-lg font-medium transition flex items-center justify-center gap-2 ${paymentMethod === "card"
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                💳 Karta
                            </button>
                        </div>
                    </div>

                    {/* Total Price */}
                    {selectedProductData && quantity > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Jami summa:</span>
                                <span className="text-xl font-bold text-green-600">
                                    {formatPrice(selectedProductData.selling_price * quantity)} so'm
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedProduct}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {loading ? "Sotilyapti..." : "Sotish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default SellProductModal;

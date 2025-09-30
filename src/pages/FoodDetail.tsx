import React, { useState } from "react";
import { useCart } from "@/hooks/useCart";

interface Category {
  name: string;
  description: string;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  status: string;
  category: Category;
}

interface FoodDetailProps {
  item: MenuItem | null;
  onClose: () => void;
}

const FoodDetail: React.FC<FoodDetailProps> = ({ item, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  if (!item) return null;

  const handleAddToCart = () => {
    // Thêm vào giỏ hàng với số lượng đã chọn
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      description: item.description,
    }, quantity);
    
    // Đóng popup sau khi thêm
    onClose();
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const totalPrice = item.price * quantity;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 safe-area-padding"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Chi tiết món ăn</h2>
          <button
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition duration-200"
            onClick={onClose}
            aria-label="Đóng"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Hình ảnh */}
        <div className="relative">
          <img
            src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop"}
            alt={item.name}
            className="w-full h-48 sm:h-56 object-cover"
          />
          {/* Badge trạng thái */}
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                item.status === "Available"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {item.status === "Available" ? "Có sẵn" : "Hết hàng"}
            </span>
          </div>
        </div>

        {/* Nội dung */}
        <div className="p-4 sm:p-6">
          {/* Tên món và giá */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{item.name}</h1>
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-amber-600">
                {item.price.toLocaleString('vi-VN')} VND
              </span>
            </div>
          </div>

          {/* Mô tả */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Mô tả</h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              {item.description}
            </p>
          </div>

          {/* Thông tin danh mục */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Danh mục</h3>
            <p className="text-gray-600 text-sm">{item.category.name}</p>
          </div>

          {/* Chọn số lượng - Chỉ hiện khi có sẵn */}
          {item.status === "Available" && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Số lượng</h3>
              <div className="flex items-center justify-between max-w-xs">
                <button
                  onClick={decrementQuantity}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition duration-200"
                  aria-label="Giảm số lượng"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                
                <span className="text-xl font-semibold text-gray-900 min-w-12 text-center">
                  {quantity}
                </span>
                
                <button
                  onClick={incrementQuantity}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition duration-200"
                  aria-label="Tăng số lượng"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer với nút hành động */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 font-medium text-sm sm:text-base order-2 sm:order-1"
            >
              Đóng
            </button>
            
            <button
              onClick={handleAddToCart}
              disabled={item.status !== "Available"}
              className={`px-6 py-3 rounded-lg transition duration-200 font-medium text-sm sm:text-base flex items-center justify-center gap-2 ${
                item.status === "Available"
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } order-1 sm:order-2 flex-1`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {item.status === "Available" 
                ? `Thêm vào giỏ - ${totalPrice.toLocaleString('vi-VN')} VND`
                : "Hết hàng"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetail;
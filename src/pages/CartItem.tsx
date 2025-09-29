import React from "react";
import { useNavigate } from "react-router-dom";

// Mock data
const mockCartItems = [
  {
    id: 1,
    name: "Pâté Gan Gà",
    price: 185000,
    quantity: 2,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    description: "Pâté mịn với gan gà, rượu Brandy, ăn kèm bánh mì nướng giòn"
  },
  {
    id: 3,
    name: "Salad Caprese", 
    price: 165000,
    quantity: 1,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    description: "Cà chua tươi, Mozzarella di Bufala, lá húng quế tươi và dầu ô liu nguyên chất"
  }
];

const CartItem: React.FC = () => {
  const navigate = useNavigate();
  
  const totalItems = mockCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = mockCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 safe-area-padding">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h1 className="text-xl font-semibold text-gray-900">Order</h1>
            
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>
        </div>
      </div>

      {/* Cart Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {mockCartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-6">Hãy thêm món ăn vào giỏ hàng của bạn</p>
            <button
              onClick={() => navigate("/menu")}
              className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition"
            >
              Quay lại thực đơn
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {mockCartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mt-1">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-3">
                          <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          
                          <span className="font-medium text-sm w-8 text-center">{item.quantity}</span>
                          
                          <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-amber-600 font-semibold text-sm sm:text-base">
                            {(item.price * item.quantity).toLocaleString()} USD
                          </p>
                          <p className="text-gray-500 text-xs">
                            {item.price.toLocaleString()} USD/món
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tổng đơn hàng</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính ({totalItems} món):</span>
                  <span className="text-gray-900">{totalPrice.toLocaleString()} USD</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thời gian phục vụ ước tính:</span>
                  <span className="text-gray-900">10-15 Phút</span>
                </div>
            
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span className="text-gray-900">Tổng cộng</span>
                  <span className="text-amber-600">{totalPrice.toLocaleString()} USD</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button className="w-full bg-amber-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-amber-600 transition duration-200 active:scale-95">
              Tiến hành đặt món
            </button>
          </>
        )}
      </div>

      <style>{`
        .safe-area-padding {
          padding-left: env(safe-area-inset-left, 0px);
          padding-right: env(safe-area-inset-right, 0px);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CartItem;
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";

const CartItem: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getTotalItems, 
    getTotalPrice,
    handleCheckout,
    showOrderSuccess,
    closeOrderSuccess
  } = useCart();
  
  const totalItems = getTotalItems();
  const subtotal = getTotalPrice();
  const tax = Math.round(subtotal * 0.1); // 10% tax
  const total = subtotal + tax;

  const handleIncrease = (id: number, currentQuantity: number) => {
    updateQuantity(id, currentQuantity + 1);
  };

  const handleDecrease = (id: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(id, currentQuantity - 1);
    } else {
      removeFromCart(id);
    }
  };

  const handleRemove = (id: number) => {
    removeFromCart(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 safe-area-padding">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
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
            
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      {/* Order Success Popup */}
      {showOrderSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Đặt hàng thành công!</h3>
              <p className="text-gray-600 mb-6">Cảm ơn quý khách đã sử dụng dịch vụ của nhà hàng</p>
              <button
                onClick={() => {
                  closeOrderSuccess();
                  navigate("/menu");
                }}
                className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition duration-200"
              >
                Quay lại menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order của bạn</h1>
          <p className="text-gray-600">Kiểm tra và xác nhận đơn</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Order trống</h2>
            <p className="text-gray-500 mb-6">Hãy thêm món ăn vào Order của bạn</p>
            <button
              onClick={() => navigate("/menu")}
              className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition"
            >
              Quay lại thực đơn
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items với ảnh */}
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex gap-4">
                    {/* Ảnh món ăn */}
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-red-500 hover:text-red-700 ml-4 p-1 flex-shrink-0"
                          title="Xóa món"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-amber-600 font-semibold text-lg">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                        </span>
                        
                        {/* Quantity Controls với màu sắc rõ ràng */}
                        <div className="flex items-center space-x-3 bg-amber-50 rounded-full px-3 py-1">
                          <button 
                            onClick={() => handleDecrease(item.id, item.quantity)}
                            className="w-8 h-8 rounded-full bg-white border border-amber-300 flex items-center justify-center text-amber-600 hover:bg-amber-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          
                          <span className="font-bold text-amber-700 text-sm min-w-8 text-center">
                            {item.quantity}
                          </span>
                          
                          <button 
                            onClick={() => handleIncrease(item.id, item.quantity)}
                            className="w-8 h-8 rounded-full bg-amber-500 border border-amber-500 flex items-center justify-center text-white hover:bg-amber-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-300 my-6"></div>

            {/* Order Summary - Đã bỏ phí giao hàng */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="font-semibold text-xl text-gray-900 mb-6 text-center">
                Tổng đơn({totalItems} món)
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 text-lg">Tạm tính</span>
                  <span className="text-gray-900 font-semibold text-lg">{subtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 text-lg">Thuế</span>
                  <span className="text-gray-900 font-semibold text-lg">{tax.toLocaleString('vi-VN')} đ</span>
                </div>
                
                <div className="h-px bg-gray-200 my-4"></div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-900 font-bold text-xl">Tổng cộng</span>
                  <span className="text-amber-600 font-bold text-xl">{total.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            {/* Delivery Info - Order tại quán */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  </div>
                  <div>
                    <span className="text-gray-600">Thời gian phục vụ: </span>
                    <span className="text-gray-900 font-medium">15-20 phút</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-600">Địa điểm: </span>
                    <span className="text-gray-900 font-medium">Order tại quán</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button 
              onClick={handleCheckout}
              className="w-full bg-amber-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-amber-600 transition duration-200 active:scale-95 shadow-lg"
            >
              Xác nhận đặt món
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
      `}</style>
    </div>
  );
};

export default CartItem;
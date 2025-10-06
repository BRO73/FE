import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

const CartItem: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getTotalItems, 
    getTotalPrice,
    clearCart,
    updateNote
  } = useCart();
  
  const [showStaffPopup, setShowStaffPopup] = useState(false);
  const [hasConfirmedOrder, setHasConfirmedOrder] = useState<boolean>(() => {
    const saved = localStorage.getItem('hasConfirmedOrder');
    return saved ? JSON.parse(saved) : false;
  });
  const [confirmedQuantities, setConfirmedQuantities] = useState<{[key: number]: number}>(() => {
    const saved = localStorage.getItem('confirmedQuantities');
    return saved ? JSON.parse(saved) : {};
  });
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  
  // State cho chức năng chỉnh sửa ghi chú
  const [editingNoteForItemId, setEditingNoteForItemId] = useState<number | null>(null);
  const [noteInputs, setNoteInputs] = useState<{ [key: number]: string }>({});
  
  const totalItems = getTotalItems();
  const subtotal = getTotalPrice();
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  // Lưu trạng thái vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('hasConfirmedOrder', JSON.stringify(hasConfirmedOrder));
  }, [hasConfirmedOrder]);

  useEffect(() => {
    localStorage.setItem('confirmedQuantities', JSON.stringify(confirmedQuantities));
  }, [confirmedQuantities]);

  // Đồng bộ confirmed quantities với cart items
  const updateConfirmedQuantities = useCallback(() => {
    if (hasConfirmedOrder) {
      const newConfirmedQuantities = { ...confirmedQuantities };
      let hasChanges = false;
      
      cartItems.forEach(item => {
        if (!(item.id in newConfirmedQuantities)) {
          newConfirmedQuantities[item.id] = item.quantity;
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setConfirmedQuantities(newConfirmedQuantities);
      }
    }
  }, [hasConfirmedOrder, confirmedQuantities, cartItems]);

  useEffect(() => {
    updateConfirmedQuantities();
  }, [updateConfirmedQuantities]);

  const handleIncrease = (id: number, currentQuantity: number) => {
    updateQuantity(id, currentQuantity + 1);
  };

  const handleDecrease = (id: number, currentQuantity: number) => {
    const confirmedQty = confirmedQuantities[id] || 0;
    if (!hasConfirmedOrder || currentQuantity > confirmedQty) {
      if (currentQuantity > 1) {
        updateQuantity(id, currentQuantity - 1);
      } else {
        removeFromCart(id);
      }
    }
  };

  const handleRemove = (id: number) => {
    if (!hasConfirmedOrder) {
      removeFromCart(id);
      
      // Cập nhật confirmedQuantities nếu cần
      if (confirmedQuantities[id]) {
        const newConfirmedQuantities = { ...confirmedQuantities };
        delete newConfirmedQuantities[id];
        setConfirmedQuantities(newConfirmedQuantities);
      }
    }
  };

  // Hàm xử lý chỉnh sửa ghi chú
  const handleEditNote = (itemId: number, currentNote: string = "") => {
    setEditingNoteForItemId(itemId);
    setNoteInputs(prev => ({
      ...prev,
      [itemId]: currentNote
    }));
  };

  const handleSaveNote = (itemId: number) => {
    if (noteInputs[itemId] !== undefined) {
      updateNote(itemId, noteInputs[itemId]);
    }
    setEditingNoteForItemId(null);
  };

  const handleCancelEditNote = () => {
    setEditingNoteForItemId(null);
  };

  const handleCallStaff = () => {
    setShowStaffPopup(true);
    setTimeout(() => setShowStaffPopup(false), 3000);
  };

  const handleConfirmOrder = () => {
    setShowConfirmPopup(true);
  };

  const executeConfirmOrder = () => {
    const addedItems: {name: string, addedQuantity: number}[] = [];
    
    cartItems.forEach(item => {
      const previousQty = confirmedQuantities[item.id] || 0;
      const addedQty = item.quantity - previousQty;
      
      if (addedQty > 0) {
        addedItems.push({
          name: item.name,
          addedQuantity: addedQty
        });
        
        console.log(`Món ăn thêm: ${item.name}, số lượng: ${addedQty}`);
      }
    });

    const newConfirmedQuantities = { ...confirmedQuantities };
    cartItems.forEach(item => {
      newConfirmedQuantities[item.id] = item.quantity;
    });
    
    setConfirmedQuantities(newConfirmedQuantities);
    setHasConfirmedOrder(true);
    setShowConfirmPopup(false);

    if (addedItems.length > 0) {
      console.log("=== THÔNG TIN MÓN THÊM ===");
      addedItems.forEach(item => {
        console.log(`- ${item.name}: +${item.addedQuantity}`);
      });
      console.log("==========================");
    }
  };

  const handlePayment = () => {
    setShowPaymentPopup(true);
  };

  const executePayment = () => {
    clearCart();
    setHasConfirmedOrder(false);
    setConfirmedQuantities({});
    setShowPaymentPopup(false);
    // Xóa dữ liệu khỏi localStorage khi thanh toán
    localStorage.removeItem('hasConfirmedOrder');
    localStorage.removeItem('confirmedQuantities');
  };

  return (
    <div className="min-h-screen bg-muted safe-area-padding">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h1 className="text-xl font-semibold text-foreground">Order</h1>
            
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      {/* Staff Call Popup */}
      {showStaffPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Đã gọi nhân viên!</h3>
              <p className="text-muted-foreground">Nhân viên sẽ đến hỗ trợ bạn trong ít phút nữa</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Order Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {hasConfirmedOrder ? 'Xác nhận gọi thêm món' : 'Xác nhận order'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {hasConfirmedOrder 
                  ? 'Bạn có chắc chắn muốn gọi thêm món?' 
                  : 'Bạn có chắc chắn muốn xác nhận order?'}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowConfirmPopup(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={executeConfirmOrder}
                  className="flex-1"
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Popup */}
      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Xác nhận thanh toán</h3>
              <p className="text-muted-foreground mb-6">Bạn có chắc chắn muốn thanh toán order này?</p>
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground">Tổng thanh toán:</p>
                <p className="text-2xl font-bold text-primary">{total.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowPaymentPopup(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={executePayment}
                  className="flex-1"
                >
                  Thanh toán
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Order của bạn</h1>
          <p className="text-muted-foreground">Kiểm tra và xác nhận order</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Order trống</h2>
            <p className="text-muted-foreground mb-6">Hãy thêm món ăn vào order của bạn</p>
            <Button
              onClick={() => navigate("/menu")}
              size="lg"
            >
              Quay lại thực đơn
            </Button>
          </div>
        ) : (
          <>
            {/* Confirmed Order Banner */}
            {hasConfirmedOrder && (
              <div className="mb-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Order đã được xác nhận
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Các món đã xác nhận không thể xóa hoặc giảm số lượng xuống dưới mức đã xác nhận
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => {
                const confirmedQty = confirmedQuantities[item.id] || 0;
                const isConfirmed = hasConfirmedOrder && confirmedQty > 0;
                const canDecrease = !isConfirmed || item.quantity > confirmedQty;
                
                return (
                  <div 
                    key={item.id} 
                    className={`bg-card rounded-2xl shadow-sm border p-4 transition-all hover:shadow-md ${
                      isConfirmed ? 'border-green-200 dark:border-green-800' : 'border-border'
                    }`}
                  >
                    <div className="flex gap-4">
                      <img
                        src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"}
                        alt={item.name}
                        className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground text-lg">{item.name}</h3>
                              {isConfirmed && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                  Đã xác nhận: {confirmedQty}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {/* Nút chỉnh sửa ghi chú */}
                            <button
                              onClick={() => handleEditNote(item.id, item.note)}
                              className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10 active:scale-95"
                              title="Chỉnh sửa ghi chú"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {/* Nút xóa */}
                            <button
                              onClick={() => handleRemove(item.id)}
                              disabled={isConfirmed}
                              className={`p-2 rounded-lg transition-all ${
                                isConfirmed 
                                  ? 'text-muted-foreground/30 cursor-not-allowed' 
                                  : 'text-destructive hover:bg-destructive/10 active:scale-95'
                              }`}
                              title={isConfirmed ? "Món đã xác nhận, không thể xóa" : "Xóa món"}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Mô tả món ăn */}
                        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{item.description}</p>
                        
                        {/* Phần ghi chú */}
                        <div className="mb-3">
                          {editingNoteForItemId === item.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={noteInputs[item.id] || ''}
                                onChange={(e) => setNoteInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                                className="w-full p-2 border border-border rounded-lg text-sm bg-background resize-none"
                                placeholder="Thêm ghi chú cho món này..."
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSaveNote(item.id)}
                                  size="sm"
                                  className="text-xs h-8"
                                >
                                  Lưu
                                </Button>
                                <Button
                                  onClick={handleCancelEditNote}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-8"
                                >
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {item.note ? (
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">Ghi chú:</span> {item.note}
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground/70 italic">
                                  Chưa có ghi chú
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-primary font-bold text-lg">
                            {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                          </span>
                          
                          <div className="flex items-center gap-3 bg-secondary rounded-full px-3 py-1.5">
                            <button 
                              onClick={() => handleDecrease(item.id, item.quantity)}
                              disabled={!canDecrease}
                              className={`w-8 h-8 rounded-full bg-card border-2 flex items-center justify-center transition-all ${
                                !canDecrease
                                  ? 'border-border/30 text-muted-foreground/30 cursor-not-allowed'
                                  : 'border-primary/30 text-primary hover:bg-primary/10 active:scale-90'
                              }`}
                              title={!canDecrease ? "Không thể giảm dưới số lượng đã xác nhận" : "Giảm số lượng"}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            
                            <span className="font-bold text-foreground text-base min-w-8 text-center">
                              {item.quantity}
                              {isConfirmed && item.quantity > confirmedQty && (
                                <span className="block text-xs text-green-600">+{item.quantity - confirmedQty}</span>
                              )}
                            </span>
                            
                            <button 
                              onClick={() => handleIncrease(item.id, item.quantity)}
                              className="w-8 h-8 rounded-full bg-primary border-2 border-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 active:scale-90 transition-all"
                              title="Tăng số lượng"
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
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-6">
              <h2 className="font-semibold text-xl text-foreground mb-6 text-center">
                Tổng order ({totalItems} món)
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground text-base">Tạm tính</span>
                  <span className="text-foreground font-semibold text-base">{subtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground text-base">Thuế (10%)</span>
                  <span className="text-foreground font-semibold text-base">{tax.toLocaleString('vi-VN')} đ</span>
                </div>
                
                <div className="h-px bg-border my-4"></div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-foreground font-bold text-xl">Tổng cộng</span>
                  <span className="text-primary font-bold text-2xl">{total.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Thời gian phục vụ: </span>
                    <span className="text-foreground font-medium">15-20 phút</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Địa điểm: </span>
                    <span className="text-foreground font-medium">Đặt hàng tại quán</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Order Button */}
            <Button 
              onClick={handleConfirmOrder}
              className="w-full mb-4"
              size="lg"
            >
              {hasConfirmedOrder ? 'Xác nhận gọi thêm món' : 'Xác nhận order'}
            </Button>
          </>
        )}
      </div>

      {/* Bottom Action Buttons */}
      {cartItems.length > 0 && (
        <div className="sticky bottom-4 left-0 right-0 mx-4 mt-8">
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl p-4 shadow-lg">
            <div className="flex gap-3">
              <Button
                onClick={handleCallStaff}
                variant="outline"
                size="lg"
                className="flex-1 gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Gọi nhân viên
              </Button>
              
              <Button
                onClick={handlePayment}
                variant="default"
                size="lg"
                className="flex-1 gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Thanh toán
              </Button>
            </div>
          </div>
        </div>
      )}

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
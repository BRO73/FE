import React, { FC, useEffect, useState, useMemo } from "react";
import FoodDetail from "./FoodDetail";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { getAllMenuItems } from "@/api/menuItem.api";
import { MenuItem } from "@/types/type";

interface MenuProps {
  title?: string;
}

const MenuPage: FC<MenuProps> = ({ title = "Thực Đơn Đặc Biệt" }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  // QUAN TRỌNG: Sử dụng cartVersion để trigger re-render
  const { addToCart, getTotalItems, cartVersion } = useCart();
  const cartItemCount = getTotalItems();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const data = await getAllMenuItems();
        setMenuItems(data);
      } catch (err) {
        setError("Không thể tải dữ liệu menu.");
        console.error("Error fetching menu items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleCartNavigation = () => {
    navigate("/cart");
  };

  // Hàm xử lý mở popup đặt món
  const handleOrderClick = (item: MenuItem) => {
    if (item.status.toLowerCase() !== "available") return;
    setSelectedItem(item);
  };

  // Hàm xử lý thêm vào giỏ hàng trực tiếp (không qua popup)
  const handleAddToCart = (item: MenuItem) => {
    if (item.status.toLowerCase() !== "available") return;
    
    addToCart(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
        description: item.description,
      },
      1
    );
  };

  // Lấy danh sách categories duy nhất từ menuItems
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(menuItems.map((item) => item.category)),
    ].filter(Boolean);
    return ["Tất cả", ...uniqueCategories];
  }, [menuItems]);

  // Lọc menu items theo category và search term
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "Tất cả" ||
        item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchTerm]);

  // Debug: log khi cartVersion thay đổi
  useEffect(() => {
    console.log("Cart updated, version:", cartVersion, "Item count:", cartItemCount);
  }, [cartVersion, cartItemCount]);

  // ... (giữ nguyên phần JSX còn lại)

  return (
    <div className="min-h-screen bg-white">
      {/* Header với background hình ảnh */}
      <div className="relative bg-black text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2070&q=80')",
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-20 md:py-24 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 sm:mb-4 px-2">
            {title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto opacity-90 px-4">
            Trải nghiệm ẩm thực tinh tế với những nguyên liệu cao cấp nhất
          </p>
        </div>
      </div>

      {/* Navigation và Search */}
      <div className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
            {/* Category Navigation */}
            <div className="w-full sm:w-auto">
              <div className="flex overflow-x-auto scrollbar-hide space-x-2 pb-2 -mx-1 px-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 sm:px-4 py-2 rounded-full whitespace-nowrap text-sm transition duration-300 flex-shrink-0 ${
                      selectedCategory === category
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Search và Cart Button Container */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <input
                  type="text"
                  placeholder="Tìm món ăn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm sm:text-base text-gray-900 bg-white"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Cart Button - Sẽ cập nhật ngay lập tức nhờ cartVersion */}
              <button
                onClick={handleCartNavigation}
                className="relative p-2 sm:p-3 text-gray-600 hover:text-gray-900 transition duration-200 bg-white border border-gray-200 rounded-full hover:shadow-md active:scale-95 touch-manipulation"
                aria-label="Giỏ hàng"
              >
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                
                {/* Hiển thị số lượng - sẽ cập nhật ngay lập tức nhờ cartVersion */}
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 min-w-[1.25rem] flex items-center justify-center shadow-sm">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 md:py-12">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="text-5xl sm:text-6xl mb-4">🔍</div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
              Không tìm thấy món ăn
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 ${
                  activeItem === item.id
                    ? "shadow-lg sm:shadow-2xl scale-[1.02]"
                    : "shadow-sm sm:shadow-lg hover:shadow-md sm:hover:shadow-xl"
                }`}
                onMouseEnter={() => setActiveItem(item.id)}
                onMouseLeave={() => setActiveItem(null)}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-2/5 relative overflow-hidden">
                    <img
                      src={
                        item.imageUrl ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"
                      }
                      alt={item.name}
                      className="w-full h-40 sm:h-48 md:h-full object-cover transition duration-500 hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold ${
                          item.status.toLowerCase() === "available"
                            ? "bg-green-500 text-white"
                            : item.status.toLowerCase() === "seasonal"
                            ? "bg-blue-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {item.status.toLowerCase() === "available" 
                          ? "Có sẵn" 
                          : item.status.toLowerCase() === "seasonal"
                          ? "Theo mùa"
                          : "Hết hàng"
                        }
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="sm:w-3/5 p-4 sm:p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="text-lg sm:text-xl font-serif font-semibold text-gray-900 flex-1 min-w-0">
                        <span className="truncate">{item.name}</span>
                      </h3>
                      <span className="text-lg sm:text-xl font-bold text-amber-600 flex-shrink-0 whitespace-nowrap ml-2">
                        {item.price.toLocaleString('vi-VN')} VND
                      </span>
                    </div>

                    <div className="mb-3 sm:mb-4">
                      <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm">
                        {item.category || "Không phân loại"}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 flex-grow leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {item.description}
                    </p>

                    {/* Nút Đặt món */}
                    <div className="flex justify-start mt-auto">
                      <button
                        onClick={() => handleOrderClick(item)}
                        disabled={item.status.toLowerCase() !== "available"}
                        className="bg-amber-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-amber-600 transition duration-300 font-medium flex items-center justify-center text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
                      >
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Đặt món
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FoodDetail Popup */}
      <FoodDetail item={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cần hỗ trợ thêm?
            </h3>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 text-gray-600 text-sm sm:text-base">
              <div className="flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>0123-456-789</span>
              </div>
              <div className="flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>info@restaurant.com</span>
              </div>
            </div>
            <p className="mt-6 sm:mt-8 text-gray-500 text-xs sm:text-sm">
              © {new Date().getFullYear()} Nhà hàng của chúng tôi. Mọi quyền
              được bảo lưu.
            </p>
          </div>
        </div>
      </div>

      {/* Safe Area CSS */}
      <style>{`
        .safe-area-padding {
          padding-left: env(safe-area-inset-left, 0px);
          padding-right: env(safe-area-inset-right, 0px);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        @supports(padding: max(0px)) {
          .safe-area-padding {
            padding-left: max(0px, env(safe-area-inset-left, 0px));
            padding-right: max(0px, env(safe-area-inset-right, 0px));
            padding-bottom: max(0px, env(safe-area-inset-bottom, 0px));
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MenuPage;
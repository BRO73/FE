import React, { FC, useEffect, useState, useMemo, useCallback } from "react";
import FoodDetail from "./FoodDetail";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { getMenuItemsPaged, getAllCategories } from "@/api/menuItem.api";
import { MenuItem } from "@/types/type";

interface MenuProps {
  title?: string;
}

// Cache keys for localStorage
const CACHE_KEYS = {
  MENU_ITEMS: 'menuItems_cache',
  CURRENT_PAGE: 'currentPage_cache',
  ALL_CATEGORIES: 'allCategories_cache',
  ALL_MENU_ITEMS: 'allMenuItems_cache'
};

// Hàm helper để đọc/ghi cache từ localStorage
const getCache = <T,>(key: string, defaultValue: T): T => {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : defaultValue;
    } catch (error) {
      console.error(`Error reading cache ${key}:`, error);
      return defaultValue;
    }
  }
  return defaultValue;
};

const setCache = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing cache ${key}:`, error);
    }
  }
};

const MenuPage: FC<MenuProps> = ({ title = "Thực Đơn Đặc Biệt" }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>(() => {
    return getCache(CACHE_KEYS.ALL_MENU_ITEMS, []);
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(() => {
    return getCache(CACHE_KEYS.CURRENT_PAGE, 0);
  });
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(6);
  
  // State cho categories
  const [allCategories, setAllCategories] = useState<string[]>(() => {
    return getCache(CACHE_KEYS.ALL_CATEGORIES, []);
  });

  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // Hàm fetch tất cả categories
  const fetchAllCategories = useCallback(async () => {
    const cachedCategories = getCache(CACHE_KEYS.ALL_CATEGORIES, []);
    if (cachedCategories.length > 0) {
      setAllCategories(cachedCategories);
      return;
    }

    try {
      const categories = await getAllCategories();
      const categoriesWithAll = ["Tất cả", ...categories.filter(cat => cat && cat !== "Tất cả")];
      setAllCategories(categoriesWithAll);
      setCache(CACHE_KEYS.ALL_CATEGORIES, categoriesWithAll);
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Fallback: lấy categories từ menu items hiện có
      const uniqueCategories = [
        ...new Set(allMenuItems.map((item) => item.category)),
      ].filter(Boolean);
      const fallbackCategories = ["Tất cả", ...uniqueCategories];
      setAllCategories(fallbackCategories);
      setCache(CACHE_KEYS.ALL_CATEGORIES, fallbackCategories);
    }
  }, [allMenuItems]);

  // Fetch ALL menu items (không phân trang) để lọc
  const fetchAllMenuItems = useCallback(async () => {
    const cachedAllMenuItems = getCache(CACHE_KEYS.ALL_MENU_ITEMS, []);
    if (cachedAllMenuItems.length > 0) {
      setAllMenuItems(cachedAllMenuItems);
      return;
    }

    try {
      const allItems: MenuItem[] = [];
      let currentPage = 0;
      let totalPages = 1;
      
      while (currentPage < totalPages) {
        const response = await getMenuItemsPaged(currentPage, 50);
        allItems.push(...response.content);
        totalPages = response.totalPages;
        currentPage++;
      }
      
      setAllMenuItems(allItems);
      setCache(CACHE_KEYS.ALL_MENU_ITEMS, allItems);
    } catch (err) {
      console.error("Error fetching all menu items:", err);
      // Fallback: sử dụng menu items hiện tại
      setAllMenuItems(menuItems);
      setCache(CACHE_KEYS.ALL_MENU_ITEMS, menuItems);
    }
  }, [menuItems]);

  // Fetch menu items với cache
  const fetchMenuItems = useCallback(async (page: number, size: number) => {
    const cacheKey = `${CACHE_KEYS.MENU_ITEMS}_page_${page}_size_${size}`;
    const cachedData = getCache(cacheKey, null);

    if (cachedData) {
      setMenuItems(cachedData.content);
      setTotalPages(cachedData.totalPages);
      setTotalElements(cachedData.totalElements);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getMenuItemsPaged(page, size);
      
      // Lưu vào cache
      setCache(cacheKey, {
        content: response.content,
        totalPages: response.totalPages,
        totalElements: response.totalElements
      });
      setCache(CACHE_KEYS.CURRENT_PAGE, page);
      
      setMenuItems(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      
      // Fetch categories và all menu items nếu chưa có
      if (allCategories.length <= 1) {
        fetchAllCategories();
      }
      if (allMenuItems.length === 0) {
        fetchAllMenuItems();
      }
    } catch (err) {
      setError("Không thể tải dữ liệu menu.");
      console.error("Error fetching menu items:", err);
    } finally {
      setLoading(false);
    }
  }, [allCategories.length, allMenuItems.length, fetchAllCategories, fetchAllMenuItems]);

  useEffect(() => {
    fetchMenuItems(currentPage, pageSize);
  }, [currentPage, pageSize, fetchMenuItems]);

  // Reset về trang đầu khi category hoặc search thay đổi
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, searchTerm]);

  const handleCartNavigation = () => {
    navigate("/cart");
  };

  const handleOrderClick = (item: MenuItem) => {
    if (item.status.toLowerCase() !== "available") return;
    setSelectedItem(item);
  };

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

  // Hàm xử lý chuyển trang
  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      setCache(CACHE_KEYS.CURRENT_PAGE, page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Tạo mảng các số trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Sử dụng allCategories thay vì categories từ menuItems hiện tại
  const categories = useMemo(() => {
    return allCategories.length > 0 ? allCategories : ["Tất cả"];
  }, [allCategories]);

  // Lọc menu items theo category và search term từ TẤT CẢ menu items
  const filteredItems = useMemo(() => {
    // Nếu đang chọn "Tất cả" và không có search term, hiển thị menu items phân trang bình thường
    if (selectedCategory === "Tất cả" && !searchTerm) {
      return menuItems;
    }
    
    // Ngược lại, lọc từ tất cả menu items
    return allMenuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "Tất cả" ||
        item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, allMenuItems, selectedCategory, searchTerm]);

  // Tính toán phân trang cho filtered items
  const paginatedFilteredItems = useMemo(() => {
    if (selectedCategory === "Tất cả" && !searchTerm) {
      return filteredItems; // Đã được phân trang bởi server
    }
    
    // Phân trang client-side cho filtered items
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, pageSize, selectedCategory, searchTerm]);

  // Tính tổng số trang cho filtered items
  const filteredTotalPages = useMemo(() => {
    if (selectedCategory === "Tất cả" && !searchTerm) {
      return totalPages; // Sử dụng phân trang từ server
    }
    
    return Math.ceil(filteredItems.length / pageSize);
  }, [filteredItems.length, totalPages, selectedCategory, searchTerm, pageSize]);

  // Tính tổng số phần tử cho filtered items
  const filteredTotalElements = useMemo(() => {
    if (selectedCategory === "Tất cả" && !searchTerm) {
      return totalElements; // Sử dụng từ server
    }
    
    return filteredItems.length;
  }, [filteredItems.length, totalElements, selectedCategory, searchTerm]);

  // Xóa cache khi component unmount (optional)
  useEffect(() => {
    return () => {
      // Có thể xóa cache cụ thể nếu cần
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 safe-area-padding">
        <div className="text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-16 w-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 safe-area-padding px-4">
        <div className="text-center max-w-md w-full">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Không thể tải menu
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition duration-300 w-full max-w-xs mx-auto"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif" }}>
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
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

              {/* Cart Button */}
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
        {/* Thông tin phân trang */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="text-sm text-gray-600">
            Hiển thị {paginatedFilteredItems.length} món trên tổng số {filteredTotalElements} món
          </div>
          <div className="text-sm text-gray-600">
            Trang {currentPage + 1} / {filteredTotalPages}
          </div>
        </div>

        {paginatedFilteredItems.length === 0 ? (
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
          <>
            {/* Grid căn giữa trên mobile */}
            <div className="flex justify-center">
              <div className="w-full max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 justify-items-center">
                  {paginatedFilteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 w-full max-w-md md:max-w-none ${
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
                          <div className="flex flex-col mb-2 gap-2">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex-1 min-w-0 break-words">
                                {item.name}
                              </h3>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-lg sm:text-xl font-bold text-amber-600 whitespace-nowrap">
                                {item.price.toLocaleString('vi-VN')} VND
                              </span>
                            </div>
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
              </div>
            </div>

            {/* Phân trang - Chỉ hiển thị nếu có nhiều hơn 1 trang */}
            {filteredTotalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-2">
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={currentPage === 0}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg border transition duration-200 ${
                      currentPage === page
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === filteredTotalPages - 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => handlePageChange(filteredTotalPages - 1)}
                  disabled={currentPage === filteredTotalPages - 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
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

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
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
        `}
      </style>
    </div>
  );
};

export default MenuPage;
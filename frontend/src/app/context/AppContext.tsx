import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '../data/products';
import { getMergedProducts } from '../data/productStore';
import { toast } from 'sonner';
import { apiUrl } from '../lib/api';

export interface CartItem {
  product: Product;
  quantity: number;
  size?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'client' | 'admin';
}

export const LIGHT_COLORS = {
  BG: '#FDFAF4',
  CARD_BG: '#FFFFFF',
  BORDER: '#EDE5D0',
  TEXT: '#1C1510',
  MUTED: '#8A7564',
  GOLD: '#C9A227',
  SUBTLE: 'rgba(201,162,39,0.08)',
  SHADOW: 'rgba(0,0,0,0.06)',
};

export const DARK_COLORS = {
  BG: '#1A1410',
  CARD_BG: '#231E15',
  BORDER: '#3A2E1E',
  TEXT: '#F5EFE0',
  MUTED: '#9A8A74',
  GOLD: '#C9A227',
  SUBTLE: 'rgba(201,162,39,0.12)',
  SHADOW: 'rgba(0,0,0,0.3)',
};

interface AppContextType {
  // Products
  allProducts: Product[];
  refreshProducts: () => Promise<void>;
  isProductsLoading: boolean;
  // Cart
  cartItems: CartItem[];
  addToCart: (product: Product, size?: number) => void;
  removeFromCart: (productId: string, size?: number) => void;
  updateQuantity: (productId: string, quantity: number, size?: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  // Gift
  isGiftWrap: boolean;
  setIsGiftWrap: (v: boolean) => void;
  giftMessage: string;
  setGiftMessage: (msg: string) => void;
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  // Price Alerts
  priceAlerts: string[];
  togglePriceAlert: (productId: string) => void;
  hasPriceAlert: (productId: string) => boolean;
  // Recently Viewed
  recentlyViewed: string[];
  addToRecentlyViewed: (productId: string) => void;
  // User
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  login: (user?: Partial<UserProfile>) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  // Loyalty Points
  loyaltyPoints: number;
  addPoints: (points: number) => void;
  // Order
  lastOrderId: string | null;
  setLastOrderId: (id: string) => void;
  // Dark Mode
  darkMode: boolean;
  toggleDarkMode: () => void;
  colors: typeof LIGHT_COLORS;
}

const AppContext = createContext<AppContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => loadFromStorage('mn_user', null));
  const [cartItems, setCartItems] = useState<CartItem[]>(() => loadFromStorage('mn_cart', []));
  const [wishlist, setWishlist] = useState<string[]>(() => loadFromStorage('mn_wishlist', []));
  const [priceAlerts, setPriceAlerts] = useState<string[]>(() => loadFromStorage('mn_alerts', []));
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => loadFromStorage('mn_recent', []));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const legacyLogged = loadFromStorage<boolean>('mn_logged', false);
    const user = loadFromStorage<UserProfile | null>('mn_user', null);
    return legacyLogged || Boolean(user);
  });
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(() => loadFromStorage('mn_points', 0));
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => loadFromStorage('mn_dark', false));
  const [isGiftWrap, setIsGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/products'));
      if (!res.ok) throw new Error('Failed to fetch POSTGRES products');
      const data = await res.json();
      console.log('[AppContext] refreshProducts fetched', data.length, 'products from database');
      setAllProducts(data);
    } catch (e) {
      console.error('[AppContext] Error fetching from DB:', e);
      // Fallback local if DB not running / no connection
      const local = getMergedProducts();
      setAllProducts(local);
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
    window.addEventListener('focus', refreshProducts);
    
    // Écouter les changements venant d'autres onglets
    const handleStorageChange = (e: StorageEvent) => {
      console.log('[AppContext] storage event detected:', e.key);
      if (e.key && e.key.startsWith('mn_')) refreshProducts();
    };
    window.addEventListener('storage', handleStorageChange);

    // Écouter les changements dans le même onglet (Custom Event)
    const handleLocalUpdate = () => {
      console.log('[AppContext] mn_products_updated custom event received');
      refreshProducts();
    };
    window.addEventListener('mn_products_updated', handleLocalUpdate);

    return () => {
      window.removeEventListener('focus', refreshProducts);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mn_products_updated', handleLocalUpdate);
    };
  }, [refreshProducts]);

  useEffect(() => {
    let cancelled = false;

    // If Better Auth already has a valid session cookie, hydrate app state from it.
    const syncAuthSession = async () => {
      try {
        const res = await fetch(apiUrl('/api/auth/get-session'));
        if (!res.ok) return;
        const data = await res.json();
        const user = data?.user;
        if (!user || cancelled) return;

        setCurrentUser({
          id: String(user.id),
          name: String(user.name || 'Client Maison Marnoa'),
          email: user.email ? String(user.email) : undefined,
          phone: user.phone ? String(user.phone) : undefined,
          role: user.role === 'admin' ? 'admin' : 'client',
        });
        setIsLoggedIn(true);
      } catch {
        // No active server session: keep local state fallback.
      }
    };

    syncAuthSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist to localStorage
  useEffect(() => { saveToStorage('mn_cart', cartItems); }, [cartItems]);
  useEffect(() => { saveToStorage('mn_wishlist', wishlist); }, [wishlist]);
  useEffect(() => { saveToStorage('mn_alerts', priceAlerts); }, [priceAlerts]);
  useEffect(() => { saveToStorage('mn_recent', recentlyViewed); }, [recentlyViewed]);
  useEffect(() => { saveToStorage('mn_user', currentUser); }, [currentUser]);
  useEffect(() => { saveToStorage('mn_logged', isLoggedIn); }, [isLoggedIn]);
  useEffect(() => { saveToStorage('mn_points', loyaltyPoints); }, [loyaltyPoints]);
  useEffect(() => { saveToStorage('mn_dark', darkMode); }, [darkMode]);

  // Sync cart items with fresh products when allProducts updates
  useEffect(() => {
    if (allProducts.length === 0) return;
    setCartItems(prev => {
      let changed = false;
      const synced = prev.map(item => {
        const fresh = allProducts.find(p => p.id === item.product.id);
        if (fresh && JSON.stringify(fresh) !== JSON.stringify(item.product)) {
          changed = true;
          return { ...item, product: fresh };
        }
        return item;
      });
      return changed ? synced : prev;
    });
  }, [allProducts]);

  const addToCart = useCallback((product: Product, size?: number) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.size === size);
      // Validation stock
      const stock = product.stock ?? 99;
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty + 1 > stock) {
        toast('Stock insuffisant', { description: `Il reste ${stock} exemplaires en stock.`, duration: 2500 });
        return prev;
      }
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, size }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, size?: number) => {
    setCartItems(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, size?: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));
      return;
    }
    setCartItems(prev =>
      prev.map(item => {
        if (item.product.id === productId && item.size === size) {
          const stock = item.product.stock ?? 99;
          if (quantity > stock) {
            toast('Stock insuffisant', { description: `Il reste ${stock} exemplaires en stock.`, duration: 2500 });
            return { ...item, quantity: stock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => { setCartItems([]); }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  }, []);

  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const togglePriceAlert = useCallback((productId: string) => {
    setPriceAlerts(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  }, []);

  const hasPriceAlert = useCallback((productId: string) => priceAlerts.includes(productId), [priceAlerts]);

  const addToRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== productId);
      return [productId, ...filtered].slice(0, 10);
    });
  }, []);

  const addPoints = useCallback((pts: number) => {
    setLoyaltyPoints(prev => prev + pts);
  }, []);

  const login = useCallback((user?: Partial<UserProfile>) => {
    setIsLoggedIn(true);
    setCurrentUser(prev => {
      const base: UserProfile = prev ?? {
        id: `mn_user_${Date.now()}`,
        name: 'Client Maison Marnoa',
        role: 'client',
      };
      return {
        ...base,
        ...user,
        id: user?.id ?? base.id,
        role: user?.role ?? base.role,
      };
    });
  }, []);

  const logout = useCallback(() => {
    // Fire-and-forget server logout; local state is cleared regardless.
    void fetch(apiUrl('/api/auth/sign-out'), { method: 'POST' }).catch(() => {});
    setIsLoggedIn(false);
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      return { ...prev, ...data };
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const colors = darkMode ? DARK_COLORS : LIGHT_COLORS;

  return (
    <AppContext.Provider value={{
      allProducts, refreshProducts,
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal,
      isGiftWrap, setIsGiftWrap, giftMessage, setGiftMessage,
      wishlist, toggleWishlist, isWishlisted,
      priceAlerts, togglePriceAlert, hasPriceAlert,
      recentlyViewed, addToRecentlyViewed,
      currentUser,
      isLoggedIn,
      login,
      logout,
      updateProfile,
      loyaltyPoints, addPoints,
      lastOrderId, setLastOrderId,
      darkMode, toggleDarkMode, colors,
      isProductsLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useColors() {
  return useApp().colors;
}

export function useProducts() {
  return useApp().allProducts;
}

export function useProductsLoading() {
  return useApp().isProductsLoading;
}

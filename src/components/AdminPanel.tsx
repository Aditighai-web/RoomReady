import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  AlertTriangle,
  Package,
  Layers,
  Sliders,
  Sparkles,
  Settings,
  ShieldCheck,
  ExternalLink,
  X,
  RefreshCw,
} from 'lucide-react';
import { IkeaProduct, RoomDimensions } from '../types';
import { ProductImageWithFallback } from './IkeaProductIllustration';

interface AdminPanelProps {
  onBackToStudio: () => void;
  onRefreshCatalog: () => void;
}

const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch {
      // Storage blocked or restricted in iframe
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch {}
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch {}
  },
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToStudio, onRefreshCatalog }) => {
  // Auth state
  const [token, setToken] = useState<string | null>(() => safeSessionStorage.getItem('roomready_admin_token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active Tab: 'products' | 'categories' | 'budget' | 'presets' | 'content'
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'budget' | 'presets' | 'content'>('products');

  // Products Data
  const [products, setProducts] = useState<IkeaProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<IkeaProduct>>({
    name: '',
    swedishMeaning: '',
    category: 'Seating',
    desc: '',
    dimensions: '',
    materials: '',
    priceINR: 4990,
    styles: ['Modern Scandinavian'],
    imageUrl: '',
    query: '',
    spatialBenefit: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Categories Data
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  // Budget Data
  const [budgetConfig, setBudgetConfig] = useState({
    min: 15000,
    max: 250000,
    default: 45000,
    presets: [35000, 65000, 110000, 180000],
  });

  // Presets Data
  const [roomPresets, setRoomPresets] = useState<any[]>([]);
  const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null);

  // Content Data
  const [siteContent, setSiteContent] = useState({
    heroHeadline: '',
    heroSubtitle: '',
    ga4MeasurementId: '',
    announcement: '',
  });

  // Notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setIsCheckingAuth(false);
      return;
    }

    fetch('/api/admin/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
          loadAdminData(token);
        } else {
          safeSessionStorage.removeItem('roomready_admin_token');
          setToken(null);
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        safeSessionStorage.removeItem('roomready_admin_token');
        setToken(null);
        setIsAuthenticated(false);
      })
      .finally(() => setIsCheckingAuth(false));
  }, [token]);

  // Load all admin data
  const loadAdminData = async (authToken: string) => {
    try {
      const headers = { Authorization: `Bearer ${authToken}` };

      const [prodRes, catRes, budRes, preRes, conRes] = await Promise.all([
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/categories', { headers }),
        fetch('/api/admin/budget-options', { headers }),
        fetch('/api/admin/presets', { headers }),
        fetch('/api/admin/content', { headers }),
      ]);

      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || []);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data.categories || []);
      }
      if (budRes.ok) {
        const data = await budRes.json();
        if (data.budgetOptions) setBudgetConfig(data.budgetOptions);
      }
      if (preRes.ok) {
        const data = await preRes.json();
        setRoomPresets(data.presets || []);
      }
      if (conRes.ok) {
        const data = await conRes.json();
        if (data.content) setSiteContent(data.content);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        safeSessionStorage.setItem('roomready_admin_token', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        loadAdminData(data.token);
        showToast('Logged in successfully as Administrator.');
      } else {
        setLoginError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Server connection error.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    safeSessionStorage.removeItem('roomready_admin_token');
    setToken(null);
    setIsAuthenticated(false);
    showToast('Logged out of admin panel.');
  };

  // Form validation for Product
  const validateProductForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!productForm.name?.trim()) errors.name = 'Product name is required';
    if (!productForm.category?.trim()) errors.category = 'Category is required';
    if (productForm.priceINR === undefined || Number(productForm.priceINR) <= 0) {
      errors.priceINR = 'A valid positive price in INR is required';
    }
    if (!productForm.dimensions?.trim()) errors.dimensions = 'Dimensions are required (e.g. 80 x 28 x 206 cm)';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async () => {
    if (!validateProductForm() || !token) return;

    try {
      const url = editingProductId ? `/api/admin/products/${editingProductId}` : '/api/admin/products';
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productForm),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(editingProductId ? `Updated ${productForm.name}` : `Created ${productForm.name}`);
        setIsEditingProduct(false);
        setEditingProductId(null);
        loadAdminData(token);
        onRefreshCatalog();
      } else {
        showToast(data.error || 'Failed to save product', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error saving product', 'error');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Product removed from catalog.');
        setDeletingProductId(null);
        loadAdminData(token);
        onRefreshCatalog();
      } else {
        showToast(data.error || 'Failed to delete product', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error deleting product', 'error');
    }
  };

  // Add Category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !token) return;

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Category '${newCategoryName}' added.`);
        setNewCategoryName('');
        setCategories(data.categories);
        onRefreshCatalog();
      } else {
        showToast(data.error || 'Failed to add category', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error adding category', 'error');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (name: string) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/categories/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Category '${name}' deleted.`);
        setDeletingCategory(null);
        setCategories(data.categories);
        onRefreshCatalog();
      } else {
        showToast(data.error || 'Failed to delete category', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting category', 'error');
    }
  };

  // Save Budget Configuration
  const handleSaveBudget = async () => {
    if (!token) return;
    if (budgetConfig.min >= budgetConfig.max) {
      showToast('Min budget must be less than max budget', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/budget-options', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(budgetConfig),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Budget configuration updated.');
        onRefreshCatalog();
      } else {
        showToast(data.error || 'Failed to update budget settings', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error saving budget settings', 'error');
    }
  };

  // Save Site Content & GA4
  const handleSaveContent = async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(siteContent),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Site content & Google Analytics 4 settings saved.');
        onRefreshCatalog();
      } else {
        showToast(data.error || 'Failed to update site content', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error saving content', 'error');
    }
  };

  // Delete Room Preset
  const handleDeletePreset = async (id: string) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/presets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast('Preset removed.');
        setDeletingPresetId(null);
        loadAdminData(token);
        onRefreshCatalog();
      } else {
        showToast('Failed to delete preset', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting preset', 'error');
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.swedishMeaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.materials.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Loading State
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#0058A3]/30 border-t-[#0058A3] rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#6B7280]">Verifying Admin Authorization...</p>
        </div>
      </div>
    );
  }

  // Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E8E5DF] shadow-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#0058A3]/10 text-[#0058A3] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#1E2229]">RoomReady Admin Authentication</h2>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Protected administration console. Authenticated server-side by Express with session tokens.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-[#FFF5F5] border border-[#FFD8D8] rounded-xl text-xs text-[#c92a2a] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                Admin Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 text-[#1E2229] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                Admin Password
              </label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 text-[#1E2229] outline-none"
                required
              />
              <span className="text-[10px] text-[#6B7280] mt-1 block">
                Server default: <code className="bg-[#EAE8E3] px-1 py-0.5 rounded font-mono">roomready2025</code> (configured in <code className="bg-[#EAE8E3] px-1 py-0.5 rounded font-mono">.env</code>)
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#0058A3] hover:bg-[#004885] active:scale-[0.99] disabled:opacity-60 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#FFDB00]" />
                  <span>Unlock Admin Console</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={onBackToStudio}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#1E2229] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Makeover Studio</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1E2229]">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === 'error'
              ? 'bg-[#FFF5F5] border-[#FFD8D8] text-[#c92a2a]'
              : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
          }`}
        >
          {toast.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E8E5DF] px-6 py-3.5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStudio}
              className="p-1.5 rounded-lg border border-[#E8E5DF] hover:bg-[#FAF9F6] text-[#6B7280] transition-colors cursor-pointer"
              title="Return to Studio"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="bg-[#0058A3] text-white text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
                ADMIN CONSOLE
              </span>
              <h1 className="text-base font-bold text-[#1E2229]">RoomReady Data &amp; Content Management</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6B7280] hidden sm:inline">
              Authenticated as <strong className="text-[#1E2229]">admin</strong> (Session Active)
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#c92a2a] bg-[#FFF5F5] hover:bg-[#FFE3E3] border border-[#FFD8D8] rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E8E5DF] pb-3 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('products')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-[#0058A3] text-white shadow-xs'
                : 'bg-white text-[#4A505A] border border-[#E8E5DF] hover:bg-[#FAF9F6]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>IKEA Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-[#0058A3] text-white shadow-xs'
                : 'bg-white text-[#4A505A] border border-[#E8E5DF] hover:bg-[#FAF9F6]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'budget'
                ? 'bg-[#0058A3] text-white shadow-xs'
                : 'bg-white text-[#4A505A] border border-[#E8E5DF] hover:bg-[#FAF9F6]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Budget Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'presets'
                ? 'bg-[#0058A3] text-white shadow-xs'
                : 'bg-white text-[#4A505A] border border-[#E8E5DF] hover:bg-[#FAF9F6]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Room Examples ({roomPresets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'content'
                ? 'bg-[#0058A3] text-white shadow-xs'
                : 'bg-white text-[#4A505A] border border-[#E8E5DF] hover:bg-[#FAF9F6]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Site Content &amp; GA4</span>
          </button>
        </div>

        {/* TAB 1: IKEA PRODUCTS CRUD */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Search, Filter & Add Button Bar */}
            <div className="bg-white p-4 rounded-xl border border-[#E8E5DF] flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder="Search by name, category, Swedish meaning..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg outline-none"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setProductForm({
                    name: '',
                    swedishMeaning: '',
                    category: categories[0] || 'Seating',
                    desc: '',
                    dimensions: '',
                    materials: '',
                    priceINR: 4990,
                    styles: ['Modern Scandinavian'],
                    imageUrl: '',
                    query: '',
                    spatialBenefit: '',
                  });
                  setFormErrors({});
                  setEditingProductId(null);
                  setIsEditingProduct(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0058A3] hover:bg-[#004885] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-[#E8E5DF] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F6] border-b border-[#E8E5DF] text-[#6B7280] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Dimensions</th>
                      <th className="py-3 px-4">Price (INR)</th>
                      <th className="py-3 px-4">Materials</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EEE9]">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#E8E5DF] bg-[#FAF8F5] shrink-0">
                              <ProductImageWithFallback product={p} />
                            </div>
                            <div>
                              <span className="font-bold text-[#1E2229] block">{p.name}</span>
                              <span className="text-[11px] text-[#6B7280] italic">"{p.swedishMeaning}"</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-[#4A505A]">{p.category}</td>
                        <td className="py-3 px-4 text-[#4A505A]">{p.dimensions}</td>
                        <td className="py-3 px-4 font-bold text-[#0058A3] tabular-nums">
                          ₹{p.priceINR.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-[#6B7280] max-w-[200px] truncate">{p.materials}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setProductForm(p);
                                setFormErrors({});
                                setEditingProductId(p.id);
                                setIsEditingProduct(true);
                              }}
                              className="p-1.5 text-[#6B7280] hover:text-[#0058A3] hover:bg-[#F0F5FA] rounded-md transition-colors cursor-pointer"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingProductId(p.id)}
                              className="p-1.5 text-[#6B7280] hover:text-[#c92a2a] hover:bg-[#FFF5F5] rounded-md transition-colors cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-12 text-center text-[#6B7280] space-y-1">
                  <Package className="w-8 h-8 mx-auto opacity-30 text-[#0058A3]" />
                  <p className="text-xs font-semibold text-[#1E2229]">No products match this query.</p>
                  <p className="text-[11px]">Clear filters or add a new piece to the catalog.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: CATEGORIES CRUD */}
        {activeTab === 'categories' && (
          <div className="bg-white p-6 rounded-xl border border-[#E8E5DF] shadow-xs space-y-6 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-[#1E2229]">IKEA Product Categories</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Categories dynamically organize the IKEA shopping catalog and filter tabs.
              </p>
            </div>

            {/* Add Category Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="New category name (e.g. Workspaces, Bedroom Textiles)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none"
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0058A3] hover:bg-[#004885] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                Add Category
              </button>
            </div>

            {/* Categories List */}
            <div className="divide-y divide-[#F0EEE9] border border-[#E8E5DF] rounded-xl overflow-hidden">
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                return (
                  <div key={cat} className="p-3.5 flex items-center justify-between hover:bg-[#FAF9F6]">
                    <div>
                      <span className="text-xs font-bold text-[#1E2229]">{cat}</span>
                      <span className="text-[11px] text-[#6B7280] ml-2">({count} products)</span>
                    </div>
                    <button
                      onClick={() => setDeletingCategory(cat)}
                      className="p-1.5 text-[#6B7280] hover:text-[#c92a2a] hover:bg-[#FFF5F5] rounded-md transition-colors cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: BUDGET PRESETS CONFIGURATION */}
        {activeTab === 'budget' && (
          <div className="bg-white p-6 rounded-xl border border-[#E8E5DF] shadow-xs space-y-6 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-[#1E2229]">Indian Rupee Budget Configuration</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Controls the min/max bounds and quick shortcut buttons in the studio control panel.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                  Minimum Budget (INR)
                </label>
                <input
                  type="number"
                  step={1000}
                  value={budgetConfig.min}
                  onChange={(e) =>
                    setBudgetConfig((prev) => ({ ...prev, min: parseInt(e.target.value) || 10000 }))
                  }
                  className="w-full text-xs font-semibold bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                  Default Budget (INR)
                </label>
                <input
                  type="number"
                  step={1000}
                  value={budgetConfig.default}
                  onChange={(e) =>
                    setBudgetConfig((prev) => ({ ...prev, default: parseInt(e.target.value) || 45000 }))
                  }
                  className="w-full text-xs font-semibold bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                  Maximum Budget (INR)
                </label>
                <input
                  type="number"
                  step={5000}
                  value={budgetConfig.max}
                  onChange={(e) =>
                    setBudgetConfig((prev) => ({ ...prev, max: parseInt(e.target.value) || 250000 }))
                  }
                  className="w-full text-xs font-semibold bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none"
                />
              </div>
            </div>

            {/* Quick Presets list */}
            <div>
              <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                Quick Shortcut Tiers (Comma separated in INR)
              </label>
              <input
                type="text"
                value={budgetConfig.presets.join(', ')}
                onChange={(e) => {
                  const items = e.target.value
                    .split(',')
                    .map((s) => parseInt(s.trim()))
                    .filter((n) => !isNaN(n));
                  setBudgetConfig((prev) => ({ ...prev, presets: items }));
                }}
                className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none font-mono"
              />
            </div>

            <button
              onClick={handleSaveBudget}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#0058A3] hover:bg-[#004885] rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Save Budget Configuration
            </button>
          </div>
        )}

        {/* TAB 4: ROOM PRESETS */}
        {activeTab === 'presets' && (
          <div className="space-y-4 max-w-4xl">
            <div className="bg-white p-4 rounded-xl border border-[#E8E5DF] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1E2229]">Sample Apartment Presets</h3>
                <p className="text-xs text-[#6B7280]">
                  Preset case studies loaded when users test the studio without uploading a photo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roomPresets.map((pr) => (
                <div key={pr.id} className="bg-white p-4 rounded-xl border border-[#E8E5DF] space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#1E2229]">{pr.title}</h4>
                      <p className="text-xs text-[#6B7280]">{pr.subtitle}</p>
                    </div>
                    <button
                      onClick={() => setDeletingPresetId(pr.id)}
                      className="p-1.5 text-[#6B7280] hover:text-[#c92a2a] rounded-md transition-colors cursor-pointer"
                      title="Delete preset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#4A505A] pt-2 border-t border-[#F0EEE9]">
                    <div>
                      <span className="font-semibold text-[#1E2229]">Type:</span> {pr.roomType}
                    </div>
                    <div>
                      <span className="font-semibold text-[#1E2229]">Style:</span> {pr.style}
                    </div>
                    <div>
                      <span className="font-semibold text-[#1E2229]">Palette:</span> {pr.palette}
                    </div>
                    <div>
                      <span className="font-semibold text-[#1E2229]">Budget:</span> ₹{pr.budget?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SITE CONTENT & GA4 */}
        {activeTab === 'content' && (
          <div className="bg-white p-6 rounded-xl border border-[#E8E5DF] shadow-xs space-y-5 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-[#1E2229]">Site Content &amp; Google Analytics 4</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Configure editorial branding copy and the official GA4 Measurement ID (gtag.js).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                Google Analytics 4 Measurement ID
              </label>
              <input
                type="text"
                placeholder="e.g. G-PSJZMCEZY1"
                value={siteContent.ga4MeasurementId}
                onChange={(e) => setSiteContent((prev) => ({ ...prev, ga4MeasurementId: e.target.value }))}
                className="w-full text-xs font-mono bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none"
              />
              <span className="text-[10px] text-[#6B7280] mt-1 block">
                Official Google Tag: Dispatches standard events (<code className="bg-[#EAE8E3] px-1 py-0.5 rounded">room_photo_uploaded</code>, <code className="bg-[#EAE8E3] px-1 py-0.5 rounded">room_analysis_completed</code>, etc.) with zero PII or photo payloads.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                Hero Headline
              </label>
              <input
                type="text"
                value={siteContent.heroHeadline}
                onChange={(e) => setSiteContent((prev) => ({ ...prev, heroHeadline: e.target.value }))}
                className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                Hero Subtitle Copy
              </label>
              <textarea
                rows={3}
                value={siteContent.heroSubtitle}
                onChange={(e) => setSiteContent((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                Announcement Tag
              </label>
              <input
                type="text"
                value={siteContent.announcement}
                onChange={(e) => setSiteContent((prev) => ({ ...prev, announcement: e.target.value }))}
                className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none"
              />
            </div>

            <button
              onClick={handleSaveContent}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#0058A3] hover:bg-[#004885] rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        )}

      </div>

      {/* Product Add/Edit Modal */}
      {isEditingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-xl border border-[#E8E5DF] overflow-hidden">
            <div className="p-5 border-b border-[#E8E5DF] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1E2229]">
                {editingProductId ? `Edit ${productForm.name}` : 'Add New IKEA Product'}
              </h3>
              <button
                onClick={() => setIsEditingProduct(false)}
                className="p-1.5 text-[#6B7280] hover:text-[#1E2229] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. POÄNG, BILLY, KALLAX"
                    value={productForm.name}
                    onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                    className={`w-full text-xs bg-[#FAF9F6] border rounded-lg px-3 py-2 outline-none ${
                      formErrors.name ? 'border-[#c92a2a]' : 'border-[#E8E5DF] focus:border-[#0058A3]'
                    }`}
                  />
                  {formErrors.name && <span className="text-[10px] text-[#c92a2a]">{formErrors.name}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                    Swedish Meaning
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Point / Highlight"
                    value={productForm.swedishMeaning}
                    onChange={(e) => setProductForm((p) => ({ ...p, swedishMeaning: e.target.value }))}
                    className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                    Price in INR (₹) *
                  </label>
                  <input
                    type="number"
                    step={100}
                    value={productForm.priceINR}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, priceINR: parseInt(e.target.value) || 0 }))
                    }
                    className={`w-full text-xs font-semibold bg-[#FAF9F6] border rounded-lg px-3 py-2 outline-none ${
                      formErrors.priceINR ? 'border-[#c92a2a]' : 'border-[#E8E5DF] focus:border-[#0058A3]'
                    }`}
                  />
                  {formErrors.priceINR && <span className="text-[10px] text-[#c92a2a]">{formErrors.priceINR}</span>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                  Dimensions (Length × Width × Height) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 68 x 82 x 100 cm"
                  value={productForm.dimensions}
                  onChange={(e) => setProductForm((p) => ({ ...p, dimensions: e.target.value }))}
                  className={`w-full text-xs bg-[#FAF9F6] border rounded-lg px-3 py-2 outline-none ${
                    formErrors.dimensions ? 'border-[#c92a2a]' : 'border-[#E8E5DF] focus:border-[#0058A3]'
                  }`}
                />
                {formErrors.dimensions && <span className="text-[10px] text-[#c92a2a]">{formErrors.dimensions}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                  Materials &amp; Construction
                </label>
                <input
                  type="text"
                  placeholder="e.g. Moulded birch veneer, 100% cotton removable cover"
                  value={productForm.materials}
                  onChange={(e) => setProductForm((p) => ({ ...p, materials: e.target.value }))}
                  className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Architectural summary of functionality and comfort"
                  value={productForm.desc}
                  onChange={(e) => setProductForm((p) => ({ ...p, desc: e.target.value }))}
                  className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                  Spatial Fit Benefit (Why it works)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Low visual weight with cantilever frame; opens floor paths"
                  value={productForm.spatialBenefit}
                  onChange={(e) => setProductForm((p) => ({ ...p, spatialBenefit: e.target.value }))}
                  className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2229] mb-1">
                  Image URL (or leaves blank for dedicated schematic fallback)
                </label>
                <input
                  type="text"
                  placeholder="https://... or /src/assets/images/..."
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-3 py-2 outline-none font-mono"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#E8E5DF] bg-[#FAF9F6] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditingProduct(false)}
                className="px-4 py-2 text-xs font-semibold text-[#4A505A] hover:bg-[#EAE8E3] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0058A3] hover:bg-[#004885] rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                {editingProductId ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-[#E8E5DF]">
            <div className="w-10 h-10 rounded-full bg-[#FFF5F5] text-[#c92a2a] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-[#1E2229]">Confirm Deletion</h4>
              <p className="text-xs text-[#6B7280]">
                Are you sure you want to remove this product from the IKEA catalog? This action will persist to the database.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="flex-1 py-2 text-xs font-semibold text-[#4A505A] bg-[#F4F2EC] hover:bg-[#EAE8E3] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deletingProductId)}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#c92a2a] hover:bg-[#a51d1d] rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-[#E8E5DF]">
            <div className="w-10 h-10 rounded-full bg-[#FFF5F5] text-[#c92a2a] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-[#1E2229]">Delete Category '{deletingCategory}'?</h4>
              <p className="text-xs text-[#6B7280]">
                Products in this category will remain, but will not show under this category filter.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingCategory(null)}
                className="flex-1 py-2 text-xs font-semibold text-[#4A505A] bg-[#F4F2EC] hover:bg-[#EAE8E3] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCategory(deletingCategory)}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#c92a2a] hover:bg-[#a51d1d] rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Preset Confirmation Modal */}
      {deletingPresetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-[#E8E5DF]">
            <div className="w-10 h-10 rounded-full bg-[#FFF5F5] text-[#c92a2a] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-[#1E2229]">Delete Room Example?</h4>
              <p className="text-xs text-[#6B7280]">
                Are you sure you want to delete this sample room case study?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingPresetId(null)}
                className="flex-1 py-2 text-xs font-semibold text-[#4A505A] bg-[#F4F2EC] hover:bg-[#EAE8E3] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePreset(deletingPresetId)}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#c92a2a] hover:bg-[#a51d1d] rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { Plus, Edit, Eye, EyeOff, Search } from 'lucide-react';
import { Product, VolumeDiscountTier } from '../../types';
import { ProductService } from '../../services/ProductService';
import { formatZAR } from '../../utils/currency';
import { useNotification } from '../../context/NotificationContext';

export const ProductManager: React.FC = () => {
  const { showToast } = useNotification();
  const [products, setProducts] = useState<Product[]>(ProductService.getAllProducts(true));
  const categories = ProductService.getAllCategories();
  const variants = ProductService.getAllVariants();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(100);
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [volumeTiers, setVolumeTiers] = useState<VolumeDiscountTier[]>([]);
  const [selectedVariantTypeIds, setSelectedVariantTypeIds] = useState<string[]>([]);

  const refreshProducts = () => {
    setProducts(ProductService.getAllProducts(true));
  };

  const handleToggleActive = (id: string) => {
    const res = ProductService.toggleProductActive(id);
    if (res.success) {
      showToast(res.message, 'info');
      refreshProducts();
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setSku('TSH-NEW');
    setName('');
    setDescription('');
    setBasePrice(100);
    setCategoryId(categories[0]?.id || '');
    setImageUrl('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80');
    setVolumeTiers([
      { id: 'vt_1', minQuantity: 1, maxQuantity: 24, discountPercentage: 0 },
      { id: 'vt_2', minQuantity: 25, maxQuantity: 49, discountPercentage: 10 },
      { id: 'vt_3', minQuantity: 50, maxQuantity: null, discountPercentage: 20 },
    ]);
    setSelectedVariantTypeIds(variants.map(v => v.id));
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setSku(prod.sku);
    setName(prod.name);
    setDescription(prod.description);
    setBasePrice(prod.basePrice);
    setCategoryId(prod.categoryId);
    setImageUrl(prod.images[0] || '');
    setVolumeTiers(prod.volumeTiers);
    setSelectedVariantTypeIds(prod.variantTypeIds);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const res = ProductService.saveProduct({
      id: editingProduct?.id,
      sku,
      name,
      description,
      basePrice,
      categoryId,
      images: [imageUrl],
      volumeTiers,
      variantTypeIds: selectedVariantTypeIds,
    });

    if (res.success) {
      showToast(res.message, 'success');
      setIsModalOpen(false);
      refreshProducts();
    } else {
      showToast(res.message, 'error');
    }
  };

  const filtered = products.filter(
    p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-serif italic text-white tracking-tight">Product Catalog</h1>
          <p className="text-xs text-[#71717A] mt-1">
            Manage base pricing, SKU codes, volume discount tiers, and product specifications.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-6 py-2 bg-[#F59E0B] hover:bg-amber-400 text-black font-bold text-xs rounded-full shadow-lg shadow-amber-500/10 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[#0F0F0F] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
        />
      </div>

      {/* Product List Table */}
      <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#050505] text-[#71717A] font-semibold uppercase tracking-widest text-[10px] border-b border-white/5">
              <th className="p-4">Product Details</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Base Price</th>
              <th className="p-4">Volume Tiers</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-10 h-10 object-cover rounded-lg border border-white/5 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-[11px] text-[#71717A] truncate max-w-xs">{p.description}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-mono font-semibold text-[#F59E0B]">{p.sku}</td>
                <td className="p-4 font-bold text-white">{formatZAR(p.basePrice)}</td>
                <td className="p-4">
                  <span className="bg-[#050505] text-[#D4D4D8] px-2.5 py-1 rounded-full border border-white/5 text-[10px]">
                    {p.volumeTiers.length} Tiers
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${
                      p.isActive
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {p.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleToggleActive(p.id)}
                    title={p.isActive ? 'Deactivate Product' : 'Activate Product'}
                    className="p-1.5 bg-[#050505] hover:bg-white/5 text-[#71717A] hover:text-white rounded-lg border border-white/5 transition-colors"
                  >
                    {p.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 bg-[#050505] hover:bg-white/5 text-[#F59E0B] rounded-lg border border-white/5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-white">
              {editingProduct ? 'Edit Product Item' : 'Create Product Item'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">Base Price (ZAR) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={basePrice}
                    onChange={e => setBasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#050505] text-[#71717A] hover:text-white text-xs font-semibold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#F59E0B] hover:bg-amber-400 text-black text-xs font-bold rounded-full"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

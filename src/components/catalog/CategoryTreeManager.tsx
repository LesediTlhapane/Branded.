import React, { useState } from 'react';
import { FolderTree, Plus, Edit, CornerDownRight } from 'lucide-react';
import { Category } from '../../types';
import { ProductService } from '../../services/ProductService';
import { useNotification } from '../../context/NotificationContext';

export const CategoryTreeManager: React.FC = () => {
  const { showToast } = useNotification();
  const [categories, setCategories] = useState<Category[]>(ProductService.getAllCategories());
  const [categoryTree, setCategoryTree] = useState<Category[]>(ProductService.getCategoryTree());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [parentIdInput, setParentIdInput] = useState<string>('');

  const refreshCategories = () => {
    setCategories(ProductService.getAllCategories());
    setCategoryTree(ProductService.getCategoryTree());
  };

  const handleOpenCreate = (parentCatId: string | null = null) => {
    setEditingCategory(null);
    setNameInput('');
    setDescInput('');
    setParentIdInput(parentCatId || '');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setNameInput(cat.name);
    setDescInput(cat.description || '');
    setParentIdInput(cat.parentId || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const res = ProductService.saveCategory({
      id: editingCategory?.id,
      name: nameInput,
      description: descInput,
      parentId: parentIdInput || null,
    });

    if (res.success) {
      showToast(res.message, 'success');
      setIsModalOpen(false);
      refreshCategories();
    } else {
      showToast(res.message, 'error');
    }
  };

  // Recursive Category Tree Node Renderer
  const renderCategoryNode = (cat: Category, depth: number = 0) => {
    return (
      <div key={cat.id} className="space-y-1">
        <div
          className={`p-4 bg-[#0F0F0F] border border-white/5 rounded-2xl flex items-center justify-between hover:border-white/10 transition-colors ${
            depth > 0 ? 'ml-6 border-l-2 border-l-[#F59E0B]' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            {depth > 0 && <CornerDownRight className="w-4 h-4 text-[#F59E0B] shrink-0" />}
            <FolderTree className={`w-4 h-4 ${depth === 0 ? 'text-[#F59E0B]' : 'text-[#71717A]'}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{cat.name}</span>
                <span className="text-[10px] text-[#71717A] font-mono">slug: {cat.slug}</span>
              </div>
              {cat.description && <p className="text-[11px] text-[#71717A] mt-0.5">{cat.description}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenCreate(cat.id)}
              className="px-3 py-1 bg-[#050505] hover:bg-white/5 text-[#F59E0B] text-xs font-semibold rounded-full border border-white/5 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Subcategory
            </button>
            <button
              onClick={() => handleOpenEdit(cat)}
              className="p-1.5 text-[#71717A] hover:text-white bg-[#050505] rounded-full border border-white/5 hover:bg-white/5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recursive Children */}
        {cat.children && cat.children.length > 0 && (
          <div className="space-y-1">
            {cat.children.map(child => renderCategoryNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-serif italic text-white tracking-tight">Category Structure</h1>
          <p className="text-xs text-[#71717A] mt-1">
            Hierarchical categorization for apparel, drinkware, and merchandise catalog.
          </p>
        </div>

        <button
          onClick={() => handleOpenCreate(null)}
          className="px-6 py-2 bg-[#F59E0B] hover:bg-amber-400 text-black font-bold text-xs rounded-full shadow-lg shadow-amber-500/10 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Root Category
        </button>
      </div>

      {/* Category Tree View */}
      <div className="space-y-2">
        {categoryTree.map(rootCat => renderCategoryNode(rootCat, 0))}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="Heavyweight T-Shirts"
                  className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">Parent Category</label>
                <select
                  value={parentIdInput}
                  onChange={e => setParentIdInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                >
                  <option value="">-- None (Root Category) --</option>
                  {categories
                    .filter(c => c.id !== editingCategory?.id)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={descInput}
                  onChange={e => setDescInput(e.target.value)}
                  placeholder="Optional description..."
                  className="w-full p-2.5 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

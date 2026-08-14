import React, { useState } from 'react';
import { Layers, Plus, Edit } from 'lucide-react';
import { VariantType } from '../../types';
import { ProductService } from '../../services/ProductService';
import { formatZAR } from '../../utils/currency';
import { useNotification } from '../../context/NotificationContext';

export const VariantManager: React.FC = () => {
  const { showToast } = useNotification();
  const [variants, setVariants] = useState<VariantType[]>(ProductService.getAllVariants());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantType | null>(null);

  const [name, setName] = useState('');
  const [values, setValues] = useState<{ id: string; name: string; priceDelta: number }[]>([
    { id: 'v_1', name: 'Option A', priceDelta: 0 },
    { id: 'v_2', name: 'Option B', priceDelta: 20 },
  ]);

  const refresh = () => setVariants(ProductService.getAllVariants());

  const handleOpenCreate = () => {
    setEditingVariant(null);
    setName('');
    setValues([{ id: 'v_1', name: 'Standard', priceDelta: 0 }]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: VariantType) => {
    setEditingVariant(v);
    setName(v.name);
    setValues(v.values);
    setIsModalOpen(true);
  };

  const handleAddValueRow = () => {
    setValues(prev => [...prev, { id: `v_${Date.now()}`, name: '', priceDelta: 0 }]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const res = ProductService.saveVariantType({
      id: editingVariant?.id || `var_${Date.now()}`,
      name,
      values,
      isReusable: true,
    });

    if (res.success) {
      showToast(res.message, 'success');
      setIsModalOpen(false);
      refresh();
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-serif italic text-white tracking-tight">Variant Configuration</h1>
          <p className="text-xs text-[#71717A] mt-1">
            Global sizes, colors, and branding options with fixed price deltas.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-6 py-2 bg-[#F59E0B] hover:bg-amber-400 text-black font-bold text-xs rounded-full shadow-lg shadow-amber-500/10 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Variant Type
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variants.map(v => (
          <div key={v.id} className="p-6 bg-[#0F0F0F] border border-white/5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#F59E0B]" />
                <h3 className="text-sm font-bold text-white">{v.name}</h3>
              </div>
              <button
                onClick={() => handleOpenEdit(v)}
                className="p-1.5 text-[#71717A] hover:text-white bg-[#050505] rounded-full border border-white/5"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {v.values.map(val => (
                <span
                  key={val.id}
                  className="px-3 py-1 bg-[#050505] text-[#D4D4D8] border border-white/5 rounded-full text-xs font-medium"
                >
                  {val.name}
                  {val.priceDelta > 0 ? (
                    <strong className="text-[#F59E0B] ml-1">+{formatZAR(val.priceDelta)}</strong>
                  ) : (
                    <span className="text-[#71717A] ml-1">(R0)</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">
              {editingVariant ? 'Edit Variant Group' : 'Create Variant Group'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">Variant Group Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Apparel Size or Embroidery Option"
                  className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#71717A]">Options & Price Deltas</label>
                  <button
                    type="button"
                    onClick={handleAddValueRow}
                    className="text-xs text-[#F59E0B] hover:underline flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3 h-3" /> Add Value
                  </button>
                </div>

                {values.map((valRow, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={valRow.name}
                      onChange={e => {
                        const updated = [...values];
                        updated[i].name = e.target.value;
                        setValues(updated);
                      }}
                      placeholder="Option Name (e.g. XL)"
                      className="flex-1 px-3 py-1.5 bg-[#050505] border border-white/10 rounded-xl text-xs text-white"
                    />

                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1.5 text-xs text-[#71717A] font-bold">+R</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={valRow.priceDelta}
                        onChange={e => {
                          const updated = [...values];
                          updated[i].priceDelta = parseFloat(e.target.value) || 0;
                          setValues(updated);
                        }}
                        className="w-full pl-8 pr-2 py-1.5 bg-[#050505] border border-white/10 rounded-xl text-xs font-bold text-white"
                      />
                    </div>
                  </div>
                ))}
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
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

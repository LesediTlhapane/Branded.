import {
  Product,
  Category,
  VariantType,
  VolumeDiscountTier,
} from '../types';
import { Repository } from '../db/storage';

export class ProductService {
  /**
   * Product Catalog Service.
   * TODO: Connect real Product API backend when API specification is provided.
   */

  // Products
  static getAllProducts(includeInactive: boolean = true): Product[] {
    const products = Repository.getProducts();
    if (includeInactive) return products;
    return products.filter(p => p.isActive);
  }

  static getProductById(id: string): Product | undefined {
    return Repository.getProducts().find(p => p.id === id);
  }

  static saveProduct(productData: Partial<Product> & { name: string; basePrice: number; categoryId: string }): { success: boolean; message: string; product?: Product } {
    if (productData.basePrice < 0) {
      return { success: false, message: 'Base price cannot be negative.' };
    }

    if (!productData.name || !productData.name.trim()) {
      return { success: false, message: 'Product name is required.' };
    }

    if (!productData.categoryId) {
      return { success: false, message: 'Category is required for products.' };
    }

    const products = Repository.getProducts();

    if (productData.id) {
      // Edit
      const index = products.findIndex(p => p.id === productData.id);
      if (index === -1) {
        return { success: false, message: 'Product not found.' };
      }

      const updated: Product = {
        ...products[index],
        ...productData,
        updatedAt: new Date().toISOString(),
      };

      products[index] = updated;
      Repository.saveProducts(products);
      return { success: true, message: 'Product updated successfully.', product: updated };
    } else {
      // Create
      const newProduct: Product = {
        id: `prod_${Math.random().toString(36).substring(2, 9)}`,
        sku: productData.sku?.trim() || 'PROD-SKU', // SKU non-unique permitted
        name: productData.name.trim(),
        description: productData.description?.trim() || '',
        basePrice: productData.basePrice,
        categoryId: productData.categoryId,
        isActive: productData.isActive ?? true,
        images: productData.images || ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'],
        volumeTiers: productData.volumeTiers || [
          { id: 'vt_def_1', minQuantity: 1, maxQuantity: 49, discountPercentage: 0 },
          { id: 'vt_def_2', minQuantity: 50, maxQuantity: null, discountPercentage: 10 },
        ],
        variantTypeIds: productData.variantTypeIds || ['var_size', 'var_colour', 'var_branding'],
        productSpecificVariantTypes: productData.productSpecificVariantTypes || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      products.push(newProduct);
      Repository.saveProducts(products);
      return { success: true, message: 'Product created successfully.', product: newProduct };
    }
  }

  static toggleProductActive(productId: string): { success: boolean; message: string; isActive?: boolean } {
    const products = Repository.getProducts();
    const target = products.find(p => p.id === productId);
    if (!target) return { success: false, message: 'Product not found.' };

    target.isActive = !target.isActive;
    target.updatedAt = new Date().toISOString();
    Repository.saveProducts(products);

    return {
      success: true,
      message: `Product "${target.name}" is now ${target.isActive ? 'active and available for quotes' : 'deactivated (historical quotes retained)'}.`,
      isActive: target.isActive,
    };
  }

  // Categories (Unlimited Recursive Depth)
  static getAllCategories(includeInactive: boolean = true): Category[] {
    const categories = Repository.getCategories();
    if (includeInactive) return categories;
    return categories.filter(c => c.isActive);
  }

  /**
   * Builds recursive hierarchy tree for unlimited depth category structures.
   */
  static getCategoryTree(includeInactive: boolean = true): Category[] {
    const categories = this.getAllCategories(includeInactive);
    const categoryMap = new Map<string, Category>();

    // Copy items & init children
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    const rootCategories: Category[] = [];

    categoryMap.forEach(cat => {
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId)!.children!.push(cat);
      } else {
        rootCategories.push(cat);
      }
    });

    return rootCategories;
  }

  static saveCategory(data: { id?: string; name: string; description?: string; parentId: string | null; isActive?: boolean }): { success: boolean; message: string; category?: Category } {
    if (!data.name || !data.name.trim()) {
      return { success: false, message: 'Category name is required.' };
    }

    const categories = Repository.getCategories();

    if (data.id) {
      const index = categories.findIndex(c => c.id === data.id);
      if (index === -1) return { success: false, message: 'Category not found.' };

      // Prevent self-referential parent assignment
      if (data.parentId === data.id) {
        return { success: false, message: 'A category cannot be its own parent.' };
      }

      categories[index] = {
        ...categories[index],
        name: data.name.trim(),
        description: data.description?.trim(),
        parentId: data.parentId || null,
        isActive: data.isActive ?? categories[index].isActive,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      };

      Repository.saveCategories(categories);
      return { success: true, message: 'Category updated successfully.', category: categories[index] };
    } else {
      const newCat: Category = {
        id: `cat_${Math.random().toString(36).substring(2, 9)}`,
        name: data.name.trim(),
        description: data.description?.trim(),
        parentId: data.parentId || null,
        isActive: data.isActive ?? true,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      };

      categories.push(newCat);
      Repository.saveCategories(categories);
      return { success: true, message: 'Category created successfully.', category: newCat };
    }
  }

  // Variants (Reusable & Product-Specific)
  static getAllVariants(): VariantType[] {
    return Repository.getVariants();
  }

  static saveVariantType(variantData: VariantType): { success: boolean; message: string; variantType?: VariantType } {
    if (!variantData.name || !variantData.name.trim()) {
      return { success: false, message: 'Variant type name is required.' };
    }

    // Validate variant value price deltas cannot be negative
    for (const val of variantData.values) {
      if (val.priceDelta < 0) {
        return { success: false, message: `Variant price delta for "${val.name}" cannot be negative.` };
      }
    }

    const variants = Repository.getVariants();
    const index = variants.findIndex(v => v.id === variantData.id);

    if (index !== -1) {
      variants[index] = variantData;
      Repository.saveVariants(variants);
      return { success: true, message: 'Variant type updated.', variantType: variantData };
    } else {
      const newVar: VariantType = {
        ...variantData,
        id: variantData.id || `var_${Math.random().toString(36).substring(2, 9)}`,
      };
      variants.push(newVar);
      Repository.saveVariants(variants);
      return { success: true, message: 'Variant type created.', variantType: newVar };
    }
  }
}

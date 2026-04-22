import { useEffect, useCallback } from 'react';
import { useProductStore } from '../stores/productStore';
import { getAllProducts, getProductsByCategory, createProduct, updateProduct, deleteProduct } from '../services/productService';
import { ProductCategory } from '../types/product.types';

export const useProducts = (category?: ProductCategory) => {
  const { filteredProducts, loading, error, setProducts, setFilters, setLoading, setError } = useProductStore();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = category ? await getProductsByCategory(category) : await getAllProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return { products: filteredProducts, loading, error, refetch: fetchProducts, setFilters, createProduct, updateProduct, deleteProduct };
};

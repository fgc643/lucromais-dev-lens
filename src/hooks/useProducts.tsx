import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ProductData } from '@/types/calculator';
import { useToast } from './use-toast';

export const useProducts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProducts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProducts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts: ProductData[] = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        costPrice: Number(p.cost_price),
        salePrice: Number(p.sale_price),
        shippingCost: Number(p.shipping_cost),
        packagingCost: Number(p.packaging_cost),
        adsCost: Number(p.ads_cost),
        operationalCost: Number(p.operational_cost),
        simplesNacionalRate: Number(p.simples_nacional_rate),
        installments: p.installments,
        marketplace: p.marketplace,
        plan: p.plan,
        createdAt: new Date(p.created_at),
      }));

      setProducts(formattedProducts);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async (product: ProductData) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('products').insert({
        user_id: user.id,
        name: product.name,
        category: product.category,
        cost_price: product.costPrice,
        sale_price: product.salePrice,
        shipping_cost: product.shippingCost,
        packaging_cost: product.packagingCost,
        ads_cost: product.adsCost,
        operational_cost: product.operationalCost,
        simples_nacional_rate: product.simplesNacionalRate,
        installments: product.installments,
        marketplace: product.marketplace,
        plan: product.plan,
      });

      if (error) throw error;

      await loadProducts();
      
      toast({
        title: "Produto salvo",
        description: "Produto adicionado ao seu histórico!",
      });
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: "Erro ao salvar produto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== id));
      
      toast({
        title: "Produto removido",
        description: "Produto deletado com sucesso!",
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const clearAllProducts = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setProducts([]);
      
      toast({
        title: "Histórico limpo",
        description: "Todos os produtos foram removidos!",
      });
    } catch (error: any) {
      console.error('Error clearing products:', error);
      toast({
        title: "Erro ao limpar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    products,
    loading,
    saveProduct,
    deleteProduct,
    clearAllProducts,
    refreshProducts: loadProducts,
  };
};

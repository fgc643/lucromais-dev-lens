import { ProductData } from "@/types/calculator";

const STORAGE_KEY = "lucro_mais_history";

export const saveToHistory = (product: ProductData): void => {
  try {
    const history = getHistory();
    history.unshift(product);
    // Manter apenas os últimos 50 cálculos
    const limitedHistory = history.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error("Erro ao salvar no histórico:", error);
  }
};

export const getHistory = (): ProductData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Converter strings de data para objetos Date
    return parsed.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
    }));
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    return [];
  }
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Erro ao limpar histórico:", error);
  }
};

export const deleteFromHistory = (id: string): void => {
  try {
    const history = getHistory();
    const filtered = history.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Erro ao deletar do histórico:", error);
  }
};

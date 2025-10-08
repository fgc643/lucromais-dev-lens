import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface UserSettings {
  default_packaging_cost: number;
  default_ads_percentage: number;
  default_operational_cost: number;
  default_simples_nacional_rate: number;
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({
    default_packaging_cost: 0,
    default_ads_percentage: 0,
    default_operational_cost: 0,
    default_simples_nacional_rate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          default_packaging_cost: Number(data.default_packaging_cost) || 0,
          default_ads_percentage: Number(data.default_ads_percentage) || 0,
          default_operational_cost: Number(data.default_operational_cost) || 0,
          default_simples_nacional_rate: Number(data.default_simples_nacional_rate) || 0,
        });
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .update(newSettings)
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings({ ...settings, ...newSettings });
      
      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return { settings, updateSettings, loading };
};

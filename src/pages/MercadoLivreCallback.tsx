import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const MELI_REDIRECT_URI = "https://lucromais-dev-lens.lovable.app/auth/mercadolivre";

export default function MercadoLivreCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Conectando com Mercado Livre...');
  const code = searchParams.get('code');

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      if (!code) {
        setStatus('error');
        setMessage('Código não encontrado');
        setTimeout(() => window.close(), 2000);
        return;
      }

      try {
        // Exchange code for token via Edge Function
        const { data, error } = await supabase.functions.invoke('meli-auth', {
          body: { code, redirect_uri: MELI_REDIRECT_URI }
        });

        if (error || !data?.success) {
          throw new Error(data?.error || error?.message || 'Erro ao obter token');
        }

        // Save tokens to localStorage
        localStorage.setItem('meli_token', data.access_token);
        localStorage.setItem('meli_refresh_token', data.refresh_token);
        localStorage.setItem('meli_user_id', data.user_id);
        localStorage.setItem('meli_connected', 'true');

        setStatus('success');
        setMessage('Conectado com sucesso!');
        
        // Close popup after short delay
        setTimeout(() => window.close(), 1000);
      } catch (error) {
        console.error('Erro na autenticação:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erro ao conectar');
        setTimeout(() => window.close(), 3000);
      }
    };

    exchangeCodeForToken();
  }, [code]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8">
        <div className="w-16 h-16 rounded-full bg-[#FFE600] flex items-center justify-center mx-auto mb-4">
          <img 
            src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/favicon.svg"
            alt="Mercado Livre"
            className="w-10 h-10"
          />
        </div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">{message}</h2>
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFE600] mx-auto"></div>
        )}
        {status === 'success' && (
          <div className="text-green-500 text-4xl">✓</div>
        )}
        {status === 'error' && (
          <div className="text-red-500 text-4xl">✗</div>
        )}
        <p className="text-sm text-muted-foreground mt-4">
          {status === 'loading' ? 'Aguarde...' : 'Esta janela será fechada automaticamente.'}
        </p>
      </div>
    </div>
  );
}

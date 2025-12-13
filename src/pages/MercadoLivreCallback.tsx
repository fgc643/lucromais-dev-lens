import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const MercadoLivreCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Conectando com Mercado Livre...');

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code) {
      setStatus('error');
      setMessage('Código não encontrado');
      setTimeout(() => {
        if (window.opener) window.close();
        else navigate('/');
      }, 2000);
      return;
    }

    const exchangeToken = async () => {
      try {
        setMessage('Trocando código por token...');
        
        const response = await fetch('https://api.mercadolibre.com/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: '4649399957609336',
            client_secret: 'UCe0tu5xOGE4PSHvoqQo17aCcKbnMLf8',
            code: code,
            redirect_uri: 'https://lucromais-dev-lens.lovable.app/auth/mercadolivre'
          })
        });

        const data = await response.json();
        console.log('Resposta API ML:', data);

        if (data.access_token) {
          localStorage.setItem('meli_token', data.access_token);
          localStorage.setItem('meli_refresh_token', data.refresh_token || '');
          localStorage.setItem('meli_user_id', String(data.user_id || ''));
          localStorage.setItem('meli_connected', 'true');
          
          setStatus('success');
          setMessage('Conectado com sucesso!');
          
          setTimeout(() => {
            if (window.opener) window.close();
            else navigate('/');
          }, 1000);
        } else {
          throw new Error(data.message || data.error || 'Token não recebido');
        }
      } catch (error) {
        console.error('Erro ao trocar token:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erro ao conectar');
        
        setTimeout(() => {
          if (window.opener) window.close();
          else navigate('/');
        }, 3000);
      }
    };

    exchangeToken();
  }, [searchParams, navigate]);

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
          <Loader2 className="w-8 h-8 animate-spin text-[#FFE600] mx-auto" />
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
};

export default MercadoLivreCallback;

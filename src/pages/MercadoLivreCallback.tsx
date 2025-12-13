import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function MercadoLivreCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  useEffect(() => {
    if (!code) {
      toast.error('Código não encontrado');
      navigate('/');
      return;
    }

    // Por enquanto só salvar o code
    localStorage.setItem('meli_code', code);
    toast.success('Conectado ao Mercado Livre!');
    navigate('/');
  }, [code, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h2 className="text-2xl mb-4 text-foreground">Conectando com Mercado Livre...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFE600] mx-auto"></div>
      </div>
    </div>
  );
}

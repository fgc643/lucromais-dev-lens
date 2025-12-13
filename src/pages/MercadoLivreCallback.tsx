import { useSearchParams } from "react-router-dom";

const MercadoLivreCallback = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">
          Redirect do Mercado Livre funcionando
        </h1>
        <div className="p-4 rounded-lg bg-muted">
          {code ? (
            <p className="text-foreground">
              <span className="font-semibold">Código recebido:</span>{" "}
              <code className="bg-background px-2 py-1 rounded text-sm break-all">
                {code}
              </code>
            </p>
          ) : (
            <p className="text-muted-foreground">Nenhum código recebido</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MercadoLivreCallback;

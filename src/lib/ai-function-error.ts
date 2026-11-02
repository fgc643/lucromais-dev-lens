import { FunctionsHttpError } from '@supabase/supabase-js';

export async function aiFunctionErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    const response = error.context;
    if ([400, 401, 429].includes(response.status)) {
      try {
        const body = await response.clone().json();
        if (typeof body?.error === 'string') return body.error;
      } catch { /* Fall back to a safe status message. */ }
      if (response.status === 401) return 'Faça login para usar a IA';
      if (response.status === 429) return 'Limite de usos por hora atingido. Tente mais tarde.';
    }
  }
  return 'Não foi possível concluir a solicitação de IA. Tente novamente mais tarde.';
}
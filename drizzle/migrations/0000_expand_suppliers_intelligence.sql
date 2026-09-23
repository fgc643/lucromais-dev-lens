ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS cnpj text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS products_supplied text,
  ADD COLUMN IF NOT EXISTS payment_terms text,
  ADD COLUMN IF NOT EXISTS lead_time_days integer,
  ADD COLUMN IF NOT EXISTS min_order_value numeric,
  ADD COLUMN IF NOT EXISTS average_discount numeric,
  ADD COLUMN IF NOT EXISTS rating integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'ativo',
  ADD COLUMN IF NOT EXISTS last_purchase_at date;

CREATE INDEX IF NOT EXISTS suppliers_user_id_idx ON public.suppliers (user_id);
CREATE INDEX IF NOT EXISTS suppliers_category_idx ON public.suppliers (category);
CREATE INDEX IF NOT EXISTS suppliers_status_idx ON public.suppliers (status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
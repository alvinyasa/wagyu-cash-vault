CREATE TYPE public.metode_pembayaran AS ENUM ('transfer', 'cash');
ALTER TABLE public.kasbon ADD COLUMN metode_pembayaran public.metode_pembayaran NOT NULL DEFAULT 'transfer';
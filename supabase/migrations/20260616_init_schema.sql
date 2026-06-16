-- =====================================================================
-- Commonplace & Rotinas — Schema inicial
-- Execute no SQL Editor do Supabase (ou via `supabase db push`).
-- =====================================================================

-- ---------- Tabelas principais ----------

CREATE TABLE IF NOT EXISTS categories (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name      TEXT NOT NULL,
    color_hex VARCHAR(7) NOT NULL
);

CREATE TABLE IF NOT EXISTS subcategories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS commonplace_entries (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    title          TEXT NOT NULL,
    body_content   TEXT,
    audio_url      TEXT,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS floating_elements (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id     UUID REFERENCES commonplace_entries(id) ON DELETE CASCADE,
    type         VARCHAR(20) NOT NULL CHECK (type IN ('sticker', 'post-it', 'sketch')),
    content_data TEXT,
    pos_x        FLOAT NOT NULL DEFAULT 0,
    pos_y        FLOAT NOT NULL DEFAULT 0,
    scale        FLOAT NOT NULL DEFAULT 1.0,
    rotation     INT   NOT NULL DEFAULT 0,
    z_index      INT   NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS transactions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title             TEXT NOT NULL,
    amount            NUMERIC(10,2) NOT NULL,
    type              VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense', 'savings')),
    due_date          DATE,
    status            VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending')),
    receipt_media_url TEXT,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices úteis para os relacionamentos mais consultados
CREATE INDEX IF NOT EXISTS idx_subcategories_category    ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_entries_subcategory       ON commonplace_entries(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_floating_entry            ON floating_elements(entry_id);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date     ON transactions(due_date);

-- ---------- Seed: categorias mestre por cor ----------

INSERT INTO categories (name, color_hex)
SELECT * FROM (VALUES
    ('Reflexões & Diário (Azul)',        '#3b82f6'),
    ('Inspirações & Referências (Roxo)', '#a855f7'),
    ('Ideias & Criação (Verde)',         '#22c55e'),
    ('Estilo de Vida & Prática (Amarelo)','#eab308'),
    ('Curiosidade & Intelecto (Laranja)','#f97316')
) AS seed(name, color_hex)
WHERE NOT EXISTS (SELECT 1 FROM categories);

-- ---------- Storage: bucket para comprovantes financeiros ----------
-- (usado no Prompt 6 — OCR de Pix/boletos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('financial-receipts', 'financial-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Adăugare coloane lipsă la tabelul pilgrimages pentru funcționalitățile de promovare

-- Adăugăm draft cu valoare implicită false (publicat)
ALTER TABLE pilgrimages ADD COLUMN IF NOT EXISTS draft BOOLEAN DEFAULT FALSE;

-- Adăugăm suport pentru promovări
ALTER TABLE pilgrimages ADD COLUMN IF NOT EXISTS promoted BOOLEAN DEFAULT FALSE;
ALTER TABLE pilgrimages ADD COLUMN IF NOT EXISTS promotion_level TEXT DEFAULT 'none';
ALTER TABLE pilgrimages ADD COLUMN IF NOT EXISTS promotion_expiry TIMESTAMP;
ALTER TABLE pilgrimages ADD COLUMN IF NOT EXISTS promotion_started_at TIMESTAMP;

-- Comentariu pentru documentare
COMMENT ON COLUMN pilgrimages.draft IS 'Indicator pentru pelerinaje în starea de ciornă sau publicate';
COMMENT ON COLUMN pilgrimages.promoted IS 'Indicator pentru pelerinaje promovate';
COMMENT ON COLUMN pilgrimages.promotion_level IS 'Nivelul de promovare: none, basic, premium, exclusive';
COMMENT ON COLUMN pilgrimages.promotion_expiry IS 'Data la care expiră promovarea';
COMMENT ON COLUMN pilgrimages.promotion_started_at IS 'Data la care a început promovarea';
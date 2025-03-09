-- Adăugăm coloane pentru resetarea parolei
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

-- Adăugăm coloane pentru autentificarea în doi pași (2FA)
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_expiry TIMESTAMP;
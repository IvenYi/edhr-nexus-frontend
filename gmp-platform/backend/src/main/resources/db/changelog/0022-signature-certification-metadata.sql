ALTER TABLE signature ADD COLUMN IF NOT EXISTS signature_key VARCHAR(96);
ALTER TABLE signature ADD COLUMN IF NOT EXISTS certified_at_epoch BIGINT;
ALTER TABLE signature ADD COLUMN IF NOT EXISTS certified_at TIMESTAMP;
ALTER TABLE signature ADD COLUMN IF NOT EXISTS expires_at_epoch BIGINT;
ALTER TABLE signature ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE signature ADD COLUMN IF NOT EXISTS authorization_notice_file_id BIGINT;

UPDATE signature
SET certified_at = COALESCE(certified_at, signed_at),
    certified_at_epoch = COALESCE(certified_at_epoch, CAST(EXTRACT(EPOCH FROM signed_at) * 1000 AS BIGINT)),
    expires_at = COALESCE(expires_at, signed_at + INTERVAL '365 days'),
    expires_at_epoch = COALESCE(expires_at_epoch, CAST(EXTRACT(EPOCH FROM (signed_at + INTERVAL '365 days')) * 1000 AS BIGINT)),
    signature_key = COALESCE(signature_key, 'ESIGN-' || id)
WHERE signed_at IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_signature_key ON signature(signature_key) WHERE signature_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_signature_expires_at ON signature(expires_at);

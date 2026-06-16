ALTER TABLE user_account
    ADD COLUMN IF NOT EXISTS avatar_file_id BIGINT,
    ADD COLUMN IF NOT EXISTS birthday DATE;

CREATE INDEX IF NOT EXISTS idx_user_avatar_file ON user_account(avatar_file_id);

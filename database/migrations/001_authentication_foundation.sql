-- ============================================================
-- BAJIM BLOSSOM
-- Migration: 001 Authentication Foundation
-- Database: PostgreSQL / Supabase
--
-- Supabase is used only as the PostgreSQL database host.
-- Authentication is handled by the Express.js backend.
-- ============================================================


-- ============================================================
-- 1. REQUIRED EXTENSION
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- 2. USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS baj_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    password_hash TEXT NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    last_login_at TIMESTAMPTZ NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 3. USER PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS baj_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE,

    member_id VARCHAR(30) UNIQUE,

    full_name VARCHAR(150) NOT NULL,

    phone VARCHAR(30) NOT NULL,

    email VARCHAR(255) NOT NULL,

    address TEXT NULL,

    emergency_contact VARCHAR(150) NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',

    joined_at TIMESTAMPTZ NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_baj_profiles_user
        FOREIGN KEY (user_id)
        REFERENCES baj_users(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_baj_profiles_phone
        UNIQUE (phone),

    CONSTRAINT chk_baj_profiles_role
        CHECK (
            role IN (
                'MEMBER',
                'ADMIN',
                'SUPER_ADMIN'
            )
        ),

    CONSTRAINT chk_baj_profiles_status
        CHECK (
            status IN (
                'PENDING_APPROVAL',
                'ACTIVE',
                'INACTIVE',
                'REJECTED'
            )
        )
);


-- ============================================================
-- 4. CASE-INSENSITIVE UNIQUE EMAIL
-- ============================================================
--
-- This prevents:
--
-- John@example.com
-- john@example.com
-- JOHN@EXAMPLE.COM
--
-- from becoming separate accounts.
--
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_baj_profiles_email_lower
    ON baj_profiles (LOWER(email));


-- ============================================================
-- 5. SESSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS baj_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    session_token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    revoked_at TIMESTAMPTZ NULL,

    ip_address INET NULL,

    user_agent TEXT NULL,

    CONSTRAINT fk_baj_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES baj_users(id)
        ON DELETE CASCADE
);


-- ============================================================
-- 6. PASSWORD RESET TOKENS
-- ============================================================

CREATE TABLE IF NOT EXISTS baj_password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    used_at TIMESTAMPTZ NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_baj_password_reset_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES baj_users(id)
        ON DELETE CASCADE
);


-- ============================================================
-- 7. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_baj_profiles_user_id
    ON baj_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_baj_profiles_member_id
    ON baj_profiles(member_id);

CREATE INDEX IF NOT EXISTS idx_baj_profiles_role
    ON baj_profiles(role);

CREATE INDEX IF NOT EXISTS idx_baj_profiles_status
    ON baj_profiles(status);

CREATE INDEX IF NOT EXISTS idx_baj_sessions_user_id
    ON baj_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_baj_sessions_expires_at
    ON baj_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_baj_sessions_revoked_at
    ON baj_sessions(revoked_at);

CREATE INDEX IF NOT EXISTS idx_baj_password_reset_tokens_user_id
    ON baj_password_reset_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_baj_password_reset_tokens_expires_at
    ON baj_password_reset_tokens(expires_at);


-- ============================================================
-- 8. UPDATED_AT FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION baj_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- ============================================================
-- 9. UPDATED_AT TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trg_baj_users_updated_at
ON baj_users;

CREATE TRIGGER trg_baj_users_updated_at
BEFORE UPDATE ON baj_users
FOR EACH ROW
EXECUTE FUNCTION baj_set_updated_at();


DROP TRIGGER IF EXISTS trg_baj_profiles_updated_at
ON baj_profiles;

CREATE TRIGGER trg_baj_profiles_updated_at
BEFORE UPDATE ON baj_profiles
FOR EACH ROW
EXECUTE FUNCTION baj_set_updated_at();


-- ============================================================
-- 10. STRUCTURAL VERIFICATION
-- ============================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'baj_users'
    ) THEN
        RAISE EXCEPTION 'baj_users table was not created.';
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'baj_profiles'
    ) THEN
        RAISE EXCEPTION 'baj_profiles table was not created.';
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'baj_sessions'
    ) THEN
        RAISE EXCEPTION 'baj_sessions table was not created.';
    END IF;


    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'baj_password_reset_tokens'
    ) THEN
        RAISE EXCEPTION 'baj_password_reset_tokens table was not created.';
    END IF;

END
$$;


-- ============================================================
-- 11. DISPLAY CREATED BAJIM TABLES
-- ============================================================

SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'baj_%'
ORDER BY table_name;

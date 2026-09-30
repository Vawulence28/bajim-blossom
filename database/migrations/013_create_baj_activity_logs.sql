CREATE TABLE IF NOT EXISTS baj_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    actor_id UUID NOT NULL,

    action VARCHAR(100) NOT NULL,

    entity_type VARCHAR(100),

    entity_id UUID,

    description TEXT NOT NULL,

    metadata JSONB,

    ip_address INET,

    user_agent TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_baj_activity_logs_actor
        FOREIGN KEY (actor_id)
        REFERENCES baj_profiles(id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_baj_activity_logs_actor_id
    ON baj_activity_logs(actor_id);

CREATE INDEX IF NOT EXISTS idx_baj_activity_logs_action
    ON baj_activity_logs(action);

CREATE INDEX IF NOT EXISTS idx_baj_activity_logs_entity
    ON baj_activity_logs(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_baj_activity_logs_created_at
    ON baj_activity_logs(created_at DESC);

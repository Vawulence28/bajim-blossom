/*
|--------------------------------------------------------------------------
| BAJIM BLOSSOM
| Migration 002 — Member Portal Business Foundation
|--------------------------------------------------------------------------
|
| Purpose:
| Establish the PostgreSQL structures required for:
|
| - Contribution cycles
| - Member contributions
| - Manual payments
| - Fines
| - Member items
| - Announcements
|
| Authentication tables are created by:
| 001_authentication_foundation.sql
|
| All custom tables use the required baj_ prefix.
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| 1. CONTRIBUTION CYCLES
|--------------------------------------------------------------------------
|
| A contribution cycle represents one contribution period.
|
| Example:
| Weekly cycle
| Amount: ₦3,000
| Due: Friday
| Grace period: Saturday 10:00 AM
| Fine: ₦500
|
| Amounts and deadlines are stored per cycle so historical records
| are not changed when future settings change.
|--------------------------------------------------------------------------
*/

CREATE TABLE IF NOT EXISTS baj_contribution_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cycle_name VARCHAR(150) NOT NULL,

    starts_at TIMESTAMPTZ NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    grace_until TIMESTAMPTZ NOT NULL,

    contribution_amount NUMERIC(12, 2) NOT NULL,
    fine_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_baj_cycles_amount
        CHECK (contribution_amount >= 0),

    CONSTRAINT chk_baj_cycles_fine
        CHECK (fine_amount >= 0),

    CONSTRAINT chk_baj_cycles_dates
        CHECK (
            starts_at < due_at
            AND due_at <= grace_until
        ),

    CONSTRAINT chk_baj_cycles_status
        CHECK (
            status IN (
                'DRAFT',
                'OPEN',
                'CLOSED',
                'CANCELLED'
            )
        )
);


/*
|--------------------------------------------------------------------------
| 2. MEMBER CONTRIBUTIONS
|--------------------------------------------------------------------------
|
| One record represents one member's expected contribution for one cycle.
|
| This is deliberately separate from payments because:
|
| contribution obligation != payment transaction
|
| A member may have an expected contribution even before payment.
|--------------------------------------------------------------------------
*/

CREATE TABLE IF NOT EXISTS baj_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    member_id UUID NOT NULL,
    cycle_id UUID NOT NULL,

    expected_amount NUMERIC(12, 2) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    paid_at TIMESTAMPTZ,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_baj_contributions_member
        FOREIGN KEY (member_id)
        REFERENCES baj_profiles(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_baj_contributions_cycle
        FOREIGN KEY (cycle_id)
        REFERENCES baj_contribution_cycles(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_baj_contribution_member_cycle
        UNIQUE (member_id, cycle_id),

    CONSTRAINT chk_baj_contributions_amount
        CHECK (expected_amount >= 0),

    CONSTRAINT chk_baj_contributions_status
        CHECK (
            status IN (
                'PENDING',
                'PARTIALLY_PAID',
                'PAID',
                'OVERDUE',
                'FINE_APPLIED',
                'CANCELLED'
            )
        )
);


/*
|--------------------------------------------------------------------------
| 3. PAYMENTS
|--------------------------------------------------------------------------
|
| Manual payment records only.
|
| There is deliberately no online payment gateway structure here.
|
| Payments are retained for financial history.
| They should not be casually deleted.
|--------------------------------------------------------------------------
*/

CREATE TABLE IF NOT EXISTS baj_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    contribution_id UUID NOT NULL,

    amount NUMERIC(12, 2) NOT NULL,

    payment_method VARCHAR(30) NOT NULL,

    payment_status VARCHAR(30) NOT NULL DEFAULT 'VERIFIED',

    payment_reference VARCHAR(150),

    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    recorded_by UUID,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_baj_payments_contribution
        FOREIGN KEY (contribution_id)
        REFERENCES baj_contributions(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_baj_payments_recorded_by
        FOREIGN KEY (recorded_by)
        REFERENCES baj_profiles(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_baj_payments_amount
        CHECK (amount > 0),

    CONSTRAINT chk_baj_payments_method
        CHECK (
            payment_method IN (
                'CASH',
                'BANK_TRANSFER'
            )
        ),

    CONSTRAINT chk_baj_payments_status
        CHECK (
            payment_status IN (
                'PENDING',
                'VERIFIED',
                'REJECTED'
            )
        )
);


/*
|--------------------------------------------------------------------------
| 4. FINES
|--------------------------------------------------------------------------
|
| Fines are tied to a specific member contribution.
|
| The amount is stored on the fine itself so historical financial
| records are preserved even if future system settings change.
|--------------------------------------------------------------------------
*/

CREATE TABLE IF NOT EXISTS baj_fines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    contribution_id UUID NOT NULL,

    amount NUMERIC(12, 2) NOT NULL,

    reason VARCHAR(255) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'OUTSTANDING',

    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    paid_at TIMESTAMPTZ,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_baj_fines_contribution
        FOREIGN KEY (contribution_id)
        REFERENCES baj_contributions(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_baj_fines_amount
        CHECK (amount > 0),

    CONSTRAINT chk_baj_fines_status
        CHECK (
            status IN (
                'OUTSTANDING',
                'PAID',
                'WAIVED'
            )
        )
);


/*
|--------------------------------------------------------------------------
| 5. MEMBER ITEMS
|--------------------------------------------------------------------------
|
| Records an item associated with a member.
|
| This supports the member's "My Items" section without making
| assumptions about inventory/payment processing.
|--------------------------------------------------------------------------
*/

CREATE TABLE IF NOT EXISTS baj_member_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    member_id UUID NOT NULL,

    item_name VARCHAR(200) NOT NULL,
    item_description TEXT,

    quantity INTEGER NOT NULL DEFAULT 1,

    status VARCHAR(30) NOT NULL DEFAULT 'ASSIGNED',

    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    collected_at TIMESTAMPTZ,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_baj_member_items_member
        FOREIGN KEY (member_id)
        REFERENCES baj_profiles(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_baj_member_items_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_baj_member_items_status
        CHECK (
            status IN (
                'ASSIGNED',
                'READY',
                'COLLECTED',
                'CANCELLED'
            )
        )
);


/*
|--------------------------------------------------------------------------
| 6. ANNOUNCEMENTS
|--------------------------------------------------------------------------
|
| Announcements are published by an administrator.
|
| created_by references baj_profiles because the authenticated
| administrative account is represented by a profile.
|--------------------------------------------------------------------------
*/

CREATE TABLE IF NOT EXISTS baj_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,

    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    published_at TIMESTAMPTZ,

    created_by UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_baj_announcements_created_by
        FOREIGN KEY (created_by)
        REFERENCES baj_profiles(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_baj_announcements_category
        CHECK (
            category IN (
                'GENERAL',
                'CONTRIBUTION',
                'PAYMENT',
                'ITEM',
                'IMPORTANT'
            )
        ),

    CONSTRAINT chk_baj_announcements_status
        CHECK (
            status IN (
                'DRAFT',
                'PUBLISHED',
                'ARCHIVED'
            )
        )
);


/*
|--------------------------------------------------------------------------
| 7. INDEXES
|--------------------------------------------------------------------------
*/


CREATE INDEX IF NOT EXISTS idx_baj_cycles_status
    ON baj_contribution_cycles(status);

CREATE INDEX IF NOT EXISTS idx_baj_cycles_due_at
    ON baj_contribution_cycles(due_at);

CREATE INDEX IF NOT EXISTS idx_baj_cycles_starts_at
    ON baj_contribution_cycles(starts_at);


CREATE INDEX IF NOT EXISTS idx_baj_contributions_member
    ON baj_contributions(member_id);

CREATE INDEX IF NOT EXISTS idx_baj_contributions_cycle
    ON baj_contributions(cycle_id);

CREATE INDEX IF NOT EXISTS idx_baj_contributions_status
    ON baj_contributions(status);

CREATE INDEX IF NOT EXISTS idx_baj_contributions_member_status
    ON baj_contributions(member_id, status);


CREATE INDEX IF NOT EXISTS idx_baj_payments_contribution
    ON baj_payments(contribution_id);

CREATE INDEX IF NOT EXISTS idx_baj_payments_status
    ON baj_payments(payment_status);

CREATE INDEX IF NOT EXISTS idx_baj_payments_paid_at
    ON baj_payments(paid_at);

CREATE INDEX IF NOT EXISTS idx_baj_payments_recorded_by
    ON baj_payments(recorded_by);


CREATE INDEX IF NOT EXISTS idx_baj_fines_contribution
    ON baj_fines(contribution_id);

CREATE INDEX IF NOT EXISTS idx_baj_fines_status
    ON baj_fines(status);

CREATE INDEX IF NOT EXISTS idx_baj_fines_applied_at
    ON baj_fines(applied_at);


CREATE INDEX IF NOT EXISTS idx_baj_member_items_member
    ON baj_member_items(member_id);

CREATE INDEX IF NOT EXISTS idx_baj_member_items_status
    ON baj_member_items(status);


CREATE INDEX IF NOT EXISTS idx_baj_announcements_status
    ON baj_announcements(status);

CREATE INDEX IF NOT EXISTS idx_baj_announcements_published_at
    ON baj_announcements(published_at);

CREATE INDEX IF NOT EXISTS idx_baj_announcements_category
    ON baj_announcements(category);


/*
|--------------------------------------------------------------------------
| 8. UPDATED_AT TRIGGER FUNCTION
|--------------------------------------------------------------------------
*/

CREATE OR REPLACE FUNCTION baj_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


/*
|--------------------------------------------------------------------------
| 9. UPDATED_AT TRIGGERS
|--------------------------------------------------------------------------
*/

DROP TRIGGER IF EXISTS trg_baj_contribution_cycles_updated_at
ON baj_contribution_cycles;

CREATE TRIGGER trg_baj_contribution_cycles_updated_at
BEFORE UPDATE ON baj_contribution_cycles
FOR EACH ROW
EXECUTE FUNCTION baj_set_updated_at();


DROP TRIGGER IF EXISTS trg_baj_contributions_updated_at
ON baj_contributions;

CREATE TRIGGER trg_baj_contributions_updated_at
BEFORE UPDATE ON baj_contributions
FOR EACH ROW
EXECUTE FUNCTION baj_set_updated_at();


DROP TRIGGER IF EXISTS trg_baj_payments_updated_at
ON baj_payments;

CREATE TRIGGER trg_baj_payments_updated_at
BEFORE UPDATE ON baj_payments
FOR EACH ROW
EXECUTE FUNCTION baj_set_updated_at();


DROP TRIGGER IF EXISTS trg_baj_fines_updated_at
ON baj_fines;

CREATE TRIGGER trg_baj_fines_updated_at
BEFORE UPDATE ON baj_fines
FOR EACH ROW
EXECUTE FUNCTION baj_set_updated_at();


DROP TRIGGER IF EXISTS trg_baj_member_items_updated_at
ON baj_member_items;

CREATE TRIGGER trg_baj_member_items_updated_at
BEFORE UPDATE ON baj_member_items
FOR EACH ROW
EXECUTE FUNCTION baj_set_updated_at();


DROP TRIGGER IF EXISTS trg_baj_announcements_updated_at
ON baj_announcements;

CREATE TRIGGER trg_baj_announcements_updated_at
BEFORE UPDATE ON baj_announcements
FOR EACH ROW
EXECUTE FUNCTION baj_set_updated_at();

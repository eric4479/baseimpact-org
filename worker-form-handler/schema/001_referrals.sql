-- Referral log for Base Impact.
--
-- This table is the denominator of the connected referral rate. Without it there is
-- no rate to report, only a pile of anecdotes, which is why it is the first thing
-- built and the thing that has to be fastest to fill in.
--
-- DESIGN RULES, and why:
--
--   * No personal data. The rate is a count, not a list of names. A person is an
--     opaque `person_ref` if one is needed at all, never a name, phone, or address.
--     The people being referred are often in a bad moment; a leaked log of who asked
--     for food assistance is a real harm and this table cannot cause it.
--
--   * Three outcomes, not two. `unknown` is the default and is a real state, not a
--     gap to be filled in with a guess. People who got help are far likelier to come
--     back and say so than people who were turned away, so folding silence into
--     either column would bend the number in whichever direction we chose. Keeping
--     unknown separate is what stops the rate from being a flattering fiction.
--
--   * resource_name is stored denormalized, not just resource_id. Listings get
--     renamed, merged, or dropped from the directory. A log that only points at a
--     row that no longer exists cannot answer "which referral did not connect",
--     which is the most useful thing this table produces.
--
--   * referred_at is the moment the referral was made, not the moment it was typed
--     in. Field notes get entered hours later and the rate should reflect when the
--     person was actually sent somewhere.

CREATE TABLE IF NOT EXISTS referrals (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  referred_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  resource_id    TEXT,
  resource_name  TEXT    NOT NULL,
  county         TEXT,
  channel        TEXT    NOT NULL DEFAULT 'phone'
                 CHECK (channel IN ('phone','text','in_person','email','other')),
  person_ref     TEXT,
  note           TEXT,
  outcome        TEXT    NOT NULL DEFAULT 'unknown'
                 CHECK (outcome IN ('unknown','connected','not_connected')),
  outcome_at     TEXT,
  outcome_note   TEXT,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_referrals_referred_at ON referrals (referred_at);
CREATE INDEX IF NOT EXISTS idx_referrals_outcome     ON referrals (outcome);
CREATE INDEX IF NOT EXISTS idx_referrals_resource    ON referrals (resource_id);

-- The headline numbers. Deliberately returns `unknown` alongside the two decided
-- states so no caller can quietly compute a rate that ignores non-response.
--
-- COALESCE matters: SUM() over zero rows is NULL, not 0, so an empty log would
-- report nulls and the page would render "null" on the day it launches. The
-- counts have to read 0 the moment the table exists.
CREATE VIEW IF NOT EXISTS referral_stats AS
SELECT
  COUNT(*)                                                                   AS referrals_made,
  COALESCE(SUM(CASE WHEN outcome = 'connected'     THEN 1 ELSE 0 END), 0)    AS connected,
  COALESCE(SUM(CASE WHEN outcome = 'not_connected' THEN 1 ELSE 0 END), 0)    AS not_connected,
  COALESCE(SUM(CASE WHEN outcome = 'unknown'       THEN 1 ELSE 0 END), 0)    AS unknown,
  COALESCE(SUM(CASE WHEN outcome <> 'unknown'      THEN 1 ELSE 0 END), 0)    AS answered
FROM referrals;

-- Per-listing outcomes: the part that actually improves the directory. A listing
-- that keeps coming back not_connected is a listing that needs re-verifying or
-- removing, and this view is how that surfaces.
CREATE VIEW IF NOT EXISTS referral_outcomes_by_resource AS
SELECT
  resource_id,
  resource_name,
  COUNT(*)                                                              AS referrals_made,
  COALESCE(SUM(CASE WHEN outcome = 'connected'     THEN 1 ELSE 0 END),0) AS connected,
  COALESCE(SUM(CASE WHEN outcome = 'not_connected' THEN 1 ELSE 0 END),0) AS not_connected,
  COALESCE(SUM(CASE WHEN outcome = 'unknown'       THEN 1 ELSE 0 END),0) AS unknown
FROM referrals
GROUP BY resource_id, resource_name
ORDER BY not_connected DESC, referrals_made DESC;

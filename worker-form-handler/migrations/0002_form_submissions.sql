-- Contact/partner/volunteer/join form submissions.
--
-- WHY THIS TABLE EXISTS, and why email is not the answer on its own:
--
--   The forms used to open the visitor's mail client (mailto:), and the Worker
--   endpoints they now POST to emailed through MailChannels. MailChannels' API is
--   gone (api.mailchannels.net returns 404), so every one of those sends had been
--   failing silently and returning HTTP 200 -- the site told people "Thank you,
--   we'll be in touch" and dropped the message on the floor.
--
--   So the durable record is this table, not an inbox. Email is a *notification on
--   top of* the record: if the email binding is missing, misconfigured, or the
--   sending domain is not verified, the submission still exists and can be read.
--   A form that only writes to email is a form that can lose someone's message.
--
-- DESIGN RULES, and why:
--
--   * No IP address, no user agent, no geolocation. These are the columns people
--     reach for first and they are the ones that turn a help request into a
--     surveillance record. The rate limiter keys on an IP in memory only and
--     never persists it.
--
--   * notified_at is set even when the send FAILS, so "did we email them" and
--     "do we have their message" stay separate questions. A row with
--     notified_at NULL is an unread message, not a lost one.
--
--   * Retention: rows are deleted after NOTIFY_RETENTION_DAYS by the scheduled
--     cleanup, because holding a person's words indefinitely is not defensible for
--     a volunteer nonprofit that tells people it holds nothing.

CREATE TABLE IF NOT EXISTS form_submissions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint       TEXT    NOT NULL,
  name           TEXT,
  email          TEXT,
  identity       TEXT,
  topic          TEXT,
  note           TEXT,
  email_sent     INTEGER NOT NULL DEFAULT 0,
  email_error    TEXT,
  notified_at    TEXT,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_created  ON form_submissions (created_at);
CREATE INDEX IF NOT EXISTS idx_form_submissions_endpoint ON form_submissions (endpoint);
CREATE INDEX IF NOT EXISTS idx_form_submissions_unnotified ON form_submissions (notified_at)
  WHERE notified_at IS NULL;

-- The inbox view: everything that arrived, newest first, unread notifications first.
-- A partial index keeps this cheap as the table grows.
CREATE VIEW IF NOT EXISTS form_inbox AS
SELECT
  id, created_at, endpoint, identity, topic, name, email,
  email_sent, email_error, notified_at, note
FROM form_submissions
ORDER BY (notified_at IS NULL) DESC, created_at DESC;

-- Daily counts per endpoint, for /impact and for spotting a bot run.
CREATE VIEW IF NOT EXISTS form_submissions_by_day AS
SELECT
  date(created_at) AS day,
  endpoint,
  COUNT(*)         AS submissions,
  COALESCE(SUM(email_sent), 0) AS emailed
FROM form_submissions
GROUP BY day, endpoint
ORDER BY day DESC, endpoint;
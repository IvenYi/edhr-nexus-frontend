-- Work orders are created and immediately eligible for production preparation.
-- Normalize rows created by the removed release step before the status transition
-- definition is enforced by the application.
UPDATE work_order
SET status = 'CREATED'
WHERE status = 'RELEASED';

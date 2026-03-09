-- ============================================================
-- Migration 011: Backfill invite code usage for users who
--                signed up before the use_invite_code_on_signup fix.
--
-- Manual backfill based on known code-to-user mapping.
-- ============================================================

UPDATE public.invite_codes
SET used_by = 'a8a39491-034c-471f-8dad-dc28b079c697'::uuid
WHERE code = 'RENT-0V2I3B' AND used_by IS NULL;

UPDATE public.invite_codes
SET used_by = '4ae0710f-b802-4fc1-9c2e-9723c2b76f87'::uuid
WHERE code IN ('RENT-4V0V0Q', 'RENT-4VOVOQ') AND used_by IS NULL;

UPDATE public.invite_codes
SET used_by = '363d29d9-7cfd-4595-afb2-8b880468d7d5'::uuid
WHERE code = 'RENT-0K5S03' AND used_by IS NULL;

-- Add 'editorial' to the allowed widget layouts
-- Run this in the Supabase SQL Editor before deploying the editorial layout feature

ALTER TABLE public.widgets
  DROP CONSTRAINT IF EXISTS widgets_layout_check;

ALTER TABLE public.widgets
  ADD CONSTRAINT widgets_layout_check
  CHECK (layout IN ('grid', 'carousel', 'wall', 'list', 'single', 'editorial'));

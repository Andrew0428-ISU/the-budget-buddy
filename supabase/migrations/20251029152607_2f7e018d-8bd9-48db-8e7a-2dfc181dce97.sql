-- Add rating column to budget_feedback table
ALTER TABLE public.budget_feedback 
ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
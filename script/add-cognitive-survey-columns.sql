ALTER TABLE quiz_results
  ADD COLUMN IF NOT EXISTS survey_answers text,
  ADD COLUMN IF NOT EXISTS survey_score integer,
  ADD COLUMN IF NOT EXISTS survey_profile text,
  ADD COLUMN IF NOT EXISTS survey_main_need text,
  ADD COLUMN IF NOT EXISTS survey_interest text;

ALTER TABLE cerebral_results
  ADD COLUMN IF NOT EXISTS survey_answers text,
  ADD COLUMN IF NOT EXISTS survey_score integer,
  ADD COLUMN IF NOT EXISTS survey_profile text,
  ADD COLUMN IF NOT EXISTS survey_main_need text,
  ADD COLUMN IF NOT EXISTS survey_interest text;

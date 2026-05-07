ALTER TABLE quiz_results
  ADD COLUMN IF NOT EXISTS survey_answers text,
  ADD COLUMN IF NOT EXISTS survey_score integer,
  ADD COLUMN IF NOT EXISTS survey_profile text,
  ADD COLUMN IF NOT EXISTS survey_main_need text,
  ADD COLUMN IF NOT EXISTS survey_interest text,
  ADD COLUMN IF NOT EXISTS reading_title text,
  ADD COLUMN IF NOT EXISTS reading_word_count integer,
  ADD COLUMN IF NOT EXISTS reading_tema_numero integer,
  ADD COLUMN IF NOT EXISTS reading_lang text,
  ADD COLUMN IF NOT EXISTS reading_content text;

ALTER TABLE cerebral_results
  ADD COLUMN IF NOT EXISTS survey_answers text,
  ADD COLUMN IF NOT EXISTS survey_score integer,
  ADD COLUMN IF NOT EXISTS survey_profile text,
  ADD COLUMN IF NOT EXISTS survey_main_need text,
  ADD COLUMN IF NOT EXISTS survey_interest text;

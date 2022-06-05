ALTER TABLE "Birthday"
  ADD CONSTRAINT check_birthday_normalized
    CHECK (extract(YEAR FROM birthday) = 0)

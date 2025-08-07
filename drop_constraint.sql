-- Drop the unique constraint on schedule_id column in appointments table
-- This allows multiple appointments per schedule (different time slots)

USE healthcare_db;

-- Drop the unique constraint
ALTER TABLE appointments DROP INDEX UKhv4awjqpkmepyaf0j83a6vdy0;

-- Verify the constraint is dropped
SHOW CREATE TABLE appointments; 
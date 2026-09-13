# TODO - Fix Duplicate Entry Error for business_reviews

## Problem
The `business_reviews` table has a unique constraint `(business_id, reviewer_id)` preventing users from submitting multiple reviews for the same business.

## Steps
- [x] Analyze the error and relevant files
- [x] Get approval from user
- [x] **Step 1:** Create new migration `2026_07_27_000002_remove_unique_from_business_reviews.php` to safely drop the unique constraint
- [x] **Step 2:** Run `php artisan migrate` to apply the change (successful)
- [x] **Step 3:** Verify the fix — unique constraint successfully removed, FK constraints intact


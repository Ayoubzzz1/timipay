# Supabase Email Confirmation Configuration

## Problem

When using a custom OTP verification system, Supabase still requires email confirmation (`email_confirmed_at`). This causes login to fail with "Email not confirmed" error even after OTP verification.

## Solution: Disable Email Confirmation Requirement

You need to configure Supabase to **not require email confirmation** since you're using a custom OTP system.

### Steps to Disable Email Confirmation:

1. **Go to Supabase Dashboard**
2. Navigate to **Authentication** → **Settings** (or **Configuration**)
3. Find **"Email Auth"** section
4. Look for **"Enable email confirmations"** or **"Confirm email"** setting
5. **Disable/Turn OFF** email confirmation requirement
6. **Save** the changes

### Alternative: Configure Email Confirmation Settings

If you can't find the toggle, look for:
- **"Confirm email"** checkbox - Uncheck it
- **"Enable email confirmations"** - Set to `false`
- **"Email confirmation required"** - Disable

### Why This is Needed

- Your custom OTP system sets `is_verified = true` in `data_user` table
- But Supabase Auth still has `email_confirmed_at = null`
- Supabase blocks login if `email_confirmed_at` is null (when confirmation is required)
- By disabling email confirmation requirement, Supabase will allow login based on your custom `is_verified` flag

## After Configuration

Once email confirmation is disabled:
1. Users can sign up without Supabase requiring email confirmation
2. Your custom OTP system handles verification
3. Login will work after `is_verified = true` in your database
4. The login code checks `is_verified` in `data_user` table

## Verification Flow

1. User signs up → Supabase creates auth user (email_confirmed_at = null, but confirmation not required)
2. OTP is generated and sent
3. User verifies OTP → `is_verified = true` in `data_user` table
4. User can log in (Supabase doesn't check email_confirmed_at because confirmation is disabled)
5. Login code checks `is_verified` in `data_user` table

## Important Notes

- **Security**: Your custom OTP system still provides security through the `is_verified` flag
- **Login Protection**: The login code in `Auth.jsx` checks `is_verified` before allowing access
- **Database**: The `is_verified` flag in `data_user` table is the source of truth

## Testing

After disabling email confirmation:
1. Sign up a new user
2. Verify with OTP
3. Try to log in
4. Should work without "Email not confirmed" error



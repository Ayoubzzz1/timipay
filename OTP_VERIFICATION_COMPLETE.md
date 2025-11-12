# Complete OTP Verification System Implementation

## Overview
This document describes the complete token-based email verification system implemented according to the specified requirements.

## Database Schema Requirements

Your `data_user` table must have the following columns:

```sql
- email (text) - User's email address
- is_verified (boolean, default false) - Verification status
- otp_token (text, nullable) - 6-digit OTP code
- otp_expires_at (timestamptz, nullable) - OTP expiration timestamp
- created_at (timestamptz) - Record creation timestamp
```

### SQL to Add Missing Columns

```sql
-- Add is_verified column if it doesn't exist
ALTER TABLE data_user 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Add otp_token column if it doesn't exist
ALTER TABLE data_user 
ADD COLUMN IF NOT EXISTS otp_token TEXT;

-- Add otp_expires_at column if it doesn't exist
ALTER TABLE data_user 
ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;

-- Ensure created_at has a default value
ALTER TABLE data_user 
ALTER COLUMN created_at SET DEFAULT NOW();
```

## Step-by-Step Flow

### Step 1: User Registration (Signup)

1. User fills out registration form
2. System creates Supabase auth user
3. **System creates record in `data_user` table with:**
   - `email` = user's email
   - `is_verified` = `false`
   - `otp_token` = `null`
   - `otp_expires_at` = `null`
   - `created_at` = current timestamp
4. System generates 6-digit OTP
5. System updates record with:
   - `otp_token` = generated OTP
   - `otp_expires_at` = now() + 1 minute 30 seconds
6. System sends OTP via email

**Code Location:** `src/Pages/user/Resgitre.jsx` - `goNext()` function when `currentStep === 1`

### Step 2: OTP Verification

1. User receives email with 6-digit OTP
2. User enters OTP on verification page
3. System looks up user by email in `data_user` table
4. System validates:
   - OTP token matches stored `otp_token`
   - `otp_expires_at` has not passed
   - `is_verified` is still `false`
5. If valid:
   - Update `is_verified` = `true`
   - Clear `otp_token` = `null`
   - Clear `otp_expires_at` = `null`
6. User proceeds to next step

**Code Location:** `src/Pages/user/Resgitre.jsx` - `verifyToken()` function

### Step 3: Login Restriction

1. User attempts to log in
2. System checks `is_verified` status in `data_user` table
3. If `is_verified` = `false`:
   - Block login
   - Show error: "Please verify your email address before logging in"
4. If `is_verified` = `true`:
   - Allow login
   - Proceed to dashboard

**Code Location:** `src/Pages/user/Auth.jsx` - `onSubmit()` function

### Step 4: Automatic Cleanup

Unverified users older than 10 minutes are automatically deleted from `data_user` table.

**Implementation Options:**
1. **Database Trigger** (Implemented) - Runs on table modifications
2. **Scheduled Function** - Requires Supabase Pro or Edge Function
3. **Manual Cleanup** - Can be called from admin panel or cron job

**SQL Location:** `supabase_auto_cleanup.sql`

## Email Template Configuration

Configure the email template in Supabase Dashboard:

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup** template
3. Use the HTML template provided in `OTP_VERIFICATION_SETUP.md`
4. Ensure the template uses `{{ .Token }}` to display the OTP

## Key Functions

### Generate OTP
```javascript
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
```

### Store OTP in Database
```javascript
await supabase
  .from('data_user')
  .update({
    otp_token: otpToken,
    otp_expires_at: new Date(Date.now() + 90 * 1000).toISOString()
  })
  .eq('id', userId)
```

### Verify OTP
```javascript
// 1. Look up user by email
// 2. Check token matches
// 3. Check expiration
// 4. Update is_verified = true
// 5. Clear OTP fields
```

### Check Verification Status
```javascript
const { data: userRecord } = await supabase
  .from('data_user')
  .select('is_verified')
  .eq('email', email)
  .maybeSingle()

if (userRecord?.is_verified === false) {
  // Block access
}
```

## Security Considerations

1. **OTP Expiration**: Tokens expire after 90 seconds (1 minute 30 seconds)
2. **One-Time Use**: OTP is cleared after successful verification
3. **Login Restriction**: Unverified users cannot access the application
4. **Auto Cleanup**: Prevents database bloat from unverified accounts
5. **Email Validation**: OTP is sent only to registered email addresses

## Testing Checklist

- [ ] User can sign up and receive OTP email
- [ ] OTP is stored correctly in database
- [ ] OTP verification works with correct code
- [ ] OTP verification fails with incorrect code
- [ ] OTP verification fails after expiration
- [ ] Unverified users cannot log in
- [ ] Verified users can log in successfully
- [ ] Resend OTP generates new code
- [ ] Old unverified records are cleaned up after 10 minutes

## Troubleshooting

### OTP Not Received
- Check spam folder
- Verify email template is configured
- Check Supabase email logs

### "User not found" Error
- Ensure user record was created in Step 1
- Check database connection
- Verify email matches exactly

### Login Blocked for Verified Users
- Check `is_verified` value in database
- Verify database query is correct
- Check for case sensitivity issues

### Cleanup Not Working
- Verify trigger/function is created
- Check database logs
- Manually test cleanup function



# Email Template Setup for OTP Verification

## Important Note

Supabase email templates have **limited support for custom variables**. The `{{ .Token }}` variable may not work directly with custom data passed in `options.data`.

## Solution Options

### Option 1: Use User Metadata (Recommended)

The OTP token is stored in `user_metadata.otp_token` during signup. However, Supabase email templates don't automatically expose `user_metadata` fields.

**You need to configure the email template in Supabase Dashboard to access the token:**

1. Go to **Authentication** → **Email Templates** → **Confirm signup**
2. The template should use one of these approaches:

#### Approach A: Use Go Template with Metadata Access
```html
{{ .Token }}  <!-- May not work directly -->
{{ .UserMetadata.otp_token }}  <!-- Try this -->
{{ index .UserMetadata "otp_token" }}  <!-- Or this -->
```

#### Approach B: Use a Custom Email Service
If Supabase templates don't support custom variables, use:
- Supabase Edge Function to send custom emails
- Third-party service (SendGrid, Resend, etc.)

### Option 2: Configure Template Variables in Supabase

Some Supabase versions allow configuring custom template variables. Check your Supabase dashboard for:
- **Settings** → **Auth** → **Email Templates** → **Custom Variables

### Option 3: Use Edge Function (Most Reliable)

Create a Supabase Edge Function that:
1. Generates the OTP
2. Stores it in the database
3. Sends a custom email with the OTP using a service like Resend or SendGrid

## Current Implementation

The code stores the OTP in:
1. `data_user.otp_token` (database table)
2. `user_metadata.otp_token` (Supabase auth metadata)
3. `user_metadata.Token` (for template access)

## Testing

To verify the OTP is being sent correctly:

1. Check the email you receive
2. Compare the OTP in the email with what's in the database:
   ```sql
   SELECT email, otp_token FROM data_user WHERE email = 'your-email@example.com';
   ```
3. If they don't match, the email template isn't accessing the token correctly

## Troubleshooting

### "Invalid OTP" Error

This means the OTP in the email doesn't match the database. Possible causes:

1. **Email template not accessing token**: The template variable `{{ .Token }}` isn't working
2. **Token not in metadata**: The token wasn't stored in `user_metadata` correctly
3. **Timing issue**: A new token was generated after the email was sent

### Solution

1. **Check database**: Verify `otp_token` in `data_user` table matches what you received
2. **Check metadata**: Verify `user_metadata.otp_token` in Supabase Auth
3. **Test template**: Try using `{{ .UserMetadata.otp_token }}` in the template
4. **Use Edge Function**: If templates don't work, implement a custom email sending function

## Recommended Next Steps

1. Test if `{{ .UserMetadata.otp_token }}` works in your email template
2. If not, implement a Supabase Edge Function for custom email sending
3. Or use a third-party email service that supports custom variables



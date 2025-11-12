# Email Template Setup Instructions

## Quick Setup Guide

### Step 1: Copy the Template

I've created two HTML email templates for you:

1. **`email_template_otp_simple.html`** - Simple version (recommended to start)
2. **`email_template_otp.html`** - Advanced version with fallbacks

### Step 2: Configure in Supabase Dashboard

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Email Templates**
3. Select **"Confirm signup"** template
4. Click **"Edit"** or **"Customize"**
5. **Replace** the entire template content with one of the HTML files I created
6. Click **"Save"**

### Step 3: Test the Template

The template uses `{{ .Token }}` to display the OTP. If this doesn't work, try these alternatives:

#### Alternative 1: User Metadata Access
Replace `{{ .Token }}` with:
```html
{{ .UserMetadata.otp_token }}
```

#### Alternative 2: Index Access
Replace `{{ .Token }}` with:
```html
{{ index .UserMetadata "otp_token" }}
```

#### Alternative 3: Use the Advanced Template
The `email_template_otp.html` file includes multiple fallback attempts to find the token.

### Step 4: Verify It Works

1. Sign up a new user
2. Check the email you receive
3. Compare the OTP in the email with what's in the database:
   ```sql
   SELECT email, otp_token FROM data_user WHERE email = 'test@example.com';
   ```
4. If they match, the template is working correctly!

## Template Variables Available in Supabase

Standard variables that **always work**:
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your site URL
- `{{ .ConfirmationURL }}` - Confirmation link (if using link-based verification)

Custom variables (may not work):
- `{{ .Token }}` - Custom OTP token (needs to be passed correctly)
- `{{ .UserMetadata.otp_token }}` - Access user metadata
- `{{ index .UserMetadata "otp_token" }}` - Alternative metadata access

## Troubleshooting

### If OTP shows as empty or "{{ .Token }}"

This means the template variable isn't being populated. Try:

1. **Check user metadata**: In Supabase Dashboard → Authentication → Users, check if `otp_token` exists in user metadata
2. **Try alternative syntax**: Use `{{ .UserMetadata.otp_token }}` instead
3. **Use Edge Function**: If templates don't work, implement a custom email sending function

### If OTP doesn't match database

1. Check the database: `SELECT otp_token FROM data_user WHERE email = 'your-email'`
2. Check user metadata in Supabase Auth
3. Verify the code is storing the token correctly before sending email

## Recommended Approach

1. **Start with** `email_template_otp_simple.html` using `{{ .Token }}`
2. **If that doesn't work**, try `{{ .UserMetadata.otp_token }}`
3. **If still not working**, use `email_template_otp.html` which has multiple fallbacks
4. **Last resort**: Implement a Supabase Edge Function for custom email sending

## Testing Checklist

- [ ] Template saved in Supabase Dashboard
- [ ] OTP appears in email (not as "{{ .Token }}")
- [ ] OTP in email matches database `otp_token`
- [ ] Email styling looks correct
- [ ] All text is readable and properly formatted



# OTP Token-Based Email Verification Setup

## Overview
This project uses a one-time password (OTP) token system for email verification instead of the default Supabase email link verification.

## Implementation Details

### How It Works
1. When a user signs up, a 6-digit OTP token is generated
2. The token is stored in the user's metadata with an expiration time (90 seconds)
3. An email is sent to the user containing the OTP token
4. The user enters the token on the verification page
5. The token is validated against the stored token and expiration time
6. If valid, the account is marked as verified

## Email Template Configuration

### Required Setup in Supabase Dashboard

You need to configure the email template in your Supabase dashboard to use the OTP token:

1. Go to **Authentication** → **Email Templates** in your Supabase dashboard
2. Select the **Confirm signup** template
3. Replace the default template with the following HTML:

```html
<!doctype html>
<html>
  <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background:#f4f6f8; padding:24px; margin:0;">
    <table width="100%" cellspacing="0" cellpadding="0" 
           style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <tr>
        <td style="padding:32px 0; text-align:center; background:#fff8e1; border-bottom:1px solid #f1f1f1;">
          <div style="font-size:26px; font-weight:800; color:#111827; letter-spacing:0.5px;">
            <span style="color:#111827;">Timi</span><span style="color:#f59e0b;">pay</span>
          </div>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:32px 28px;">
          <h1 style="margin:0 0 12px; font-size:22px; color:#111827; text-align:center;">Confirm Your Signup</h1>
          <p style="margin:0 0 24px; color:#4b5563; font-size:15px; line-height:1.6; text-align:center;">
            Hi <strong>{{ .Email }}</strong>, welcome to <strong>Timipay</strong>!  
            Please enter the following **one-time code** on the website to complete your registration.
          </p>
          <!-- OTP Code -->
          <div style="text-align:center; margin:32px 0;">
            <span style="display:inline-block; background:#f59e0b; color:#ffffff; font-weight:700; 
                         font-size:20px; padding:14px 28px; border-radius:10px; letter-spacing:2px;">
              {{ .Token }}
            </span>
          </div>
          <!-- Info Text -->
          <p style="margin:0 0 8px; color:#6b7280; font-size:13px; text-align:center;">
            This code will expire in <strong>1 minute 30 seconds</strong>.
          </p>
          <hr style="border:none; border-top:1px solid #e5e7eb; margin:32px 0;" />
          <!-- Footer Note -->
          <p style="margin:0; color:#9ca3af; font-size:12px; text-align:center;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
    <!-- Footer -->
    <p style="text-align:center; color:#9ca3af; font-size:12px; margin-top:16px;">
      © {{ .SiteURL }} — Timipay. All rights reserved.
    </p>
  </body>
</html>
```

### Important Notes

1. **Token Variable**: The template uses `{{ .Token }}` to display the OTP token. This needs to be passed in the email data when sending the verification email.

2. **Email Data**: The OTP token is passed in the `data` field when calling `supabase.auth.resend()`:
   ```javascript
   await supabase.auth.resend({
     type: 'signup',
     email: form.email,
     options: { 
       data: {
         Token: newOtpToken
       }
     }
   })
   ```

3. **Template Variables Available**:
   - `{{ .Email }}` - User's email address
   - `{{ .Token }}` - The OTP token (6 digits)
   - `{{ .SiteURL }}` - Your site URL

## Code Flow

### Signup Process
1. User fills out signup form (Step 1)
2. OTP token is generated (6 digits)
3. Token and expiration (90 seconds) are stored in user metadata
4. Email is sent with the token
5. User proceeds to Step 2 (verification)

### Verification Process
1. User enters the 6-digit token
2. Token is validated against stored token in metadata
3. Expiration time is checked
4. If valid, account is marked as verified
5. User proceeds to Step 3 (interests)

### Resend Process
1. User clicks "Resend Code"
2. New OTP token is generated
3. New expiration time is set (90 seconds)
4. User metadata is updated with new token
5. New email is sent with the new token

## Security Considerations

1. **Token Expiration**: Tokens expire after 90 seconds (1 minute 30 seconds)
2. **One-Time Use**: Tokens are cleared from metadata after successful verification
3. **Token Generation**: Uses cryptographically secure random number generation
4. **Validation**: Tokens are validated server-side through Supabase metadata

## Troubleshooting

### Email Not Received
- Check spam folder
- Verify email template is configured correctly in Supabase dashboard
- Check that `Token` is being passed in the email data

### Token Expired
- User can request a new token by clicking "Resend Code"
- New token will be generated with a new 90-second expiration

### Invalid Token
- Ensure user enters all 6 digits
- Check that token hasn't expired
- Verify token matches the one stored in metadata

## Future Enhancements

To fully set `email_confirmed_at` in Supabase (instead of just using metadata flag), you would need to:

1. Create a Supabase Edge Function or Database Function
2. Use Supabase Admin API to update the user's `email_confirmed_at` field
3. Call this function after successful token verification

Alternatively, you can use a database trigger that sets `email_confirmed_at` when the metadata flag `email_verified` is set to `true`.



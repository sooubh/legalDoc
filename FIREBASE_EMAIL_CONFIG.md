# Firebase Email Configuration - Preventing Spam

## Overview
Firebase Authentication sends emails (password reset, email verification) from `noreply@<project-id>.firebaseapp.com`. These emails can sometimes end up in spam folders. While you can't directly control Firebase's email infrastructure, here are steps to improve deliverability.

## Current Implementation

### 1. Action Code Settings
We've configured `actionCodeSettings` in the password reset function to improve email delivery:
- `url`: Redirect URL after email action is completed
- `handleCodeInApp`: Set to `false` for web-based links

### 2. User Guidance
The application now provides clear instructions to users:
- Reminder to check spam/junk folders
- Instructions to add sender to contacts
- Information about email delivery timing

## Recommendations for Better Deliverability

### 1. Custom Email Domain (Best Solution)
Firebase allows you to use a custom email domain:
- Go to Firebase Console → Authentication → Templates
- Configure custom email domain
- Set up SPF, DKIM, and DMARC records for your domain
- This significantly improves deliverability

### 2. Email Template Customization
- Customize email templates in Firebase Console
- Use a recognizable sender name
- Avoid spam-triggering keywords
- Keep subject lines clear and professional

### 3. Firebase Project Configuration
- Ensure your Firebase project has a verified domain
- Enable email link authentication properly
- Configure authorized domains in Firebase Console

### 4. Domain Authentication (Advanced)
For better email reputation:
1. Add your domain to Firebase
2. Configure DNS records (SPF, DKIM, DMARC)
3. Verify domain ownership
4. Use custom SMTP (requires Firebase Blaze plan)

## User-Facing Improvements

### UI Features Added:
1. **Pre-submit Tips**: Users see tips before submitting email
2. **Success Instructions**: Clear guidance after email is sent
3. **Spam Folder Reminder**: Prominent reminders to check spam
4. **Delivery Time Info**: Set expectations about email arrival

### Best Practices for Users:
- Add sender email to contacts/whitelist
- Check spam folder regularly
- Wait 1-5 minutes for delivery
- Verify email address is correct

## Technical Implementation

### Code Example:
```typescript
const actionCodeSettings = {
  url: `${window.location.origin}/login`,
  handleCodeInApp: false,
};

await sendPasswordResetEmail(auth, email, actionCodeSettings);
```

## Monitoring

### Check Email Delivery:
1. Firebase Console → Authentication → Users
2. Monitor failed deliveries
3. Check email logs if available
4. User feedback about delivery issues

## Additional Resources

- [Firebase Email Templates](https://firebase.google.com/docs/auth/custom-email-handler)
- [Custom Email Domain Setup](https://firebase.google.com/docs/auth/email-action-handler)
- [Email Deliverability Best Practices](https://firebase.google.com/docs/auth/email-action-handler)

## Notes

- Firebase uses Google's email infrastructure (good reputation)
- Default sender: `noreply@<project-id>.firebaseapp.com`
- Email delivery is usually reliable but can vary by provider
- Gmail users typically receive emails in inbox
- Outlook/Yahoo users may need to check spam more often


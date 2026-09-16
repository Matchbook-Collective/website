# Netlify Forms launch handoff

The approved production origin is https://thematchbookcollective.com. The domain remains registered and DNS managed at Porkbun; Google Workspace remains the email provider.

## Implemented
- Static form name: contact.
- Generated detection markup: dist/contact/index.html, with method POST, data-netlify=true, hidden form-name=contact, and data-netlify-honeypot=fax.
- All original fields, required name/email/challenge validation, styling, and service preselection preserved.
- JavaScript sends URL-encoded data to the same-origin root. HTTP/network errors retain values and provide a retry message; requests time out after 20 seconds. Concurrent sends are blocked while pending.
- Success redirects to /thank-you/. Without JavaScript, native HTML POST uses that same action as the success destination.
- Thank-you page reuses existing Matchbook layout/styles, is noindex, and is excluded from the sitemap.
- No API keys, custom server, Astro adapter, external accounts, or new dependencies.
- The obsolete PUBLIC_CONTACT_ENDPOINT setting and demo preview behavior were removed.

## Netlify dashboard setup (when deployment is approved)
1. Set SITE_URL=https://thematchbookcollective.com for the production build context. Existing netlify.toml sets the build command and dist publish directory.
2. In the project, go to Forms and enable form detection. Detection applies to the next deploy. If the first deployment happened with detection disabled, enable it and redeploy.
3. After a detection-enabled deployment, confirm a form named contact appears in Forms. The generated HTML meets the documented detection requirements; actual dashboard registration cannot be confirmed before deployment.
4. Go to Project configuration > Notifications > Emails and webhooks > Form submission notifications. Add an email notification, select contact, and enter the chosen real Google Workspace recipient address. The exact mailbox has not been supplied; none was invented or embedded.
5. Optionally set a clear notification subject such as “New Matchbook inquiry”. The existing name=email input supports Netlify's Reply-To behavior. No SMTP credentials, Google OAuth, or DNS changes are needed for this form implementation.
6. Submit a real test from the deployed site. Confirm the thank-you page, the entry in Netlify Forms (including spam review if absent), receipt in the Google Workspace inbox/spam folder, and Reply-To pointing to the submitter. Check current Forms usage/limits for the selected plan.

References:
- https://docs.netlify.com/manage/forms/setup/
- https://docs.netlify.com/manage/forms/notifications/

## Verification scope
Build and generated-HTML verification use the approved domain. Browser tests cover desktop/mobile fields, service preselection, required validation, honeypot, URL encoding (including special characters), HTTP/network errors with retained entries, success redirect, and native submission without JavaScript. POST responses are mocked locally: no real inquiry was sent and delivery remains a post-deployment acceptance check. Browser tests emulate Netlify Pretty URLs because Astro preview returns 404 for slashless directory URLs.

This handoff supersedes the previous demo-form and unknown-domain statements in the historical launch/content review reports.

## Completed checks — September 16, 2026
- Production build with SITE_URL=https://thematchbookcollective.com: eight HTML pages, zero errors/warnings/hints.
- npm run verify: 252 local links/assets plus SEO, static form markup, honeypot and required fields passed.
- Browser suite: 35 page/viewport checks, zero automated accessibility violations, zero runtime errors; all submission and native no-JavaScript checks passed using local intercepted requests.
- Shared CSS, components, layouts and existing non-contact page sources are unchanged compared with the saved pre-implementation hashes.
- No commit, push, deployment, account creation, DNS change or real inquiry occurred.

# Publishing and discovery

## Prepared
- Descriptive README with current app screenshots, a feature tour, setup steps and clearly scoped claims.
- Public product page at `/about.html`, with static text, app screenshots, portrait videos and FAQs.
- Canonical URLs, Open Graph and Twitter cards, SoftwareApplication and VideoObject structured data.
- `robots.txt` and a sitemap; API routes are excluded from crawling.
- Searchable repository description, homepage and relevant GitHub topics.
- Social artwork at `public/media/social-preview.png` (1200 × 630).

## Optional account-owned steps
Search engines choose their own crawl and indexing schedule. Submit `https://scoop-mauve-two.vercel.app/sitemap.xml` in the site owner’s Search Console property if one is configured. No indexing or ranking is guaranteed.

GitHub’s repository social-preview upload is separate from website Open Graph metadata. The supplied social-preview PNG is ready to upload under repository Settings → General → Social preview. GitHub’s public repository API does not provide a supported upload endpoint for that setting.

Social post drafts are in `launch-copy.md`; nothing has been posted to social accounts.

## Verification
All 16 existing automated tests and syntax checks passed. Desktop (1440px) and mobile (390px) browser checks passed for the product page and the separate full visual portfolio, including loaded images, no horizontal overflow and playable portrait video. Both films have H.264 video, AAC stereo audio and measured audio peaks below clipping.

Assistant-specific configuration was removed from the current repository tree; Git history and contributor records were preserved. Environment files, keys, local research and build products remain excluded.

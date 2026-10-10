# AMEN legal content review — 10 October 2026

## What changed

Privacy now has 24 substantive sections, plus a summary and provider links, compared with nine sections previously. The English document grew from approximately 838 to 2,502 words before shared operator details. Terms now has 28 substantive sections and grew from approximately 1,580 to 2,849 words before operator details.

All six languages contain every section and two translated paragraphs per section. The translations cover the same subjects and material rules; their wording and length vary. They are written translations, not certified legal translations. Localized support pages reuse policy sections. Legal-notice pages provide operator and contact details.

Important corrections:

- Removed the claim that Nema runs exclusively on AMEN servers and uses no external AI. The current iOS source sends text and audio-generation requests to Google Gemini.
- Removed session-only chat retention and no-sharing claims. ConversationService and related services store conversations and messages in Supabase, in addition to local data.
- Identified RevenueCat purchase validation and AppsFlyer attribution, including the current denomination and goal event fields.
- Separated website browsing from app processing. The website adds no tracking or preference storage, while app analytics are disclosed.
- Removed blanket privacy consent through use, blanket warranty exclusion, arbitrary suspension, unrestricted feature removal and automatic acceptance of every future amendment.
- Added consumer remedies, withdrawal conditions, trials, renewal, price changes, purchase restoration, one-time products and explicit instructions that account deletion does not cancel Apple billing.
- Added AI limits, emergencies, text-to-speech, Bible Lock, child-data considerations, sensitive data, international transfers, backup retention and rights-request handling.
- Removed the obsolete EU online dispute-resolution platform as an available route.

## Operator details: sourced rather than invented

The public German App Store listing was read both through the web tool and through a fresh HTTPS fetch on 10 October 2026. It identifies Ezra Maslaton as trader and gives Gartenstraße 17, 85764 Oberschleißheim, Germany, and +49 1703051118. Those published business details appear in the generated documents. The existing AMEN support email remains amenapphilfe@gmail.com; the listing's different email was not substituted without a reason.

Source: https://apps.apple.com/de/app/amen/id6744241928

The operator should keep the details current and add commercial-register, VAT or other legally required details if applicable. No registration number, VAT number, data-protection officer or supervisory authority was invented.

## Conditions website changes cannot establish

1. **Sensitive-data consent and analytics.** The reviewed app source submits denomination and selected goals to AppsFlyer and includes denomination in Google prompts. Religious beliefs can fall under Article 9 GDPR. No separate explicit-consent mechanism was established in this review. Apple ATT is not a substitute for that condition. Review/remove sensitive analytics payloads and implement any required purpose-specific consent and withdrawal before treating the service as compliant.
2. **Google eligibility and billing.** The current Gemini API terms prohibit clients directed towards or likely accessed by under-18s and require paid services for clients offered in the EEA, Switzerland and UK. The app/store rating is not age enforcement. This website does not enforce age in the iOS app. Verify actual audience, access controls, provider account eligibility and paid API project status. The notice deliberately avoids an unconditional no-training or zero-retention promise.
3. **Provider contracts, transfers and retention.** Source review cannot prove signed DPAs, actual provider regions, subprocessors, transfer safeguards, backup expiry, event sharing partners or concrete retention configuration. Confirm them and make the notice more specific where the production facts are available.
4. **Deletion coverage and local cleanup.** AccountDeletionView calls delete-user-account, but that function's implementation is not present in the reviewed app repository. Complete deletion of database rows, storage files, AI/analytics records and backup expiry was not runtime-verified. The notice does not promise immediate erasure from every system.
5. **Purchase terms and incorporation.** Verify the actual App Store contractual party, standard/custom EULA configuration, offer screens, withdrawal information and any required notices or acceptance for the changed terms. Merely posting terms does not establish acceptance. Material changes to an existing agreement need the applicable notice or agreement process.
6. **External domains.** The iOS legal view and public store description still reference amenbible.app/datenschutz and amen-ai.com/agb. This checkout is hosted on amen-app.com. Their redirects cannot be established by adding files here. App/store links or external DNS/hosting need a separate update.
7. **Professional legal review.** Statutory liability, withdrawal, ADR disclosures and international availability depend on the actual business and customers. The content preserves mandatory rights rather than claiming universal immunity. A qualified review should resolve these facts and review the translations before relying on them.

These are release considerations, not claims that the website implementation is broken. The branch is suitable for a concrete code/content review; the live policies should not be presented as verified compliance merely because this draft is longer.

## Evidence from the app

Read-only review used the current local AMEN repository:

- Services/LocalizationManager.swift — six supported languages; primary-language detection and English fallback.
- Services/GeminiChatService.swift and BibleTTSService.swift — Google API requests.
- Services/ChatService.swift — messages, name, denomination and context in generation.
- Services/ConversationService.swift — persisted conversation history.
- Services/AppsFlyerOnboardingService.swift — denomination, goals and onboarding events.
- AMENApp.swift — SDK startup and RevenueCat/AppsFlyer attribution integration.
- Services/ProfilePictureService.swift — uploaded photos and signed image URLs.
- Features/BibleLock — Apple frameworks and reading-plan requests.
- Views/AccountDeletionView.swift — backend deletion request and error handling.

No iOS build, compilation, simulator/device test, app launch or paid AI request was performed.

## Official references

- GDPR, especially Articles 6, 8, 9, 12–22 and 44–49: https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng
- German Civil Code, consumer contracts and digital products: https://www.gesetze-im-internet.de/englisch_bgb/englisch_bgb.html
- German operator disclosures, DDG Section 5: https://www.gesetze-im-internet.de/ddg/
- Google Gemini API terms, effective 23 March 2026: https://ai.google.dev/gemini-api/terms
- Apple cancellation: https://support.apple.com/en-us/118428
- Apple refunds: https://support.apple.com/en-us/118223
- Apple standard EULA: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
- Apple minimum custom EULA terms: https://www.apple.com/legal/internet-services/itunes/dev/minterms/
- Closure of the EU ODR platform: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32024R3228

## Verification

Website verification is separate from iOS verification. The source checks cover full six-language documents, matching app languages, static links and anchors, generated-file freshness, malformed language parameters, explicit language selection, primary-language regional tags, denied storage, print-button wiring and existing App Store redirect behavior. Browser inspection covers actual pages and responsive layout. Passing these checks does not validate the uninspected production systems listed above.

Completed checks on 10 October 2026:

- Generated-file verification, landing-page regression checks and legal-page checks passed for all 40 pages. A read-only comparison with SupportedLanguage in the current app also passed.
- All 24 translated documents rendered in the browser at desktop width 1,280 and mobile width 320 without horizontal overflow. A cramped mobile brand header was corrected and every mobile document checked again.
- Actual browser navigation preserved the AI section when switching German to Spanish, resolved /agb?lang=it#renewal to Italian terms and fell back to English for an unsupported Greek selection. No warning or error was captured during these legal-page checks.
- The script's print action and print stylesheet were checked. A native print dialog and exported PDF were not verified.
- Content hashes on shared asset URLs prevent the browser from reusing an obsolete stylesheet or script after content generation. CI fails if generated asset URLs become stale.

The iOS runtime, backend deletion, provider billing and consent mechanisms remain unverified as described above.

# amen legal content review — updated 13 October 2026

## Current wording

The privacy policy covers the app, rather than website hosting or browser behavior. It has 27 sections and 3,194 English words including its introduction, summary and section headings. Terms has 28 sections and 3,033 English words on the same basis. References and navigation are additional to these counts.

English, German, Spanish, French, Italian and Swedish contain every section. These are written translations, not certified legal translations. Support reuses policy sections. Public copy uses lowercase amen and describes the app as Christian Bible reading, prayer and reflection.

The latest revision follows the user's requested presentation:

- Support is contacted through amenapphilfe@gmail.com. Personal operator name, address and telephone blocks were removed from rendered documents.
- Infrastructure names were replaced with specific recipient categories: account authentication, cloud hosting/storage, purchase validation, app measurement, advertising attribution and support email. Data categories and purposes remain disclosed.
- Nema is described as using an enhanced Google AI model. Public numeric age wording was removed; applicable Google conditions remain linked. This does not change Google's eligibility rules.
- Every document links Apple's terms and usage rules, standard app license, privacy, cancellation and refund guidance using localized short reference labels. Google AI conditions and privacy information are also linked. Provider notices do not replace the app's own responsibilities.
- The /imprint and /impressum compatibility routes now show general legal information, not an operator disclosure.

The policies correct earlier claims that AI processing occurred only on amen's servers and that chats disappeared after a session. They retain saved-history, sensitive-data, subscription, statutory-remedy, withdrawal, cancellation, deletion and AI-limit explanations. They do not promise zero provider retention, immediate complete erasure or blanket immunity.

## Apple rules checked

Apple's official app-deletion guidance explicitly says removing an app does not automatically cancel in-app subscriptions. Apple's account-deletion guidance also says billing continues through Apple and users should be directed to cancellation. Separate cancellation instructions remain. A device prompt may offer a cancellation route; deletion itself is not cancellation.

Apple's Media Services terms, standard app license, privacy policy, cancellation and refund guidance were read on 10 October 2026. The pages link them instead of reproducing them, preserve mandatory local rights and do not promise every purchase is refundable or every subscription supports Family Sharing. Apple rules do not transfer responsibility for the app's own processing to Apple.

## App Store comparison — 13 October 2026

The public US listing and the user's App Store Connect privacy page were read through computer use. No Apple settings, declarations or metadata were changed. Both show version 1.4.5 and the same privacy categories. App Store Connect declares nine data types: name, email address, user ID, device ID, purchase history, product interaction, advertising data, other usage data and crash data. Purchase and usage data are declared for tracking; crash data is declared for analytics. These are developer-supplied disclosures about app processing, not evidence that Apple receives every data type.

Ten existing text entries per language were updated in English, German, Spanish, French, Italian and Swedish. No sections or layout were added. The user confirmed a seven-day Amen Plus trial offered to all new users at the end of onboarding, lifetime purchases, unlimited chats and priority responses. Early access is described conditionally because the user confirmed it only partly. Purchase-screen eligibility and Apple renewal/cancellation conditions remain. The user requested the description "enhanced Google AI model" without further model details. Privacy now explicitly covers the declared purchase/usage advertising data and crash analytics.

The user also confirmed that guest profiles and chats remain saved under an account ID without verification of a guest's real-world identity. The policy describes that distinction rather than claiming anonymous processing. These App Store differences remain:

- **Account linkage and omitted content categories.** App Store Connect currently declares all collected data as "not linked." [Apple's definition](https://developer.apple.com/app-store/app-privacy-details/#data-linked-to-the-user) includes linkage through an account or device, so the user's confirmed account storage does not establish that classification. The nine selected types also do not include user content or sensitive information, although the policy describes saved conversations and faith preferences. Review the actual data flows and declarations; do not remove accurate policy disclosures merely to mirror the label.
- **Legal links.** Both the public description and the configured privacy URL still point to amenbible.app. Opening the published privacy link through computer use on 13 October forwarded to /lander rather than a policy; that domain cannot be fixed by this repository. The current website links are https://amen-app.com/privacy/ and https://amen-app.com/terms/. Apple metadata remains read-only at the user's request.
- **Description precision.** The public description says a subscription is required after trial access, although the user confirmed lifetime purchases also provide access. Its early-access wording is broader than the user's partial confirmation. The website describes both purchase routes and conditional early access. The public model description is more specific than the user's approved "enhanced Google AI model" wording; no further model-training claim was inferred.

The website update adds 33 English privacy words and 40 English terms words including summaries and headings. All existing website checks and the comparison with the app's six supported languages passed. The twelve translated privacy/terms pages were checked at a 320-pixel viewport with no horizontal overflow, and the English purchase/trial copy was visually reviewed at the normal browser size. The temporary viewport was reset. No iOS build or runtime verification was performed.

## Unresolved disclosure and implementation matters

1. **Controller and operator identity.** The user requested removal of personal operator details, and they were removed from public copy. GDPR Article 13 requires the controller's identity and contact details. German DDG Section 5 requires provider identification, including name and address, for services within its scope. A brand and support email are not an established replacement for the legal identity. This remains a disclosure gap; the general legal-information page must not be represented as a compliant operator notice. Resolve a lawful legal-entity/business identity and disclosure arrangement before relying on these documents for compliance.
2. **Recipient transparency.** Review whether the recipient categories sufficiently identify each processing activity, especially advertising partners and independent controllers. Agreements, regions, subprocessors, transfer safeguards and retention configuration remain unverified. Supply actual recipient information when required, including rights requests.
3. **Religious data and consent.** The app stores denomination with account chat settings and includes it in AI requests. The 11 October source review found no active calls to the attribution helpers for denomination, selected goals or Bible-version values; their definitions alone do not establish transmission. Active measurement includes onboarding step events. Article 9 GDPR can apply to faith answers and related inferences. No separate explicit-consent mechanism was established, and the denomination step requires a selection to continue. Apple tracking authorization does not provide that condition. Review actual payloads, lawful purposes, consent and withdrawal in the app.
4. **Google conditions.** Current Gemini API terms include an age requirement and restrict clients directed toward or likely accessed by under-18s. Paid services are required for clients offered in the EEA, Switzerland and UK. Removing public age wording does not waive those conditions. Verify audience, access controls and project status. No universal no-training promise was added.
5. **Deletion and retention.** AccountDeletionView requests the backend delete-user-account operation, whose implementation is absent from the reviewed checkout. Complete cloud/provider deletion, local cleanup and backup expiry remain unverified. The policy separates account deletion, exported copies, lawful retention and Apple cancellation.
6. **Contracts and purchases.** Verify actual offers, storefront contracting parties, standard/custom license setup, withdrawal information and incorporation of terms. Publication alone does not obtain acceptance or waive mandatory rights. Existing contracts need the update process required by law.
7. **Other legal URLs.** iOS source commit f4730a1 now uses localized amen-app.com privacy and terms URLs through the shared AppLegalLinks helper. Older installed app versions and App Store metadata remain separate states and must be checked independently. This website cannot redirect the older amenbible.app or amen-ai.com domains.

Qualified legal review should resolve these matters, including translations and applicable jurisdiction. Website checks cannot establish compliance with an omitted legal identity or unverified production facts.

## Source evidence

Read-only review used SupportedLanguage in Services/LocalizationManager.swift; AI/audio in GeminiChatService.swift and BibleTTSService.swift; context in ChatService.swift; saved history in ConversationService.swift; attribution in AppsFlyerOnboardingService.swift; SDK startup in AMENApp.swift; photos in ProfilePictureService.swift; Bible Lock; and AccountDeletionView.swift.

No iOS build, compilation, launch, simulator/device test or paid AI request was performed.

## App-source follow-up — 11 October 2026

The follow-up reviewed all 22 baseline privacy and 28 terms sections against active guest-account creation, Apple linking and existing returning email/password login; device session persistence; onboarding answers; local notes/highlights; account-based saved messages and conversations; public leaderboard fields; reminder schedules and time zones; Days with Jesus and widgets; Bible Lock selections/recommendation history; media downloads; and music preferences.

The 11 October legal revision incorporates source-confirmed guest-account behavior, Apple linking and returning email/password login, the local/cloud storage distinction, ranking visibility and country flags, notification schedules/time zones, Days with Jesus and widgets, current Discover features, music preferences, Bible Lock inputs and device-only deletion limits. Five privacy sections were added and all changes were translated into all six languages. The analytics description was corrected because unused helper definitions are not active call sites. A separate local audit records source evidence and proposals for consent, deletion, account-linking and production-configuration work; those implementation changes were not performed.

The visual revision follows DESIGN.md with system type, neutral surfaces, a 680-pixel reading column, compact headings and collapsed contents. A single compact language disclosure appears at the bottom only. Browser-primary language detection, English fallback, explicit language URLs, section anchors and no-storage behavior remain in place.

## Official references

- Apple app deletion: https://support.apple.com/en-us/101550
- Apple account deletion: https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion
- Apple Media Services rules: https://www.apple.com/legal/internet-services/itunes/
- Apple standard app license: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
- Apple privacy: https://www.apple.com/legal/privacy/en-ww/
- Apple cancellation: https://support.apple.com/en-us/118428
- Apple refunds: https://support.apple.com/en-us/118223
- Google AI conditions: https://ai.google.dev/gemini-api/terms
- Google privacy: https://policies.google.com/privacy
- GDPR, especially Articles 6, 8, 9, 13, 12–22 and 44–49: https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng
- German operator disclosure, DDG Section 5: https://www.gesetze-im-internet.de/ddg/
- German Civil Code: https://www.gesetze-im-internet.de/englisch_bgb/englisch_bgb.html
- Closure of the former EU ODR platform: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32024R3228

## Verification

Generated-file, translation, link/anchor, app-language, fallback, restricted-storage, print-action and existing landing-page checks passed for all 40 pages. Checks cover requested public wording, app-only privacy scope, retained recipient categories and Apple links. Content hashes prevent stale CSS/JavaScript after generation.

All 24 translated documents were inspected at widths 1,280 and 320: 48 page/viewport combinations rendered without overflow, retained lowercase branding, contained five Apple references and showed no removed operator or infrastructure names. No browser warning or error was captured.

Print wiring and stylesheet were checked; a native print dialog and exported PDF were not verified. The iOS runtime and production systems remain unverified.

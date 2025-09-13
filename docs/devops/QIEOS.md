# IMPORTANT:

# Always read qieos.md before writing any code.

# After adding a major feature or completing a milestone, update [qieos].md.

# Document the entire codebase & database schema in [qieos].md.

# For new additions or migrations, make sure to add them to the same file.

---

## QiAlly Marketing Site

This section outlines the pages, routes, and API endpoints for the QiAlly marketing site built within the QiEOS application.

### Frontend (/apps/web)

**Pages & Components:**
- **Layout:** `src/components/MarketingLayout.tsx` (Header and Footer wrapper)
- **Home:** `src/routes/public/Home.tsx`
- **About:** `src/routes/public/About.tsx`
- **Services:** `src/routes/public/Services.tsx`
- **Contact:** `src/routes/public/Contact.tsx`
- **Letter Wizard:** `src/routes/public/LetterWizard.tsx`
- **Terms:** `src/routes/public/Terms.tsx`
- **Privacy:** `src/routes/public/Privacy.tsx`

**Routing (`src/App.tsx`):**
| Path             | Component      | Description                                      |
|------------------|----------------|--------------------------------------------------|
| `/`              | `Home`         | Main marketing landing page.                     |
| `/about`         | `About`        | Company and founder information.                 |
| `/services`      | `Services`     | Details on services offered.                     |
| `/contact`       | `Contact`      | Contact form and details.                        |
| `/letter-wizard` | `LetterWizard` | USCIS letter generator tool (or waitlist).       |
| `/terms`         | `Terms`        | Terms of Service.                                |
| `/privacy`       | `Privacy`      | Privacy Policy.                                  |

### Backend (/workers/api)

**API Endpoints:**
| Method | Path             | Handler                     | Description                                      |
|--------|------------------|-----------------------------|--------------------------------------------------|
| POST   | `/api/contact`   | `src/routes/contact.ts`     | Submits the contact form.                        |
| POST   | `/api/waitlist`  | `src/routes/waitlist.ts`    | Adds a user to a feature waitlist.               |

**Environment Variables (`/infra/cloudflare/.env.example`):**
- `CONTACT_WEBHOOK_URL`: Webhook URL to send contact form submissions to.
- `WAITLIST_KV_NAMESPACE`: The name of the Cloudflare KV Namespace for storing waitlist signups.
- `VITE_WIZARD_ENABLED`: Set to "true" to enable the Letter Wizard feature on the frontend.

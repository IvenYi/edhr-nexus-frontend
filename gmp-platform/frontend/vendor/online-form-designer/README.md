# Online Form Designer Vendor Copy

This directory contains the managed copy of the online-form designer migrated from `paas-main-front`.

Editing rule:

- Make designer changes in this directory only.
- Do not use the external `paas-main-front` checkout as a runtime dependency.
- Do not edit files under the external `paas-main-front` checkout for template-designer work.

Local development:

```bash
cd gmp-platform/frontend
npm run designer:dev
```

The React host embeds the designer through `/online-form/designer`. In local development, the React Vite dev server proxies `/online-form` to this vendor app on port `3100`.

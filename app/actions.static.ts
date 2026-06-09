// Client-safe stand-ins for the Server Actions, used only in the static
// export (GitHub Pages) build. Static hosting has no server, so creating or
// deleting subdomains isn't possible — these return a friendly notice instead.
// next.config.ts aliases `@/app/actions` to this file when GITHUB_PAGES=true.

const DEMO_NOTICE =
  'This is a static preview hosted on GitHub Pages — creating and deleting subdomains is disabled. Run the app locally or deploy to Vercel for full functionality.';

export async function createSubdomainAction(
  _prevState: unknown,
  formData: FormData
) {
  return {
    subdomain: (formData.get('subdomain') as string) || '',
    icon: (formData.get('icon') as string) || '',
    success: false,
    error: DEMO_NOTICE
  };
}

export async function deleteSubdomainAction(
  _prevState: unknown,
  _formData: FormData
) {
  return { error: DEMO_NOTICE };
}

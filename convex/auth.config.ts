/**
 * Convex Auth Config — configures JWT validation for Better-Auth sessions.
 *
 * The `domain` must be the JWKS issuer URL exposed by the @convex-dev/better-auth
 * component. It is constructed from the Convex Site URL for this deployment.
 *
 * Flow:
 *  1. Better-Auth signs a JWT and stores it.
 *  2. The client passes the token with each request.
 *  3. Convex fetches {domain}/.well-known/openid-configuration to discover JWKS.
 *  4. `ctx.auth.getUserIdentity()` in queries/mutations returns the validated identity.
 */
export default {
  providers: [
    {
      // The component exposes its JWKS at this path under the Convex Site URL
      domain: process.env.CONVEX_SITE_URL!,
      applicationID: "convex",
    },
  ],
};

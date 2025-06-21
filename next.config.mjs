import { createCivicAuthPlugin } from "@civic/auth/nextjs"

const nextConfig = {
  images: {
    domains: ["auth.civic.com"],
  },
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: process.env.CIVIC_CLIENT_ID
});

export default withCivicAuth(nextConfig)
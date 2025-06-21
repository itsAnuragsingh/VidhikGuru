import { createCivicAuthPlugin } from "@civic/auth/nextjs"

const nextConfig = {
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "52072861-d07c-46c7-8d89-8161bcb1a8d1"
});

export default withCivicAuth(nextConfig)
import { createCivicAuthPlugin } from "@civic/auth/nextjs"

const nextConfig = {
  /* config options here */
}

const withCivicAuth = createCivicAuthPlugin({
  clientId: "dd053716-7606-4704-abe1-965431c93d74"
})

export default withCivicAuth(nextConfig)
const stage = process.env.SST_STAGE || "dev"

export default {
  url: stage === "production" ? "https://conduit.ai" : `https://${stage}.conduit.ai`,
  console: stage === "production" ? "https://conduit.ai/auth" : `https://${stage}.conduit.ai/auth`,
  email: "contact@anoma.ly",
  socialCard: "https://social-cards.sst.dev",
  github: "https://github.com/anomalyco/conduit",
  discord: "https://conduit.ai/discord",
  headerLinks: [
    { name: "app.header.home", url: "/" },
    { name: "app.header.docs", url: "/docs/" },
  ],
}

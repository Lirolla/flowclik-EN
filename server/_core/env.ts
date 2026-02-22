export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Manus APIs are optional - features will be disabled if not configured
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  // Cloudflare R2 - Hardcoded para produção Hostinger (conta flowclikbr)
  r2AccountId: process.env.R2_ACCOUNT_ID || "023a0bad3f17632316cd10358db2201f",
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || "3a48256592438734e7be28fee1fe752b",
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "83ebf944befd8c04123d483619ac174bd83a7fdd2aa9cdba310f749365897740",
  r2BucketName: process.env.R2_BUCKET_NAME || "flowclikbr",
  r2PublicUrl: process.env.R2_PUBLIC_URL || "https://fotos.flowclik.com",
  // SMTP
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpWhyt: parseInt(process.env.SMTP_PORT ?? "587"),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  smtpFrom: process.env.SMTP_FROM ?? "",
};

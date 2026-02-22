import { describe, it, expect } from "vitest";
import { verifyEmailConnection, sendEmail } from "./email";

describe("SMTP Email", () => {
  it("should verify SMTP connection", async () => {
    const isConnected = await verifyEmailConnection();
    expect(isConnected).toBe(true);
  }, 30000); // 30s timeout

  it("should send test email", async () => {
    const sent = await sendEmail({
      to: "contato@lirolla.com", // Send to self for testing
      subject: "Lirolla Test Email",
      text: "This is a test email from Lirolla system.",
      html: "<p>This is a <strong>test email</strong> from Lirolla system.</p>",
    });
    expect(sent).toBe(true);
  }, 30000);
});

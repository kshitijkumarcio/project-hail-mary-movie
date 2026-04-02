import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { betterAuth } from "better-auth";
import authConfig from "./auth.config";
import { emailOTP } from "better-auth/plugins/email-otp";
import { Resend } from "resend";
import * as fs from "fs";
import * as path from "path";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    trustedOrigins: [
      siteUrl,
      "http://localhost:3000",
      "https://*.vercel.app", // Allow all vercel deployments for previews
    ],
    database: authComponent.adapter(ctx),
    plugins: [
      convex({ authConfig }),
      emailOTP({
        // Custom OTP generation: 8 character alphanumeric secret like Linear App
        generateOTP: () => {
          const charSet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding confusing chars: 0, O, I, 1
          return Array.from({ length: 8 }, () =>
            charSet.charAt(Math.floor(Math.random() * charSet.length)),
          ).join("");
        },
        otpLength: 8,
        async sendVerificationOTP({ email, otp, type }) {
          console.log(`[Better Auth] Sending OTP to ${email}: ${otp}`);
          try {
            const resend = new Resend(process.env.RESEND_API_KEY!);

            // Read the compressed ticket image for inline embedding
            const ticketImgPath = path.join(process.cwd(), "public", "images", "ticket-part-1-sm.png");
            const ticketImgBase64 = fs.readFileSync(ticketImgPath).toString("base64");

            const htmlContent = `
              <div style="background-color: #f5f5f5; padding: 60px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; border: 1px solid #e8e8e8; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">
                  
                  <!-- Header -->
                  <div style="background-color: #000000; padding: 32px 40px; text-align: center;">
                    <img src="cid:ticket" alt="PHM Movie Night" style="width: 100px; height: auto; display: block; margin: 0 auto;" />
                    <p style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.5); margin: 14px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Project Hail Mary &bull; Movie Night</p>
                  </div>

                  <!-- Body -->
                  <div style="padding: 48px 40px; text-align: center;">
                    <h1 style="font-size: 26px; font-weight: 900; color: #000000; margin: 0 0 12px 0; letter-spacing: -0.5px;">Your Verification Code</h1>
                    <p style="font-size: 15px; color: #666666; margin: 0 0 40px 0; line-height: 1.65;">
                      Confirm your preferences for the <strong style="color: #000;">Project Hail Mary Movie Night</strong> using the code below.
                    </p>
                    
                    <!-- 3D Code Box -->
                    <div style="display: inline-block; background-color: #ffffff; border: 2px solid #000000; border-right-width: 6px; border-bottom-width: 6px; border-radius: 16px; padding: 20px 48px; margin-bottom: 16px;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #000000;">${otp}</span>
                    </div>
                    <p style="font-size: 12px; color: #aaaaaa; margin: 0 0 40px 0;">Tap & hold to copy</p>
                    
                    <!-- Footer note -->
                    <div style="border-top: 1px solid #eeeeee; padding-top: 28px;">
                      <p style="font-size: 13px; color: #aaaaaa; margin: 0; line-height: 1.6;">
                        This code expires in <strong>5 minutes</strong>. If you didn't request this, you can safely ignore this email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            `;

            const { data, error } = await resend.emails.send({
              from: "PHM Movie Night <namaste@mortalandhaven.com>",
              to: email,
              subject: `${otp} — Your PHM Movie Night Code`,
              text: `Your PHM Movie Night verification code is: ${otp}. It expires in 5 minutes.`,
              html: htmlContent,
              attachments: [
                {
                  filename: "ticket.png",
                  content: ticketImgBase64,
                  contentType: "image/png",
                  contentId: "ticket",
                },
              ],
            });

            if (error) {
              console.error("[Better Auth] Resend sending failed:", error);
            } else {
              console.log("[Better Auth] Resend sending success:", data);
            }
          } catch (error) {
            console.error("[Better Auth] Error in Resend call:", error);
          }
        },
      }),
    ],
  });
};

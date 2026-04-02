import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { betterAuth } from "better-auth";
import authConfig from "./auth.config";
import { emailOTP } from "better-auth/plugins/email-otp";
import { Resend } from "resend";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    plugins: [
      convex({ authConfig }),
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          console.log(`[Better Auth] Sending OTP to ${email}: ${otp}`);
          try {
            const resend = new Resend(process.env.RESEND_API_KEY!);
            console.log("[Better Auth] Resend API Key available:", !!process.env.RESEND_API_KEY);
            const { data, error } = await resend.emails.send({
              // ⚠️ IMPORTANT: Replace 'your-domain.com' with the exact domain you just verified on Resend!
              from: "Project Hail Mary Movie Night <namaste@mortalandhaven.com>",
              to: email,
              subject: "Your Vote Verification Code",
              text: `Your Project Hail Mary Movie Night vote verification code is: ${otp}`,
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

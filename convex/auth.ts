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
          const resend = new Resend(process.env.RESEND_API_KEY!);
          await resend.emails.send({
            from: "Project Hail Mary Movie Night <onboarding@resend.dev>",
            to: email,
            subject: "Your Vote Verification Code",
            text: `Your Project Hail Mary Movie Night vote verification code is: ${otp}`,
          });
        },
      }),
    ],
  });
};

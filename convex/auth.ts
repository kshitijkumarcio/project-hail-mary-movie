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
            
            const htmlContent = `
              <div style="background-color: #fafafa; padding: 60px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05); border: 1px solid #eeeeee;">
                  <div style="padding: 48px 40px; text-align: center;">
                    <!-- Ticket Header -->
                    <div style="margin-bottom: 32px;">
                      <img src="${siteUrl}/images/ticket-part-1.png" alt="Ticket" style="width: 120px; height: auto;" />
                    </div>
                    
                    <h1 style="font-size: 28px; font-weight: 900; color: #000000; margin: 0 0 12px 0; letter-spacing: -0.5px;">Verification Code</h1>
                    <p style="font-size: 16px; color: #666666; margin: 0 0 40px 0; line-height: 1.6;">
                      Confirm your vote for the <b>Project Hail Mary Movie Night</b>. Use the 3D-boxed code below to complete your verification.
                    </p>
                    
                    <!-- 3D Boxed Code -->
                    <div style="display: inline-block; background-color: #ffffff; border: 3px solid #000000; border-right: 8px solid #000000; border-bottom: 8px solid #000000; border-radius: 20px; padding: 24px 40px; margin-bottom: 40px; transition: all 0.2s ease;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 6px; color: #000000;">${otp}</span>
                    </div>
                    
                    <div style="border-top: 1px solid #eeeeee; padding-top: 32px;">
                      <p style="font-size: 13px; color: #999999; margin: 0;">
                        This code will expire soon. If you didn't request this, please ignore this email.
                      </p>
                    </div>
                  </div>
                  
                  <div style="background-color: #000000; padding: 24px; text-align: center;">
                    <p style="font-size: 13px; font-weight: 700; color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                      Project Hail Mary &bull; Movie Night
                    </p>
                  </div>
                </div>
              </div>
            `;

            const { data, error } = await resend.emails.send({
              from: "PHM Movie Night <namaste@mortalandhaven.com>",
              to: email,
              subject: `${otp} - Your Verification Code`,
              text: `Your PHM Movie Night verification code is: ${otp}`,
              html: htmlContent,
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

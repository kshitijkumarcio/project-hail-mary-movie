"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { toast } from "sonner";
import { images } from "@/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { CheckCircle2, Mail, Phone, User, Loader2 } from "lucide-react";
import FlipTextButton from "../ui/flip-text-button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(
      /^\+91 \d{5} \d{5}$/,
      "Phone number must be +91 followed by 10 digits (e.g., +91 00000 00000)",
    ),
  email: z.string().email("Invalid email address"),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateProfileFormProps {
  initialData?: {
    name: string;
    phone: string;
    email: string;
  };
}

const UpdateProfileForm = ({
  initialData = {
    name: "",
    phone: "",
    email: "",
  },
}: UpdateProfileFormProps) => {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [enteredCode, setEnteredCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const updateProfile = useMutation(api.voters.updateProfile);

  const handleSendCode = async () => {
    const email = getValues("email");
    const isValid = await trigger("email");

    if (!isValid) return;

    setIsSendingCode(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (error) {
        toast.error(error.message || "Failed to send verification code");
        return;
      }

      setIsCodeSent(true);
      toast.success("Verification code sent to your email!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send code. Please try again.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsVerifyingCode(true);
    try {
      const { data, error } = await authClient.signIn.emailOtp({
        email: getValues("email"),
        otp: enteredCode,
      });

      if (error) {
        toast.error(
          error.message || "Invalid verification code. Please try again.",
        );
        return;
      }

      setIsEmailVerified(true);
      toast.success("Identity verified successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Verification failed.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!isEmailVerified) {
      toast.error("Please verify your identity first.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        name: data.name,
        phone: data.phone,
      });
      setIsUpdated(true);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUpdated) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="relative w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 animate-in zoom-in duration-500" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Profile Updated!</h2>
        <p className="text-zinc-500 text-lg max-w-md">
          Your personal details have been updated in our database.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-2xl px-10 h-14 bg-black text-white hover:bg-zinc-800 font-bold"
        >
          View Live Results
        </Button>
      </div>
    );
  }

  return (
    <div className="font-mona-sans bg-grid-dashed animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left Side: Form Content */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          <div>
            <p className="text-black font-mona-sans text-[48px] md:text-[60px] leading-tight font-bold">
              (Update Details{" "}
              <span className="inline-block -tracking-[4px] md:-tracking-[6px] translate-y-[-2px]">
                ------
              </span>
              )
            </p>
            <p className="text-zinc-600 mt-4 text-lg max-w-xl">
              We'll use these details to contact you once the final showtime is
              decided.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-8 mt-10"
          >
            {/* Contact Details */}
            <div className="flex flex-col gap-8">
              <p className="text-2xl flex flex-col items-start font-mona-sans font-bold text-black opacity-100">
                [01] &nbsp; Update contact details
                <span className="text-zinc-500 mt-2 text-lg font-medium font-mona-sans max-w-xl">
                  Keep your info fresh.
                </span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Field>
                  <FieldLabel className="font-medium text-lg text-zinc-800">
                    Full Name
                  </FieldLabel>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-black transition-colors" />
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          className="pl-12 h-14 rounded-2xl border-zinc-200 bg-white focus-visible:bg-white transition-all font-mona-sans font-semibold"
                          placeholder="Ryland Grace"
                        />
                      )}
                    />
                  </div>
                  <FieldError errors={[errors.name]} />
                </Field>

                <Field>
                  <FieldLabel className="font-medium text-lg text-zinc-800">
                    Phone Number
                  </FieldLabel>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-black transition-colors" />
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          className="pl-12 h-14 rounded-2xl border-zinc-200 bg-white focus-visible:bg-white transition-all font-mona-sans font-semibold"
                          placeholder="+91 00000 00000"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val.startsWith("+91")) {
                              field.onChange("+91");
                              return;
                            }
                            const digitsOnly = val.slice(3).replace(/\D/g, "");
                            let formatted = "+91";
                            if (digitsOnly.length > 0) {
                              formatted += " " + digitsOnly.slice(0, 5);
                            }
                            if (digitsOnly.length > 5) {
                              formatted += " " + digitsOnly.slice(5, 10);
                            }
                            field.onChange(formatted);
                          }}
                        />
                      )}
                    />
                  </div>
                  <FieldError errors={[errors.phone]} />
                </Field>
              </div>
            </div>

            <p className="text-2xl mt-12 flex flex-col items-start font-mona-sans font-bold text-black opacity-100">
              [02] &nbsp; Verify identity
              <span className="text-zinc-500 mt-2 text-lg font-medium font-mona-sans max-w-xl">
                Security first. We'll send you a code.
              </span>
            </p>

            {/* Email Verification Component */}
            <Field>
              <FieldLabel className="font-medium text-lg text-zinc-800">
                Email Address
              </FieldLabel>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-black transition-colors" />
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          className="pl-12 h-14 rounded-2xl border-zinc-200 bg-white focus-visible:bg-white font-mona-sans font-semibold transition-all text-base disabled:bg-zinc-50 disabled:opacity-70"
                          type="email"
                          placeholder="rylandgrace@gmail.com"
                          disabled={isEmailVerified || isCodeSent}
                        />
                      )}
                    />
                  </div>
                  {!isCodeSent && !isEmailVerified && (
                    <Button
                      type="button"
                      className="h-14 rounded-2xl px-10 min-w-[160px] font-bold text-sm uppercase tracking-wider transition-all cursor-pointer border border-zinc-400 bg-zinc-200 hover:bg-zinc-300"
                      onClick={handleSendCode}
                      disabled={isSendingCode}
                    >
                      <FlipTextButton maxHeight="max-h-14">
                        {isSendingCode ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Send OTP"
                        )}
                      </FlipTextButton>
                    </Button>
                  )}

                  {isEmailVerified && (
                    <div className="h-14 rounded-2xl px-8 min-w-[140px] font-bold text-sm uppercase tracking-wider bg-green-50 text-green-700 border border-green-200 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Verified
                    </div>
                  )}
                </div>

                {isCodeSent && !isEmailVerified && (
                  <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative flex-1 group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center h-full text-zinc-400 font-bold text-[10px] uppercase tracking-tighter">
                        OTP
                      </div>
                      <Input
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value)}
                        className="pl-16 h-14 rounded-2xl border-zinc-200 bg-white focus-visible:bg-white transition-all text-base font-mono uppercase tracking-widest"
                        placeholder="••••••••"
                        autoFocus
                      />
                    </div>
                    <Button
                      type="button"
                      className="h-14 rounded-2xl px-10 min-w-[160px] font-bold text-sm uppercase tracking-wider transition-all cursor-pointer bg-black text-white hover:bg-zinc-800"
                      onClick={handleVerifyCode}
                      disabled={isVerifyingCode || !enteredCode}
                    >
                      <FlipTextButton maxHeight="max-h-14">
                        {isVerifyingCode ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Verify Identity"
                        )}
                      </FlipTextButton>
                    </Button>
                  </div>
                )}
              </div>
              <FieldError errors={[errors.email]} />
            </Field>

            <Button
              type="submit"
              size="lg"
              className={cn(
                "w-full h-16 text-xl font-bold rounded-2xl transition-all shadow-xl shadow-black/5 disabled:opacity-100 disabled:cursor-not-allowed disabled:pointer-events-auto",
                !isEmailVerified || isSubmitting
                  ? "bg-zinc-200 text-zinc-500"
                  : "bg-black text-white hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99]",
              )}
              disabled={!isEmailVerified || isSubmitting}
            >
              <FlipTextButton maxHeight="max-h-16">
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Updating profile...
                  </div>
                ) : (
                  "Confirm Profile Update"
                )}
              </FlipTextButton>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfileForm;

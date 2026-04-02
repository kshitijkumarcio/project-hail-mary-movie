"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { DAYS, THEATERS, SHOWTIMES_BY_THEATER } from "@/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { CheckCircle2, Mail, Phone, User, Loader2, Clock } from "lucide-react";
import FlipTextButton from "../ui/flip-text-button";

// Schema (reused from voting-form)
const formSchema = z.object({
  session: z
    .array(z.string())
    .min(1, "Please select at least one movie timing"),
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

const UpdateDetailsForm = ({
  initialData = {
    name: "",
    phone: "",
    email: "",
    session: [],
  },
}) => {
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

  const handleSendCode = async () => {
    const email = getValues("email");
    const isValid = await trigger("email");

    if (!isValid) return;

    setIsSendingCode(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSendingCode(false);
    setIsCodeSent(true);
    toast.success("Verification code sent to your email!");
  };

  const handleVerifyCode = async () => {
    if (enteredCode.toLowerCase() !== "de408ddf") {
      toast.error("Invalid verification code. Try 'de408ddf'");
      return;
    }

    setIsVerifyingCode(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsVerifyingCode(false);
    setIsEmailVerified(true);
    toast.success("Identity verified successfully!");
  };

  const onSubmit = async (data: FormValues) => {
    if (!isEmailVerified) {
      toast.error("Please verify your email first.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Updated Data:", data);
    setIsSubmitting(false);
    setIsUpdated(true);
    toast.success("Details updated successfully!");
  };

  if (isUpdated) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 animate-in zoom-in duration-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Sync Complete!</h2>
          <p className="text-zinc-500 text-lg max-w-sm">
            Your preferences have been synchronized with the latest community
            results.
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl px-8 h-12 bg-black text-white hover:bg-zinc-800"
        >
          View Live Results
        </Button>
      </div>
    );
  }

  return (
    <div className="font-mona-sans">
      <div className="space-y-2 mb-12">
        <p className="text-black text-[48px] md:text-[60px] leading-tight font-bold">
          (Update Preferences{" "}
          <span className="inline-block -tracking-[4px] md:-tracking-[6px] translate-y-[-2px]">
            ------
          </span>
          )
        </p>
        <p className="text-zinc-600 text-lg max-w-xl">
          Modify your movie choices or personal contact information.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        {/* Session Selection Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 opacity-40">
            <Clock size={20} className="text-black" />
            <h3 className="text-sm font-bold uppercase tracking-widest">
              01 / Movie Slots
            </h3>
          </div>

          <Controller
            name="session"
            control={control}
            render={({ field }) => (
              <div className="space-y-10">
                {DAYS.map((day) => (
                  <div key={day} className="space-y-6">
                    <p className="text-xl font-bold text-black border-l-4 border-black pl-4">
                      {day}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {THEATERS.map((theater) => {
                        const times = SHOWTIMES_BY_THEATER[day][theater.id];
                        if (times.length === 0)
                          return (
                            <div
                              key={`${day}-${theater.id}`}
                              className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
                            >
                              <p className="text-xs font-bold text-zinc-400 uppercase mb-2">
                                {theater.name}
                              </p>
                              <p className="text-zinc-800 text-sm font-semibold italic opacity-60">
                                No slots available
                              </p>
                            </div>
                          );

                        return (
                          <div
                            key={`${day}-${theater.id}`}
                            className="space-y-3"
                          >
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">
                              {theater.name}
                            </p>
                            <div className="space-y-2">
                              {times.map((time) => {
                                const val = `${day} | ${theater.name} | ${time}`;
                                const selected = field.value?.includes(val);
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => {
                                      const current = field.value || [];
                                      const next = selected
                                        ? current.filter((v) => v !== val)
                                        : [...current, val];
                                      field.onChange(next);
                                    }}
                                    className={cn(
                                      "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 text-left",
                                      selected
                                        ? "bg-black border-black text-white"
                                        : "bg-white border-zinc-100 hover:border-zinc-200",
                                    )}
                                  >
                                    <span className="font-semibold text-sm">
                                      {time}
                                    </span>
                                    <div
                                      className={cn(
                                        "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                                        selected
                                          ? "border-white bg-white/20"
                                          : "border-zinc-200",
                                      )}
                                    >
                                      {selected && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
        </div>

        <div className="h-px bg-zinc-100" />

        {/* Contact Info Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 opacity-40">
            <User size={20} className="text-black" />
            <h3 className="text-sm font-bold uppercase tracking-widest">
              02 / Contact Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel className="text-zinc-500">Full Name</FieldLabel>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-black transition-colors" />
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      className="pl-12 h-14 rounded-2xl border-zinc-200"
                    />
                  )}
                />
              </div>
              <FieldError errors={[errors.name]} />
            </Field>

            <Field>
              <FieldLabel className="text-zinc-500">Phone Number</FieldLabel>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-black transition-colors" />
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      className="pl-12 h-14 rounded-2xl border-zinc-200"
                    />
                  )}
                />
              </div>
              <FieldError errors={[errors.phone]} />
            </Field>
          </div>
        </div>

        {/* OTP Section */}
        <div className="space-y-8 p-8 bg-zinc-50 rounded-[32px] border border-zinc-100">
          <div className="flex items-center gap-3 opacity-40">
            <Mail size={20} className="text-black" />
            <h3 className="text-sm font-bold uppercase tracking-widest">
              03 / Identity Verification
            </h3>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-black transition-colors" />
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      disabled={isEmailVerified || isCodeSent}
                      className="pl-12 h-14 rounded-2xl border-zinc-200 bg-white"
                    />
                  )}
                />
              </div>
              {!isCodeSent && !isEmailVerified && (
                <Button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSendingCode}
                  className="h-14 px-8 rounded-2xl bg-zinc-200 text-black hover:bg-zinc-300 transition-all overflow-hidden"
                >
                  <FlipTextButton maxHeight="max-h-14">
                    {isSendingCode ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Send OTP"
                    )}
                  </FlipTextButton>
                </Button>
              )}
              {isEmailVerified && (
                <div className="h-14 px-6 rounded-2xl bg-green-50 text-green-700 border border-green-100 flex items-center gap-2 font-bold text-sm uppercase">
                  <CheckCircle2 size={16} /> Verified
                </div>
              )}
            </div>

            {isCodeSent && !isEmailVerified && (
              <div className="flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase text-zinc-400">
                    Code
                  </div>
                  <Input
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    className="pl-16 h-14 rounded-2xl border-zinc-200 bg-white uppercase tracking-[0.2em] font-mono"
                    placeholder="••••••••"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={isVerifyingCode || !enteredCode}
                  className="h-14 px-8 rounded-2xl bg-black text-white hover:bg-zinc-800"
                >
                  <FlipTextButton maxHeight="max-h-14">
                    {isVerifyingCode ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Verify Identity"
                    )}
                  </FlipTextButton>
                </Button>
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className={cn(
            "w-full h-16 text-xl font-bold rounded-2xl transition-all shadow-xl disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed",
            isEmailVerified && !isSubmitting
              ? "bg-black text-white hover:bg-zinc-800"
              : "bg-zinc-100 text-zinc-400 shadow-none",
          )}
          disabled={!isEmailVerified || isSubmitting}
        >
          <FlipTextButton maxHeight="max-h-16">
            {isSubmitting ? (
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin" />
                Updating Database...
              </div>
            ) : (
              "Confirm Changes"
            )}
          </FlipTextButton>
        </Button>
      </form>
    </div>
  );
};

export default UpdateDetailsForm;

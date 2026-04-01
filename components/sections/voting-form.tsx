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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { CheckCircle2, Mail, Phone, User, Loader2 } from "lucide-react";
import Link from "next/link";

// Types and Schema
const formSchema = z.object({
  session: z.string().min(1, "Please select a movie timing"),
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

const TIMINGS = {
  Saturday: [
    "4.30pm - 6.30pm, Saturday",
    "7.00pm - 9.00pm, Saturday",
    "9.30pm - 11.30pm, Saturday",
  ],
  Sunday: ["4.30pm - 6.30pm, Sunday", "7.00pm - 9.00pm, Sunday"],
};

const VotingForm = () => {
  const before = `before:absolute before:content-[" "] before:-left-0 before:-bottom-[1px] before:block before:w-[100%] before:h-[1px] before:bg-zinc-600 before:duration-1000 before:transition-all before:cubic-bezier(0.19, 1, 0.22, 1) before:scale-x-0 before:origin-left hover:before:scale-x-100 hover:before:delay-300`;

  const after = `after:absolute after:content-[" "] after:left-0 after:-bottom-[1px] after:block after:w-full after:h-[1px] after:bg-zinc-600 after:duration-1000 after:transition-all after:cubic-bezier(0.19, 1, 0.22, 1) after:origin-right after:delay-300 hover:after:scale-x-0 hover:after:delay-0`;

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      session: "",
      name: "",
      phone: "+91",
      email: "",
    },
  });

  const handleVerifyEmail = async () => {
    const email = getValues("email");
    const isValid = await trigger("email");

    if (!isValid) return;

    setIsVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsVerifying(false);
    setIsEmailVerified(true);
    toast.success("Email verified successfully!");
  };

  const onSubmit = async (data: FormValues) => {
    if (!isEmailVerified) {
      toast.error("Please verify your email first.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Form Data:", data);
    setIsSubmitting(false);
    setHasVoted(true);
    toast.success("Vote submitted! Thank you for choosing PHM.");
  };

  if (hasVoted) {
    return (
      <div
        id="voting-form"
        className="px-6 py-12 flex flex-col items-center justify-center text-center space-y-4"
      >
        <div className="relative w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 animate-in zoom-in duration-500" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          Thanks for voting!
        </h2>
        <p className="text-zinc-500 text-lg">
          We&apos;ve recorded your choice. See you at the screening! (Alright
          ------)
        </p>
      </div>
    );
  }

  return (
    <div id="voting-form" className="px-6 py-12 mx-auto bg-grid-dashed">
      <div className="space-y-4">
        <p className="text-black font-mona-sans text-[48px] md:text-[60px] leading-tight font-bold">
          (Alright{" "}
          <span className="inline-block -tracking-[4px] md:-tracking-[6px] translate-y-[-2px]">
            ------
          </span>
          )
        </p>
        <p className="text-zinc-600 text-lg max-w-xl">
          Let me just explain how this is gonna work, put on your game face.
        </p>
      </div>

      <div className="flex justify-between items-start mt-20">
        <div className="flex flex-col flex-1 gap-4 ">
          <p className="text-2xl font-bold text-black opacity-100">
            [01] &nbsp; Choosing the movie slot(s)
          </p>
          <p className="text-zinc-600 text-lg mt-2 max-w-xl">
            Choose the movie slot that works best for you. You can select
            multiple, which would mean, any of the slots you have selected,
            would work for you.
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-start items-start gap-4">
          <p className="text-2xl font-bold text-black opacity-100">
            [02] &nbsp; Knowing your data privacy
          </p>
          <p className="text-zinc-600 text-lg mt-2 max-w-xl">
            Only Kshitij can see the name & phone that you provide here. To the
            rest, everyone appears as an anonymous voter, with no way of knowing
            anyone's name or phone number. No whatsapp group shenanigans.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-start mt-20">
        <div className="flex flex-col flex-1 gap-4 ">
          <p className="text-2xl font-bold text-black opacity-100">
            [03] &nbsp; Finalising the slot
          </p>
          <p className="text-zinc-600 text-lg mt-2 max-w-xl">
            The slot having the maximum votes by the end of Friday will be
            finalised. People who did not choose the slot that has maximum
            votes, can either adjust, or, ask me to help them out with the same.
            I'll pair you with people who have similar preferences, so ya'll can
            plan that screening together. Everyone wins.
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-start items-start gap-4">
          <p className="text-2xl font-bold text-black opacity-100">
            [04] &nbsp; Booking & payments
          </p>
          <p className="text-zinc-600 text-lg mt-2 max-w-xl">
            You can select and book your seat on your own, OR, you can ask me to
            take care of that too. Whatever is easier for you. (Just ask me for
            my UPI Id if you choose the later)
          </p>
        </div>
      </div>

      <div className="flex justify-between items-start mt-20">
        <div className="flex flex-col flex-1 gap-4 ">
          <p className="text-2xl font-bold text-black opacity-100">
            [05] &nbsp; Anything else?
          </p>
          <div>
            <p className="text-zinc-600 inline text-lg mt-2 max-w-xl">
              Here's my{" "}
            </p>
            <Link
              href="https://wa.me/918208377317"
              className="inline"
              target="_blank"
            >
              <p
                className={cn(
                  "inline text-zinc-600 relative text-lg",
                  before,
                  after,
                )}
              >
                Whatsapp.
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* form */}

      <div className="mt-40">
        <p className="text-black font-mona-sans text-[48px] md:text-[60px] leading-tight font-bold">
          (Okay then{" "}
          <span className="inline-block -tracking-[4px] md:-tracking-[6px] translate-y-[-2px]">
            ------
          </span>
          )
        </p>
      </div>

      {/* Left Side: Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 mt-20 gap-16 items-start">
        <div className="lg:col-span-8 flex flex-col gap-10">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-8"
          >
            {/* Session Selection */}
            <Field className="flex flex-col gap-4">
              <FieldLabel className="text-xl font-bold text-black opacity-100">
                Choose movie slot(s)
              </FieldLabel>
              <Controller
                name="session"
                control={control}
                render={({ field }) => (
                  <div className="space-y-4">
                    <RadioGroup
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                      {Object.entries(TIMINGS).map(([day, times]) => (
                        <div key={day} className="flex flex-col gap-3">
                          <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-zinc-400">
                            {day}
                          </h3>
                          <div className="flex flex-col gap-2">
                            {times.map((time) => {
                              const value = `${day}: ${time}`;
                              const isSelected = field.value === value;
                              return (
                                <label
                                  key={time}
                                  className={cn(
                                    "relative flex items-center justify-between px-5 py-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 group overflow-hidden",
                                    isSelected
                                      ? "border-black bg-black text-white shadow-xl shadow-black/10 scale-[1.02]"
                                      : "border-zinc-100 bg-white hover:border-zinc-200 hover:bg-zinc-50/50",
                                  )}
                                >
                                  <span className="font-semibold text-base">
                                    {time}
                                  </span>
                                  <RadioGroupItem
                                    value={value}
                                    className="sr-only"
                                  />
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                      isSelected
                                        ? "border-white bg-white/20"
                                        : "border-zinc-200 bg-zinc-50",
                                    )}
                                  >
                                    {isSelected && (
                                      <div className="w-2 h-2 rounded-full bg-white scale-110" />
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                    <FieldError errors={[errors.session]} />
                  </div>
                )}
              />
            </Field>

            {/* Personal Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Field>
                <FieldLabel className="font-semibold">Full Name</FieldLabel>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-black transition-colors" />
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className="pl-12 h-14 rounded-2xl border-zinc-200 bg-zinc-50/30 focus-visible:bg-white transition-all text-base"
                        placeholder="Ryland Grace"
                      />
                    )}
                  />
                </div>
                <FieldError errors={[errors.name]} />
              </Field>

              <Field>
                <FieldLabel className="font-semibold">Phone Number</FieldLabel>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-black transition-colors" />
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className="pl-12 h-14 rounded-2xl border-zinc-200 bg-zinc-50/30 focus-visible:bg-white transition-all text-base"
                        placeholder="+91 00000 00000"
                        onChange={(e) => {
                          const val = e.target.value;
                          // Always ensure it starts with +91
                          if (!val.startsWith("+91")) {
                            field.onChange("+91");
                            return;
                          }
                          // Only allow digits after +91
                          const digitsOnly = val.slice(3).replace(/\D/g, "");

                          // Format: +91 00000 00000
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

            {/* Email Verification Component */}
            <Field>
              <FieldLabel className="font-semibold">Email Address</FieldLabel>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-black transition-colors" />
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className="pl-12 h-14 rounded-2xl border-zinc-200 bg-zinc-50/30 focus-visible:bg-white transition-all text-base disabled:bg-zinc-100 disabled:opacity-100"
                        type="email"
                        placeholder="john@example.com"
                        disabled={isEmailVerified}
                      />
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant={isEmailVerified ? "outline" : "default"}
                  className={cn(
                    "h-14 rounded-2xl px-8 min-w-[140px] font-bold text-sm uppercase tracking-wider transition-all",
                    isEmailVerified &&
                      "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800",
                  )}
                  onClick={handleVerifyEmail}
                  disabled={isVerifying || isEmailVerified}
                >
                  {isVerifying ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isEmailVerified ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Verified
                    </div>
                  ) : (
                    "Verify Email"
                  )}
                </Button>
              </div>
              <FieldError errors={[errors.email]} />
            </Field>

            <Button
              type="submit"
              size="lg"
              className="w-full h-16 text-xl font-bold rounded-2xl bg-black text-white hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-30 disabled:scale-100 shadow-xl shadow-black/5"
              disabled={!isEmailVerified || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Submitting Vote...
                </div>
              ) : (
                "Confirm & Secure Spot"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side: Mascot Visual */}
      <div className="lg:col-span-4 flex justify-center items-start lg:pt-20">
        <div className="sticky top-28 flex flex-col items-center gap-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-black/5 rounded-full blur-[60px] group-hover:bg-black/10 transition-colors" />
            <div className="relative w-[300px] h-[300px] transition-transform duration-700 ease-out hover:scale-110 hover:-rotate-3">
              <Image
                src={images.rocky}
                alt="Rocky Mascot"
                sizes="400px"
                fill
                priority
                className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
              />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-xs font-bold text-zinc-300 uppercase tracking-[0.3em] italic">
              Mission Approved
            </p>
            <div className="w-12 h-1 bg-zinc-100 mx-auto rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingForm;

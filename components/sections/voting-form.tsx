"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { toast } from "sonner";
import { images, DAYS, THEATERS, SHOWTIMES_BY_THEATER } from "@/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { CheckCircle2, Mail, Phone, User, Loader2 } from "lucide-react";
import Link from "next/link";
import FlipTextButton from "../ui/flip-text-button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";

// Types and Schema
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



const VotingForm = () => {
  

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [enteredCode, setEnteredCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // ── Live Convex data ────────────────────────────────────────────────────────
  const slotCountDocs = useQuery(api.showtimes.getAllSlotCounts);
  const isLoadingVotes = slotCountDocs === undefined;

  const theaterById = Object.fromEntries(THEATERS.map((t) => [t.id, t.name]));
  const liveVotesMap: Record<string, number> = {};
  
  if (slotCountDocs) {
    for (const doc of slotCountDocs) {
      const theaterName = theaterById[doc.theaterId] ?? doc.theaterId;
      const displayKey = `${doc.date} | ${theaterName} | ${doc.time}`;
      liveVotesMap[displayKey] = doc.voteCount;
    }
  }

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      session: [],
      name: "",
      phone: "",
      email: "",
    },
  });

  // Restore form data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("phm-voting-form");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        reset(parsed);
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
  }, [reset]);

  // Persist form data to localStorage whenever it changes
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem("phm-voting-form", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const castVoteMutation = useMutation(api.voters.castVote);

  const handleSendCode = async () => {
    const email = getValues("email");
    const isValid = await trigger("email");

    if (!isValid) return;

    setIsSendingCode(true);

    const promise = new Promise(async (resolve, reject) => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      if (error) reject(error);
      else resolve(true);
    });

    toast.promise(promise, {
      loading: "Sending verification code...",
      success: "Verification code sent to your email!",
      error: (err: any) => err.message || "Failed to send code.",
    });

    try {
      await promise;
      setIsCodeSent(true);
    } catch {
      // Error handled by toast.promise
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsVerifyingCode(true);
    const email = getValues("email");
    
    const promise = new Promise(async (resolve, reject) => {
      const { error } = await authClient.signIn.emailOtp({
        email,
        otp: enteredCode,
      });
      if (error) reject(error);
      else resolve(true);
    });

    toast.promise(promise, {
      loading: "Verifying code...",
      success: "Email verified successfully!",
      error: (err: any) => err.message || "Invalid verification code.",
    });

    try {
      await promise;
      setIsEmailVerified(true);
    } catch {
      // Error handled by toast.promise
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!isEmailVerified) {
      toast.error("Please verify your email first.");
      return;
    }

    setIsSubmitting(true);
    
    const promise = castVoteMutation({
      name: data.name,
      phone: data.phone,
      email: data.email,
      selectedSlots: data.session,
    });

    toast.promise(promise, {
      loading: "Submitting your voting preferences...",
      success: "Vote submitted! Thank you for choosing PHM.",
      error: (err: any) => err.message || "An error occurred while casting your vote.",
    });

    try {
      await promise;
      localStorage.removeItem("phm-voting-form");
      setHasVoted(true);
    } catch {
      // Error handled by toast.promise
    } finally {
      setIsSubmitting(false);
    }
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
    <div id="voting-form" className="px-16 font-mona-sans bg-grid-dashed">
      <div className="grid grid-cols-1 lg:grid-cols-12 pt-40 gap-16 items-start">
        {/* Left Side: Form Content */}

        <div className="lg:col-span-8 flex flex-col gap-10">
          <div className="">
            <p className="text-black font-mona-sans text-[48px] md:text-[60px] leading-tight font-bold">
              (Okay then{" "}
              <span className="inline-block -tracking-[4px] md:-tracking-[6px] translate-y-[-2px]">
                ------
              </span>
              )
            </p>
            <p className="text-zinc-600 mt-4 text-lg max-w-xl">
              Let's get this started. What are your ideal movie slots?
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-8 mt-20"
          >
            {/* Session Selection */}
            <Field className="flex flex-col gap-4">
              <FieldLabel className="text-2xl flex flex-col items-start font-mona-sans font-bold text-black opacity-100">
                [01] &nbsp; Choose movie slot(s)
                <p className="text-zinc-500 text-lg font-medium font-mona-sans max-w-xl">
                  Remember, you can select multiple, from both days.
                </p>
              </FieldLabel>
              <Controller
                name="session"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col mt-8 gap-12">
                    {DAYS.map((day) => (
                      <div
                        key={day}
                        className="bg-zinc-100/50 rounded-[12px] px-8 py-8 flex flex-col gap-8"
                      >
                        <div className="flex  items-center gap-4">
                          <p className="text-xl border-l-4 pl-4 font-bold text-black">{day}</p>
                        </div>

                        <div className="grid  mt-3 grid-cols-1 md:grid-cols-2 gap-12">
                          {THEATERS.map((theater) => (
                            <div
                              key={`${day}-${theater.id}`}
                              className="space-y-4"
                            >
                              <div className="flex items-end gap-3">
                                {/* <div
                                  className={cn(
                                    "rounded-full h-2 w-2 ml-5.5",
                                    theater.name === "Cinepolis: VR Mall"
                                      ? "bg-green-500"
                                      : "bg-red-500",
                                  )}
                                /> */}
                                <p className="font-bold text-lg text-zinc-800">
                                  {theater.name}
                                </p>
                                <div
                                  className={cn(
                                    "-translate-y-2 -translate-x-1 h-1 w-3",
                                    theater.name === "Cinepolis: VR Mall"
                                      ? "bg-green-500"
                                      : "bg-red-500",
                                  )}
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                {SHOWTIMES_BY_THEATER[
                                  day as keyof typeof SHOWTIMES_BY_THEATER
                                ][theater.id].length > 0 ? (
                                  SHOWTIMES_BY_THEATER[
                                    day as keyof typeof SHOWTIMES_BY_THEATER
                                  ][theater.id].map((time) => {
                                    const value = `${day} | ${theater.name} | ${time}`;
                                    const isSelected =
                                      field.value?.includes(value);

                                    return (
                                      <button
                                        type="button"
                                        key={value}
                                        onClick={() => {
                                          const current = field.value || [];
                                          const next = isSelected
                                            ? current.filter((v) => v !== value)
                                            : [...current, value];
                                          field.onChange(next);
                                        }}
                                        className={cn(
                                          "relative flex items-center justify-between px-5 py-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 group overflow-hidden text-left",
                                          isSelected
                                            ? "border-black bg-black text-white shadow-xl shadow-black/10 scale-[1.02]"
                                            : "border-zinc-100 bg-white hover:border-zinc-200 hover:bg-zinc-50/50",
                                        )}
                                      >
                                        <div className="flex items-center gap-4">
                                          <div
                                            className={cn(
                                              "rounded-full h-2 w-2",
                                              theater.name ===
                                                "Cinepolis: VR Mall"
                                                ? "bg-green-500"
                                                : "bg-red-500",
                                            )}
                                          ></div>
                                          <p className="font-semibold text-base">
                                            {time}
                                          </p>
                                        </div>
                                          <p className={cn(
                                            "font-normal text-sm transition-colors",
                                            isSelected ? "text-white/60" : "text-zinc-500"
                                          )}>
                                            {liveVotesMap[value] || 0} voted for this
                                          </p>
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
                                      </button>
                                    );
                                  })
                                ) : (
                                  <p className="text-zinc-800 text-sm py-2 max-w-[350px] font-mona-sans tracking-wide font-semibold">
                                    Unfortunately, no showtimes are listed for {day} at {theater.name}
                                    &nbsp;on BookMyShow.
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <FieldError errors={[errors.session]} />
                  </div>
                )}
              />
            </Field>

            <p className="text-2xl mt-24 flex flex-col items-start font-mona-sans font-bold text-black opacity-100">
              [02] &nbsp; Contact details
              <span className="text-zinc-500 mt-2 text-lg font-medium font-mona-sans max-w-xl">
                No one can see this except Kshitij.
              </span>
            </p>

            {/* Personal Info Grid */}
            <div className="grid mt-6 grid-cols-1 md:grid-cols-2 gap-8">
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

            <p className="text-2xl mt-24 flex flex-col items-start font-mona-sans font-bold text-black opacity-100">
              [03] &nbsp; Notes
              <span className="text-zinc-500 mt-2 text-lg font-medium font-mona-sans max-w-xl">
                Some that that might ease you.
              </span>
            </p>

            <div className="flex flex-col max-w-[720px] gap-y-4">
              <div className="flex items-start gap-x-7 bg-zinc-100/50 px-4 pt-4 pb-6 rounded-lg">
                <p className="text-black font-mona-sans tracking-[0.1px] font-semibold text-lg mt-4">
                  (01)
                </p>
                <p className="text-black font-mona-sans tracking-[0.1px] font-medium leading-relaxed text-lg mt-4">
                  You can edit your choises for movie slot(s) later on if you
                  change your mind. This can be done in the 'Live results' tab.
                </p>
              </div>
              <div className="flex items-start gap-x-7 bg-zinc-100/50 px-4 pt-4 pb-6 rounded-lg">
                <p className="text-black font-mona-sans tracking-[0.1px] font-semibold text-lg mt-4">
                  (02)
                </p>
                <p className="text-black font-mona-sans tracking-[0.1px] font-medium leading-relaxed text-lg mt-4">
                  Submitting this form does not mean you HAVE to come to the
                  movie, thats only after the tickets are actually booked.
                </p>
              </div>
            </div>

            <p className="text-2xl mt-24 flex flex-col items-start font-mona-sans font-bold text-black opacity-100">
              [04] &nbsp; Verify and submit
              <span className="text-zinc-500 mt-2 text-lg font-medium font-mona-sans max-w-xl">
                No one can see this except Kshitij.
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
                          className="pl-12 h-14 rounded-2xl border-zinc-200 bg-white focus-visible:bg-white font-mona-sans font-semibold transition-all text-base disabled:bg-zinc-100 disabled:opacity-100"
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
                      className={cn(
                        "h-14 rounded-2xl px-8 min-w-[140px] font-bold text-sm uppercase tracking-wider transition-all overflow-hidden cursor-pointer border border-zinc-400 bg-zinc-200",
                      )}
                      onClick={handleSendCode}
                      disabled={isSendingCode}
                    >
                      <FlipTextButton maxHeight="max-h-14">
                        {isSendingCode ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <span className="inline-block">Send Code</span>
                        )}
                      </FlipTextButton>
                    </Button>
                  )}

                  {isEmailVerified && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-14 rounded-2xl px-8 min-w-[140px] font-bold text-sm uppercase tracking-wider bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      disabled
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Verified
                      </div>
                    </Button>
                  )}
                </div>

                {isCodeSent && !isEmailVerified && (
                  <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative flex-1 group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center h-full text-zinc-400 font-bold text-xs uppercase tracking-tighter">
                        Code
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
                      className="h-14 rounded-2xl px-8 min-w-[140px] font-bold text-sm uppercase tracking-wider transition-all cursor-pointer bg-black text-white hover:bg-zinc-800"
                      onClick={handleVerifyCode}
                      disabled={isVerifyingCode || !enteredCode}
                    >
                      <FlipTextButton maxHeight="max-h-14">
                        {isVerifyingCode ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Verifying...
                          </div>
                        ) : (
                          "Verify Code"
                        )}
                      </FlipTextButton>
                    </Button>
                  </div>
                )}
              </div>
              <FieldError
                errors={[errors.email]}
                className="text-red-600 font-semibold"
              />
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
                    Submitting the form...
                  </div>
                ) : (
                  "Done, I wanna submit!"
                )}
              </FlipTextButton>
            </Button>
          </form>
        </div>

        {/* Right Side: Mascot Visual */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <div className="flex flex-col items-center gap-10 h-[90%] justify-between">
            {/*  */}
            <div className="relative w-[240px] h-[240px] transition-transform duration-700 ease-out hover:scale-110 hover:-rotate-3">
              <Image
                src={images.rocky}
                alt="Rocky Mascot"
                sizes="400px"
                fill
                priority
                className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
              />
            </div>

            {/*  */}
            <div className="mt-10 relative w-[240px] h-[240px] transition-transform duration-700 ease-out hover:scale-110 hover:-rotate-3">
              <Image
                src={images.sticker3}
                alt="Rocky Mascot"
                sizes="400px"
                fill
                priority
                className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
              />
            </div>
            <div className="mt-10 relative w-[240px] h-[240px] transition-transform duration-700 ease-out hover:scale-110 hover:-rotate-3">
              <Image
                src={images.sticker2}
                alt="Rocky Mascot"
                sizes="400px"
                fill
                priority
                className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingForm;

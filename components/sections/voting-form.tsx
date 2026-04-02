"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { toast } from "sonner";
import {
  images,
  DAYS,
  THEATERS,
  SHOWTIMES_BY_THEATER,
  getSlotId,
  ALL_SLOTS,
} from "@/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Mail,
  Phone,
  User,
  Loader2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import FlipTextButton from "../ui/flip-text-button";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useConvexAuth } from "convex/react";

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
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [enteredCode, setEnteredCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const [pendingVote, setPendingVote] = useState<FormValues | null>(null);

  // ── Live Convex data ────────────────────────────────────────────────────────
  const slotCountDocs = useQuery(api.showtimes.getAllSlotCounts);
  const voterRecord = useQuery(api.voters.getMyVoterRecord);
  const isLoadingVotes = slotCountDocs === undefined;
  const isLoadingVoter = voterRecord === undefined;

  const theaterById = Object.fromEntries(THEATERS.map((t) => [t.id, t.name]));
  const liveVotesMap: Record<string, number> = {};

  if (slotCountDocs) {
    for (const doc of slotCountDocs) {
      liveVotesMap[doc.slotId] = doc.voteCount;
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

  // 🟢 Automatically fire the mutation once Convex registers the new Better Auth session
  useEffect(() => {
    const executeVote = async () => {
      if (isAuthenticated && pendingVote) {
        try {
          await castVoteMutation({
            name: pendingVote.name,
            phone: pendingVote.phone,
            email: pendingVote.email,
            selectedSlots: pendingVote.session,
          });

          toast.success("Vote submitted! Thank you for choosing PHM.");
          localStorage.removeItem("phm-voting-form");
          setHasVoted(true);
        } catch (err: any) {
          console.error(err);

          // 🛑 Catch the specific "already voted" error from Convex
          if (err.message && err.message.includes("User has already voted")) {
            toast.success("Welcome back! We already have your vote on record.");
            localStorage.removeItem("phm-voting-form");
            setHasVoted(true); // Still show them the success screen!
          } else {
            // For any other genuine errors, show the red toast
            toast.error(
              err.message || "Failed to submit vote. Please try again.",
            );
          }
        } finally {
          setPendingVote(null);
          setIsSubmitting(false);
        }
      }
    };

    executeVote();
  }, [isAuthenticated, pendingVote, castVoteMutation]);

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

  const onSubmit = async (data: FormValues) => {
    if (!isCodeSent) {
      toast.error("Please request the verification code first.");
      return;
    }

    if (!enteredCode) {
      toast.error("Please enter the verification code sent to your email.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Verify the OTP and log the user in
      const { data: verifyData, error } = await authClient.signIn.emailOtp({
        email: data.email,
        otp: enteredCode,
      });

      if (error) {
        toast.error(
          error.message || "Invalid verification code. Please try again.",
        );
        setIsSubmitting(false);
        return;
      }

      // 2. Auth successful! Store data in pendingVote to trigger Convex submission
      toast.success("Verified! Finalizing your vote...");
      setPendingVote(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  const isAlreadyVoted = voterRecord?.voted || hasVoted;

  if (isAlreadyVoted) {
    return (
      <div
        id="voting-form"
        className="px-16 font-mona-sans bg-grid-dashed min-h-[50vh] flex items-center justify-center pt-40 pb-20"
      >
        <div className="max-w-4xl w-full">
          <div className="bg-white border-2 border-black rounded-[32px] p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black">
                  (You've already voted!{" "}
                  <span className="-tracking-[6px]">----------</span>)
                </h2>
              </div>
              <p className="text-xl text-zinc-500 font-medium max-w-2xl">
                Thank you,{" "}
                <span className="text-black font-bold">
                  {voterRecord?.name || pendingVote?.name}
                </span>
                . Your preferences are with us.
              </p>
            </div>

            <div className="border-y-2 border-zinc-100 py-10 flex flex-col gap-6">
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-1">
                Selected Showtime Choice(s)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(voterRecord?.selectedSlots || pendingVote?.session || []).map(
                  (slotId: string) => {
                    // Try direct ID match first
                    let slotInfo = ALL_SLOTS.find((s) => s.id === slotId);

                    // Fallback: If match fails, try parsing old format "Day | Theater | Time"
                    if (!slotInfo && slotId.includes("|")) {
                      const parts = slotId.split("|").map((p) => p.trim());
                      if (parts.length === 3) {
                        const [day, theaterName, time] = parts;
                        slotInfo = ALL_SLOTS.find(
                          (s) =>
                            s.day === day &&
                            s.time === time &&
                            (theaterName
                              .toLowerCase()
                              .includes(s.venueId.toLowerCase()) ||
                              theaterById[s.venueId].toLowerCase() ===
                                theaterName.toLowerCase()),
                        );

                        // If still null, create a synthetic slotInfo from the parts
                        if (!slotInfo) {
                          slotInfo = {
                            id: slotId,
                            day,
                            time,
                            venueId:
                              theaterName.toLowerCase().includes("mall") ||
                              theaterName.toLowerCase().includes("vr")
                                ? "vr-mall"
                                : "eternity",
                          };
                        }
                      }
                    }

                    // If still null, just show a fallback card
                    if (!slotInfo) {
                      return (
                        <div
                          key={slotId}
                          className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 group transition-all duration-300"
                        >
                          <p className="text-black font-bold">{slotId}</p>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={slotId}
                        className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col gap-2 group hover:bg-black hover:border-black transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-black group-hover:text-white transition-colors">
                            {slotInfo.time}, {slotInfo.day}
                          </p>
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              slotInfo.venueId === "vr-mall"
                                ? "bg-green-500"
                                : "bg-red-500",
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-bold text-zinc-400 group-hover:text-white/40 transition-colors">
                            {theaterById[slotInfo.venueId] ||
                              slotInfo.venueId ||
                              "Global Screen"}
                          </p>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1">
                <p className="text-lg text-zinc-600 font-medium">
                  Want to change your mind or update your details?
                </p>
              </div>
              <Link href="/live-results">
                <Button className="h-16 px-10 rounded-2xl bg-black text-white text-lg font-bold hover:bg-zinc-800 hover:scale-105 transition-all shadow-xl shadow-black/10">
                  Live results page
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingVoter && isAuthenticated) {
    return (
      <div
        id="voting-form"
        className="px-16 font-mona-sans bg-grid-dashed min-h-[50vh] flex items-center justify-center"
      >
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div id="voting-form" className="px-16 font-mona-sans bg-grid-dashed">
      <div className="grid grid-cols-1 lg:grid-cols-12 pt-40 gap-16 items-start">
        {/* Left Side: Form Content */}
        <div className="xl:col-span-8 col-span-12 flex flex-col gap-10">
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
                          <p className="text-xl border-l-4 pl-4 font-bold text-black">
                            {day}
                          </p>
                        </div>

                        <div className="grid  mt-3 grid-cols-1 md:grid-cols-2 gap-12">
                          {THEATERS.map((theater) => (
                            <div
                              key={`${day}-${theater.id}`}
                              className="space-y-4"
                            >
                              <div className="flex items-end gap-3">
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
                                    const value = getSlotId(
                                      theater.id,
                                      time,
                                      day,
                                    );
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
                                        <p
                                          className={cn(
                                            "font-normal text-sm transition-colors",
                                            isSelected
                                              ? "text-white/60"
                                              : "text-zinc-500",
                                          )}
                                        >
                                          {liveVotesMap[value] || 0} voted for
                                          this
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
                                    Unfortunately, no showtimes are listed for{" "}
                                    {day} at {theater.name}
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
                          disabled={isCodeSent}
                        />
                      )}
                    />
                  </div>
                  {!isCodeSent && (
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
                </div>

                {isCodeSent && (
                  <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative flex-1 group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center h-full text-zinc-400 font-bold text-xs uppercase tracking-tighter">
                        Code
                      </div>
                      <Input
                        value={enteredCode}
                        onChange={(e) =>
                          setEnteredCode(e.target.value.toUpperCase())
                        }
                        className="pl-16 h-14 rounded-2xl border-zinc-200 bg-white focus-visible:bg-white transition-all text-base font-mono uppercase tracking-widest"
                        placeholder="••••••••"
                        maxLength={8}
                        autoFocus
                      />
                    </div>
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
                !isCodeSent || isSubmitting
                  ? "bg-zinc-200 text-zinc-500"
                  : "bg-black text-white hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99]",
              )}
              disabled={!isCodeSent || isSubmitting}
            >
              <FlipTextButton maxHeight="max-h-16">
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Submitting...
                  </div>
                ) : isCodeSent ? (
                  "Verify & Submit My Vote"
                ) : (
                  "Done, I wanna submit!"
                )}
              </FlipTextButton>
            </Button>
          </form>
        </div>

        {/* Right Side: Mascot Visual */}
        <div className="hidden xl:flex xl:col-span-4 flex-col h-full">
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

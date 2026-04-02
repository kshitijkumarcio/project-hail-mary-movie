"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { DAYS, THEATERS, SHOWTIMES_BY_THEATER } from "@/constants";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2 } from "lucide-react";
import FlipTextButton from "../ui/flip-text-button";

const formSchema = z.object({
  session: z
    .array(z.string())
    .min(1, "Please select at least one movie timing"),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdatePreferencesFormProps {
  initialData?: {
    session: string[];
  };
}

const UpdatePreferencesForm = ({
  initialData = {
    session: [],
  },
}: UpdatePreferencesFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Updated Preferences:", data);
    setIsSubmitting(false);
    setIsUpdated(true);
    toast.success("Preferences updated successfully!");
  };

  if (isUpdated) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
        <div className="relative w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 animate-in zoom-in duration-500" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          Preferences Updated!
        </h2>
        <p className="text-zinc-500 text-lg max-w-md">
          Your movie timings have been successfully updated. We've notified the
          team.
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
              (Update Choices{" "}
              <span className="inline-block -tracking-[4px] md:-tracking-[6px] translate-y-[-2px]">
                ------
              </span>
              )
            </p>
            <p className="text-zinc-600 mt-4 text-lg max-w-xl">
              Changed your mind? No worries, Ryland. Update your preferred
              screening slots here.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-8 mt-10"
          >
            {/* Session Selection */}
            <Field className="flex flex-col gap-4">
              <FieldLabel className="text-2xl flex flex-col items-start font-mona-sans font-bold text-black opacity-100">
                [01] &nbsp; Choose new movie slot(s)
                <p className="text-zinc-500 text-lg font-medium font-mona-sans max-w-xl">
                  You can select multiple slots. Your previous choices will be
                  replaced.
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
                        className="bg-zinc-100/50 rounded-[32px] px-8 py-8 flex flex-col gap-8 border border-zinc-200/50"
                      >
                        <div className="flex items-center gap-4">
                          <p className="text-xl border-l-4 border-black pl-4 font-bold text-black">
                            {day}
                          </p>
                        </div>

                        <div className="grid mt-3 grid-cols-1 md:grid-cols-2 gap-8">
                          {THEATERS.map((theater) => (
                            <div
                              key={`${day}-${theater.id}`}
                              className="space-y-4"
                            >
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-base text-zinc-800">
                                  {theater.name}
                                </p>
                                <div
                                  className={cn(
                                    "h-1 w-3",
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
                                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50 shadow-sm",
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
                                          />
                                          <p className="font-semibold text-sm">
                                            {time}
                                          </p>
                                        </div>
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
                                  <p className="text-zinc-400 text-xs py-2 italic font-mona-sans">
                                    No showtimes listed.
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

            <p className="text-2xl mt-12 flex flex-col items-start font-mona-sans font-bold text-black opacity-100">
              [02] &nbsp; Confirm changes
              <span className="text-zinc-500 mt-2 text-lg font-medium font-mona-sans max-w-xl">
                Ready to update your vote? This will overwrite your previous
                selections.
              </span>
            </p>

            <Button
              type="submit"
              size="lg"
              className={cn(
                "w-full h-16 text-xl font-bold rounded-2xl transition-all shadow-xl shadow-black/5 disabled:opacity-100 disabled:cursor-not-allowed disabled:pointer-events-auto",
                isSubmitting
                  ? "bg-zinc-200 text-zinc-500"
                  : "bg-black text-white hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99]",
              )}
              disabled={isSubmitting}
            >
              <FlipTextButton maxHeight="max-h-16">
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Syncing preferences...
                  </div>
                ) : (
                  "Confirm Update"
                )}
              </FlipTextButton>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePreferencesForm;

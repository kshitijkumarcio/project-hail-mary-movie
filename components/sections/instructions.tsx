"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

const Instructions = () => {
  const before = `before:absolute before:content-[" "] before:-left-0 before:-bottom-[1px] before:block before:w-[100%] before:h-[1px] before:bg-zinc-600 before:duration-1000 before:transition-all before:cubic-bezier(0.19, 1, 0.22, 1) before:scale-x-0 before:origin-left hover:before:scale-x-100 hover:before:delay-300`;

  const after = `after:absolute after:content-[" "] after:left-0 after:-bottom-[1px] after:block after:w-full after:h-[1px] after:bg-zinc-600 after:duration-1000 after:transition-all after:cubic-bezier(0.19, 1, 0.22, 1) after:origin-right after:delay-300 hover:after:scale-x-0 hover:after:delay-0`;

  return (
    <div className="px-16 py-6 bg-grid-dashed">
      <div className="space-y-4">
        <p className="text-black font-mona-sans text-[48px] md:text-[60px] leading-tight font-bold">
          (Alright{" "}
          <span className="inline-block -tracking-[4px] md:-tracking-[6px] translate-y-[-2px]">
            ------
          </span>
          )
        </p>
        <p className="text-zinc-600 xl:text-lg text-md max-w-xl">
          Let me just explain how this is gonna work, put on your game face.
        </p>
      </div>
      {/* Explanation */}
      <div className="flex justify-between items-start mt-20">
        <div className="flex flex-col flex-1 gap-4 ">
          <p className="text-2xl font-bold text-black opacity-100">
            [01] &nbsp; Choosing the movie slot(s)
          </p>
          <p className="text-zinc-600 xl:text-lg text-md mt-2 xl:max-w-xl max-w-[400px]">
            Choose the movie slot that works best for you. You can select
            multiple, which would mean, any of the slots you have selected,
            would work for you.
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-start items-start gap-4">
          <p className="text-2xl font-bold text-black opacity-100">
            [02] &nbsp; Knowing your data privacy
          </p>
          <p className="text-zinc-600 xl:text-lg text-md mt-2 xl:max-w-xl max-w-[400px]">
            Only Kshitij can see the name & phone that you provide here. To the
            rest, everyone appears as an anonymous voter, with no way of knowing
            anyone's name or phone number. No whatsapp group shenanigans.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-start mt-20">
        <div className="flex flex-col flex-1 gap-4 ">
          <p className="text-2xl font-bold text-black opacity-100">
            [03] &nbsp; You can invite anyone
          </p>
          <p className="text-zinc-600 xl:text-lg text-md mt-2 xl:max-w-xl max-w-[400px]">
            This is not limited to just Swapbook members, you can invite anyone
            you want to, regardless of if they are part of the bookclub or not. Just
            share this page with them.
          </p>
        </div>

        <div className="flex flex-col flex-1 gap-4 ">
          <p className="text-2xl font-bold text-black opacity-100">
            [04] &nbsp; Finalising the slot
          </p>
          <p className="text-zinc-600 xl:text-lg text-md mt-2 xl:max-w-xl max-w-[400px]">
            The slot having the maximum votes by the end of Friday will be
            finalised. People who did not choose the slot that has maximum
            votes, can either adjust, or, ask me to help them out with the same.
            I'll pair you with people who have similar preferences, so ya'll can
            plan that screening together. Everyone wins.
          </p>
        </div>
      </div>
      <div className="flex justify-between items-start mt-20">
        <div className="flex flex-1 flex-col justify-start items-start gap-4">
          <p className="text-2xl font-bold text-black opacity-100">
            [05] &nbsp; Booking & payments
          </p>
          <p className="text-zinc-600 xl:text-lg text-md mt-2 xl:max-w-xl max-w-[400px]">
            You can select and book your seat on your own, OR, you can ask me to
            take care of that too. Whatever is easier for you. (Just ask me for
            my UPI Id if you choose the later)
          </p>
        </div>

        <div className="flex flex-col flex-1 gap-4 ">
          <p className="text-2xl font-bold text-black opacity-100">
            [06] &nbsp; Anything else?
          </p>
          <div>
            <p className="text-zinc-600 inline text-lg mt-2 xl:max-w-xl max-w-[400px]">
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

      {/* <div className="mt-10">
        <button
          type="button"
          onClick={() =>
            toast.success("Toast is successful!", {
              style: {
                backgroundColor: "black",
                color: "white",
                borderRadius: 12,
                gap: 16,
              },
              icon: <CheckCircle2 className="text-green-600" />,
            })
          }
          className="active:bg-black/40 p-4 bg-black rounded-full cursor-pointer"
        >
          <p className="text-white">Send a dost</p>
        </button>
      </div> */}
    </div>
  );
};

export default Instructions;

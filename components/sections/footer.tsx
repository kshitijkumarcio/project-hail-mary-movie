import React from "react";
import Marquee from "../animating-wrappers/text-marquee";

const Footer = () => {
  return (
    <div className="relative p-16 pt-40 h-screen bg-grid-dashed overflow-x-clip">
      <div className="">
        <p className="text-black font-mona-sans text-[48px] md:text-[60px] leading-tight font-bold">
          (That's all{" "}
          <span className="inline-block -tracking-[4px] md:-tracking-[6px] translate-y-[-2px]">
            ------
          </span>
          )
        </p>
        <p className="text-zinc-600 text-lg max-w-2xl mt-5">
          What did you think about this landing page? I would be super eager to
          hear your thoughts.
        </p>
      </div>

      {/* marquee */}
      <div className="absolute bottom-8 left-0">
        <Marquee speed={0.02} direction={-1} reverse={true}>
          <div className="flex gap-x-20 font-semibold w-full">
            <p className="ml-20 text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Gotta love good book adaptations <span className="-tracking-[6px]">---------</span>)
            </p>
            <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Gotta love good book adaptations <span className="-tracking-[6px]">---------</span>)
            </p>{" "}
            <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Gotta love good book adaptations <span className="-tracking-[6px]">---------</span>)
            </p>{" "}
            <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Gotta love good book adaptations <span className="-tracking-[6px]">---------</span>)
            </p>
            <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Gotta love good book adaptations <span className="-tracking-[6px]">---------</span>)
            </p>
            <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Gotta love good book adaptations <span className="-tracking-[6px]">---------</span>)
            </p>
            <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Gotta love good book adaptations <span className="-tracking-[6px]">---------</span>)
            </p>
            <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Gotta love good book adaptations <span className="-tracking-[6px]">---------</span>)
            </p>
            <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Gotta love good book adaptations <span className="-tracking-[6px]">---------</span>)
            </p>
            <p className="text-black whitespace-nowrap font-mona-sans text-[60px]">
              (Gotta love good book adaptations <span className="-tracking-[6px]">---------</span>)
            </p>
          </div>
        </Marquee>
      </div>
    </div>
  );
};

export default Footer;

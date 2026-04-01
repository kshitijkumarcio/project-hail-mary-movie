import { images } from "@/constants";
import Image from "next/image";

const VotingForm = () => {
  return (
    <div id="voting-form" className="px-6 py-6">
      <div className="flex justify-between items-start">
        {/* form div */}
        <div className="">
          <p className="text-black font-mona-sans text-[60px]">
            (Alright <span className="-tracking-[6px]">------</span>)
          </p>


{/* create a simple form using zod, react hook forms, shadcn  */}
          <div className=""></div>
        </div>

        {/* stickers div */}
        <div className="">
          <div className="relative w-[200px] h-[180px]">
            <Image
              src={images.rocky}
              alt=""
              sizes="300px"
              fill
              className="object-center object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingForm;

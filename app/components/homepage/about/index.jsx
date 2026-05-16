// @flow strict

import { personalData } from "@/utils/data/personal-data";
import Image from "next/image";


function AboutSection() {
  return (
    <div id="about" className="relative my-12 lg:my-16">
      <div className="hidden lg:flex flex-col items-center absolute top-16 -right-8">
        <span className="bg-[#1a1443] w-fit text-white rotate-90 p-2 px-5 text-xl rounded-md">
          ABOUT ME
        </span>
        <span className="h-36 w-[2px] bg-[#1a1443]"></span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <div className="order-2 lg:order-1">
          <p className="mb-5 text-xl font-medium uppercase tracking-[0.18em] text-cyan-300">
            Who I am?
          </p>
          <p className="text-sm leading-7 text-slate-300 lg:text-lg lg:leading-8">
            {personalData.description}
          </p>
        </div>
        <div className="flex justify-center order-1 lg:order-2">
          <Image
            src={personalData.profile}
            width={280}
            height={280}
            alt="Hlaing Min Thein"
            className="cursor-pointer rounded-2xl border border-[#2a3f72] shadow-[0_16px_45px_rgba(10,18,45,0.55)] transition-all duration-700 grayscale hover:scale-105 hover:grayscale-0"
          />
        </div>
      </div>
    </div>
  );
};

export default AboutSection;

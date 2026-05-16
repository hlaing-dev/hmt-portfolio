// @flow strict

import { personalData } from "@/utils/data/personal-data";
import Image from "next/image";
import Link from "next/link";
import { BsGithub, BsLinkedin } from "react-icons/bs";
import { FaFacebook, FaLine } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import { RiContactsFill } from "react-icons/ri";

function HeroSection() {
  const topSkills = [
    "React",
    "Angular",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Express",
    "ASP.NET",
    "Laravel",
    "Golang",
  ];

  return (
    <section className="relative flex flex-col items-center justify-between py-4 lg:py-12">
      <Image
        src="/hero.svg"
        alt="Hero"
        width={1572}
        height={795}
        className="absolute -top-[98px] -z-10"
      />

      <div className="grid grid-cols-1 items-start gap-y-8 lg:grid-cols-2 lg:gap-12">
        <div className="order-2 flex flex-col items-start justify-center p-2 pb-20 md:pb-10 lg:order-1 lg:pt-10">
          <h1 className="text-3xl font-bold leading-10 text-white md:font-extrabold lg:text-[2.9rem] lg:leading-[3.7rem]">
            Building reliable products
            <br />
            with clean execution.
            <span className="mt-3 block text-lg text-[#b6c2e4] md:text-2xl">
              I am <span className="text-cyan-300">{personalData.name}</span>, a{" "}
              <span className="text-blue-300">{personalData.designation}</span>.
            </span>
          </h1>

          <div className="my-12 flex items-center gap-5">
            <Link
              href={personalData.github}
              target="_blank"
              className="text-pink-500 transition-all duration-300 hover:scale-125"
            >
              <BsGithub size={30} />
            </Link>
            <Link
              href={personalData.linkedIn}
              target="_blank"
              className="text-pink-500 transition-all duration-300 hover:scale-125"
            >
              <BsLinkedin size={30} />
            </Link>
            <Link
              href={personalData.facebook}
              target="_blank"
              className="text-pink-500 transition-all duration-300 hover:scale-125"
            >
              <FaFacebook size={30} />
            </Link>
            <Link
              href={personalData.line}
              target="_blank"
              className="text-pink-500 transition-all duration-300 hover:scale-125"
            >
              <FaLine size={30} />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="#contact"
              className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 p-[1px] transition-all duration-300 hover:opacity-90"
            >
              <button className="flex items-center gap-1 rounded-full border-none bg-[#09142f] px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-[#ffff] no-underline transition-all duration-200 ease-out hover:gap-3 md:px-8 md:py-4 md:text-sm md:font-semibold">
                <span>Contact me</span>
                <RiContactsFill size={16} />
              </button>
            </Link>

            <Link
              className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#1f2f57] to-[#33497f] px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-white no-underline transition-all duration-200 ease-out hover:gap-3 hover:text-white hover:no-underline md:px-8 md:py-4 md:text-sm md:font-semibold"
              role="button"
              href={personalData.resume}
            >
              <span>Get Resume</span>
              <MdDownload size={16} />
            </Link>
          </div>

          <div className="mt-6 w-full max-w-xl rounded-xl border border-[#27417a] bg-[#0a1838]/80 p-4 text-sm text-slate-200">
            <p><span className="text-cyan-300">Email:</span> {personalData.email}</p>
            <p className="mt-1"><span className="text-cyan-300">Phone:</span> {personalData.phone}</p>
            {personalData.address && (
              <p className="mt-1"><span className="text-cyan-300">Address:</span> {personalData.address}</p>
            )}
          </div>
        </div>

        <div className="relative order-1 rounded-lg border border-[#1b2c68a0] bg-gradient-to-r from-[#0d1224] to-[#0a0d37] lg:order-2">
          <div className="flex flex-row">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-pink-500 to-violet-600"></div>
            <div className="h-[1px] w-full bg-gradient-to-r from-violet-600 to-transparent"></div>
          </div>
          <div className="px-4 py-5 lg:px-8">
            <div className="flex flex-row space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-400"></div>
              <div className="h-3 w-3 rounded-full bg-orange-400"></div>
              <div className="h-3 w-3 rounded-full bg-green-200"></div>
            </div>
          </div>
          <div className="overflow-hidden border-t-[2px] border-indigo-900 px-4 py-4 lg:px-8 lg:py-8">
            <code className="font-mono text-xs md:text-sm lg:text-base">
              <div className="blink">
                <span className="mr-2 text-pink-500">const</span>
                <span className="mr-2 text-white">engineer</span>
                <span className="mr-2 text-pink-500">=</span>
                <span className="text-gray-400">{'{'}</span>
              </div>
              <div>
                <span className="ml-4 mr-2 text-white lg:ml-8">name:</span>
                <span className="text-gray-400">{`'`}</span>
                <span className="text-amber-300">{personalData.name}</span>
                <span className="text-gray-400">{`',`}</span>
              </div>
              <div className="ml-4 mr-2 lg:ml-8">
                <span className="text-white">skills:</span>
                <span className="text-gray-400">{`[`}</span>
                {topSkills.map((skill, index) => (
                  <span key={skill}>
                    <span className="text-gray-400">{`'`}</span>
                    <span className="text-amber-300">{skill}</span>
                    <span className="text-gray-400">{index < topSkills.length - 1 ? `', ` : `'`}</span>
                  </span>
                ))}
                <span className="text-gray-400">{`],`}</span>
              </div>
              <div>
                <span className="ml-4 mr-2 text-white lg:ml-8">experienceYears:</span>
                <span className="text-orange-400">7</span>
                <span className="text-gray-400">,</span>
              </div>
              <div>
                <span className="ml-4 mr-2 text-white lg:ml-8">focus:</span>
                <span className="text-amber-300">{`'Web, Mobile, Cloud'`}</span>
                <span className="text-gray-400">,</span>
              </div>
              {personalData.address && (
                <div>
                  <span className="ml-4 mr-2 text-white lg:ml-8">location:</span>
                  <span className="text-amber-300">{`'${personalData.address}'`}</span>
                  <span className="text-gray-400">,</span>
                </div>
              )}
              <div>
                <span className="ml-4 mr-2 text-white lg:ml-8">contact:</span>
                <span className="text-cyan-400">{`'${personalData.email}'`}</span>
              </div>
              <div>
                <span className="text-gray-400">{`};`}</span>
              </div>
            </code>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

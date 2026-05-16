// @flow strict

import Link from 'next/link';
import { MdOutlineOpenInNew } from 'react-icons/md';

function ProjectCard({ project }) {
  return (
    <div className="relative w-full rounded-2xl border border-[#22407a] bg-gradient-to-br from-[#0b1735] to-[#0b1129] p-5 lg:p-7 shadow-[0_12px_40px_rgba(1,8,28,0.45)]">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[40px] bg-gradient-to-br from-cyan-400/20 to-transparent" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-cyan-200 lg:text-2xl">{project.name}</h3>
        <span className="rounded-full border border-cyan-400/40 px-3 py-1 text-xs text-cyan-200">
          {project.role}
        </span>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-200 lg:text-base">
        {project.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {project.tools.map((tool) => (
          <span
            key={tool}
            className="rounded-md bg-[#1a2a52] px-2 py-1 text-xs text-slate-200"
          >
            {tool}
          </span>
        ))}
      </div>

      {project.demo && (
        <div className="mt-5">
          <Link
            href={project.demo}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-cyan-300 transition-colors hover:text-cyan-200"
          >
            Live project
            <MdOutlineOpenInNew />
          </Link>
        </div>
      )}
    </div>
  );
}

export default ProjectCard;

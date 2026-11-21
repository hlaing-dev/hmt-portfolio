import {
  education,
  experience,
  profile,
  projects,
  skills,
  stats,
  testimonial,
  type SectionId,
} from "@/content/profile";

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="tags">
      {items.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="bullets">
      {items.map((b) => (
        <li key={b}>{b}</li>
      ))}
    </ul>
  );
}

/**
 * Section bodies shared by the 3D panel and the classic page.
 * `expanded` opens every collapsible (used by the classic view).
 */
export function SectionContent({ id, expanded = false }: { id: SectionId; expanded?: boolean }) {
  switch (id) {
    case "about":
      return (
        <>
          <p className="lead">{profile.summary}</p>
          <dl className="facts">
            {stats.map((s) => (
              <div key={s.small}>
                <dt>{s.small}</dt>
                <dd>{s.big}</dd>
              </div>
            ))}
          </dl>
          <p className="subhead">Focus</p>
          <Tags items={profile.focus} />
          <blockquote className="quote">
            <p>“{testimonial.quote}”</p>
            <cite>{testimonial.source}</cite>
          </blockquote>
        </>
      );
    case "origin":
      return (
        <>
          <p className="lead">{education.note}</p>
          <article className="card">
            <p className="card__meta">{education.period}</p>
            <h3>{education.degree}</h3>
            <p>{education.school}</p>
          </article>
          <p className="subhead">Languages</p>
          <dl className="facts facts--two">
            {profile.languages.map((l) => (
              <div key={l.name}>
                <dt>{l.level}</dt>
                <dd>{l.name}</dd>
              </div>
            ))}
          </dl>
        </>
      );
    case "experience":
      return (
        <ol className="timeline">
          {experience.map((job, i) => (
            <li key={job.company}>
              <p className="card__meta">{job.period}</p>
              <h3>
                {job.role} <span className="at">at {job.company}</span>
              </h3>
              <p>{job.summary}</p>
              <details open={expanded || i === 0}>
                <summary>Highlights · {job.projects.join(", ")}</summary>
                <Bullets items={job.highlights} />
              </details>
              <Tags items={job.stack} />
            </li>
          ))}
        </ol>
      );
    case "skills":
      return (
        <div className="skill-groups">
          {skills.map((g) => (
            <section key={g.group}>
              <h3>{g.group}</h3>
              <Tags items={g.items} />
            </section>
          ))}
        </div>
      );
    case "projects":
      return (
        <div className="project-list">
          {projects.map((p, i) => (
            <article key={p.name} className="card">
              <div className="card__head">
                <h3>{p.name}</h3>
                {p.metric && <span className="badge">{p.metric}</span>}
              </div>
              <p className="card__meta">
                {p.company} · {p.role} · {p.period}
              </p>
              <p>{p.summary}</p>
              <details open={expanded || i === 0}>
                <summary>What I did</summary>
                <Bullets items={p.highlights} />
              </details>
              <Tags items={p.stack} />
              {p.href && (
                <a className="link" href={p.href} target="_blank" rel="noopener noreferrer">
                  Visit live project ↗
                </a>
              )}
            </article>
          ))}
        </div>
      );
    case "contact":
      return (
        <>
          <p className="lead">
            Open to roles and projects that fit my skills. The fastest way to reach me is email.
          </p>
          <a className="cta" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <ul className="socials">
            {profile.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="muted">Based in {profile.location}.</p>
        </>
      );
  }
}

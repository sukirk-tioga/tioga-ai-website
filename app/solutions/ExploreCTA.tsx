"use client";

type Props = { targetId: string; label: string };

/** Primary hub CTA: jumps to the workflow index (scroll offset handled by
 * .sh-index's scroll-margin-top in solutions-hub.css) and opens every
 * workflow family's <details> so the jump lands on visible workflow rows
 * instead of collapsed summaries. */
export default function ExploreCTA({ targetId, label }: Props) {
  return (
    <a
      className="sh-primary"
      href={`#${targetId}`}
      onClick={() => {
        const target = document.getElementById(targetId);
        target?.querySelectorAll("details").forEach((d) => {
          d.open = true;
        });
      }}
    >
      {label} <span aria-hidden="true">&nbsp;↓</span>
    </a>
  );
}

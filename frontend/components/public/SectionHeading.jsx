export default function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}) {
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7b8066]">
          {eyebrow}
        </p>
      )}

      <h2 className="mt-3 text-3xl font-bold leading-tight text-[#26332b] sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-base leading-7 text-[#687069] sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
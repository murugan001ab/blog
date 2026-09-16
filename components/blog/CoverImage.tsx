import Image from "next/image";

/**
 * Renders a post's featured image, or a generated monogram when there isn't
 * one yet — so a post without artwork still looks intentional.
 */
export function CoverImage({
  src,
  alt,
  title,
  priority = false,
  sizes = "(min-width: 768px) 50vw, 100vw",
  className = "",
}: {
  src: string | null;
  alt: string;
  title: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  if (src) {
    return (
      <div
        className={`relative overflow-hidden bg-zinc-100 ${className}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  // Deterministic hue from the title keeps the placeholder stable between
  // server render and hydration.
  const hue = [...title].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 32% 94%), hsl(${(hue + 40) % 360} 28% 88%))`,
      }}
      aria-hidden="true"
    >
      <span
        className="text-3xl font-semibold tracking-tight"
        style={{ color: `hsl(${hue} 30% 42%)` }}
      >
        {title.trim().charAt(0).toUpperCase() || "J"}
      </span>
    </div>
  );
}

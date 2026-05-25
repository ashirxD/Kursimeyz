interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  alt?: string;
}

export default function BrandLogo({
  className = "",
  imageClassName = "h-10 w-auto",
  alt = "Kursimeyz",
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center bg-transparent ${className}`}>
      <img
        src="/logo.png"
        alt={alt}
        className={`block max-w-full object-contain object-left bg-transparent ${imageClassName}`}
        decoding="async"
        draggable={false}
      />
    </span>
  );
}

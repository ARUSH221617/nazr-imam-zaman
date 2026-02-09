import Image from "next/image";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
}

export function SafeImage({ src, alt, className, width, height }: SafeImageProps) {
  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  return <img src={src} alt={alt} className={className} loading="lazy" />;
}


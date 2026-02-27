"use client";

import { useState } from "react";

/** Minimal 1x1 gray PNG data URL when no asset is available. */
const PLACEHOLDER_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

/**
 * Image for a class card.
 *
 * Until we have a real image library, we keep a neutral background and only
 * render an image when an explicit classImageUrl is provided.
 */
export function SportCardImage({
  sportType,
  classImageUrl,
  alt = "",
  className = "",
}: {
  sportType: string;
  classImageUrl?: string | null;
  alt?: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(classImageUrl ?? null);

  // `sportType` is reserved for future category-specific images.
  void sportType;

  if (!src) {
    return null;
  }

  const handleError = () => {
    setSrc(PLACEHOLDER_DATA_URL);
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={handleError}
    />
  );
}

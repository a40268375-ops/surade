import { useState, useEffect } from "react";
import { DEFAULT_AVATAR } from "../utils/constants";

const isBlockedOrInvalid = (url) => {
  if (!url || typeof url !== "string") return true;
  const lower = url.trim().toLowerCase();
  if (
    lower === "" ||
    lower === "null" ||
    lower === "undefined" ||
    lower.includes("ulastempat.com") ||
    lower.includes("lokasiterdekat.com")
  ) {
    return true;
  }
  return false;
};

export default function SafeImage({ 
  src, 
  alt = "", 
  className = "", 
  fallback = DEFAULT_AVATAR,
  onError = null,
  onLoad = null,
  ...props 
}) {
  const [hasError, setHasError] = useState(() => isBlockedOrInvalid(src));
  const [imgSrc, setImgSrc] = useState(() => (isBlockedOrInvalid(src) ? fallback : src));

  useEffect(() => {
    if (isBlockedOrInvalid(src)) {
      setHasError(true);
      setImgSrc(fallback);
    } else {
      setHasError(false);
      setImgSrc(src);
    }
  }, [src, fallback]);

  const handleError = (e) => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback);
    }
    if (onError) {
      try {
        onError(e);
      } catch (err) {}
    }
  };

  const handleLoad = (e) => {
    if (onLoad) {
      try {
        onLoad(e);
      } catch (err) {}
    }
  };

  return (
    <img
      src={imgSrc || fallback}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
      {...props}
    />
  );
}
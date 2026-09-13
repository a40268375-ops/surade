import { useState } from "react";
import { DEFAULT_AVATAR } from "../utils/constants";

export default function SafeImage({ 
  src, 
  alt, 
  className = "", 
  fallback = DEFAULT_AVATAR,
  onError = null,
  onLoad = null,
  ...props 
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e) => {
    console.warn("Image failed to load:", src);
    setHasError(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  const handleLoad = (e) => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad(e);
  };

  return (
    <img
      src={hasError ? fallback : src || fallback}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
}
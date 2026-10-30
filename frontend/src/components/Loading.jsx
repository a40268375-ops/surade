import React from "react";
import SuradeLoader from "./SuradeLoader";
import ArcDotsLoader from "./ArcDotsLoader";

export { default as ArcDotsLoader } from "./ArcDotsLoader";

/**
 * Loading.jsx
 * Unified loader powered by SuradeLoader and ArcDotsLoader.
 * 
 * Props:
 * - inline (boolean) default false
 * - text   (string)  default "Memuat..."
 * - subtext (string)
 * - fullscreen (boolean)
 * - variant ("arc" | "screen" | "section" | "inline")
 * - preset  ("emerald" | "chrome" | "gold" | "ocean" | "white")
 */
function Loading({
  inline = false,
  text = "Memuat...",
  subtext,
  fullscreen = false,
  variant,
  preset = "emerald",
  size,
  ...props
}) {
  if (variant === "arc" || props.arc) {
    if (fullscreen) {
      return (
        <SuradeLoader
          variant="screen"
          brandTitle="Surade.com"
          text={text}
          subtext={subtext}
          showBrand
          {...props}
        />
      );
    }

    return (
      <SuradeLoader
        variant={inline ? "inline" : "section"}
        size={size || (inline ? "sm" : "md")}
        text={text}
        subtext={subtext}
        {...props}
      />
    );
  }

  if (inline) {
    return <SuradeLoader variant="inline" text={text} size={size} {...props} />;
  }

  if (fullscreen) {
    return (
      <SuradeLoader
        variant="screen"
        text={text}
        subtext={subtext}
        showBrand
        size={size}
        {...props}
      />
    );
  }

  return (
    <SuradeLoader
      variant="section"
      text={text}
      subtext={subtext}
      showBrand
      size={size}
      {...props}
    />
  );
}

export default Loading;
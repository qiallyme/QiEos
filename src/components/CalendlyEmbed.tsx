import React from "react";

interface CalendlyEmbedProps {
  url: string;
  className?: string;
}

export default function CalendlyEmbed({
  url,
  className = "",
}: CalendlyEmbedProps) {
  return (
    <div
      className={`w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-xl ${className}`}
    >
      <iframe
        src={url}
        className="w-full h-full border-0"
        title="Schedule a meeting"
        loading="lazy"
        allow="camera; microphone; geolocation"
      />
    </div>
  );
}

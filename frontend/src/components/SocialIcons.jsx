/* SocialIcons.jsx - Official Brand Vector Logos */

export function WhatsappIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        d="M12.012 3.8a8.18 8.18 0 0 0-6.993 12.454l-.454 2.58 2.652-.792a8.18 8.18 0 1 0 4.795-14.242zm4.77 11.583c-.2.56-1.168 1.096-1.61 1.134-.44.038-.996.182-3.277-.732-2.748-1.098-4.52-3.896-4.656-4.077-.136-.182-1.112-1.48-1.112-2.822 0-1.342.7-2.002.952-2.274.252-.272.552-.34.736-.34.184 0 .368.002.528.01.172.008.404-.066.632.482.236.574.804 1.96.874 2.104.07.144.116.312.022.496-.094.184-.142.298-.284.464-.142.166-.298.372-.426.5-.14.14-.286.294-.124.572.162.278.722 1.192 1.554 1.932 1.07.954 1.972 1.25 2.25 1.39.278.14.44.116.602-.07.162-.186.696-.812.882-1.09.186-.278.372-.232.624-.138.252.094 1.6.754 1.874.892.274.138.458.206.528.322.07.116.07.674-.13 1.234z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function InstagramIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <radialGradient id="rg-ig-social" cx="0.3" cy="1" r="1.15">
          <stop offset="0%" stopColor="#ffd600" />
          <stop offset="25%" stopColor="#ff0169" />
          <stop offset="50%" stopColor="#d300c5" />
          <stop offset="100%" stopColor="#7638fa" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#rg-ig-social)" />
      <path
        d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.25-8.8a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function FacebookIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M15.5 12h-2.5v9h-3.5v-9H7.5V9h2V7.2C9.5 5.1 10.7 4 13.1 4c1.1 0 2.1.1 2.4.1v2.8h-1.6c-1.1 0-1.4.5-1.4 1.3V9h3l-.5 3z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function TwitterIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#000000" />
      <path
        d="M14.25 10.15L18.7 5h-1.05l-3.86 4.41L10.7 5H7.15l4.67 6.66L7.15 17h1.05l4.08-4.66L15.5 17h3.55l-4.8-6.85zm-1.44 1.65l-.47-.66-3.75-5.26h1.62l3.02 4.23.47.66 3.93 5.51h-1.62l-3.2-4.48z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function YoutubeIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="24" height="24" rx="6" fill="#FF0000" />
      <path d="M9.6 15.5l6.3-3.5-6.3-3.5v7z" fill="#FFFFFF" />
    </svg>
  );
}

export function LinkedinIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="24" height="24" rx="5" fill="#0A66C2" />
      <path
        d="M5.5 8.5h3v10h-3v-10zm1.5-4.2a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4zm5.5 4.2h2.9v1.4h.1c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.6 2 3.6 4.7v5.5h-3v-4.9c0-1.2 0-2.7-1.7-2.7-1.7 0-1.9 1.3-1.9 2.6v5h-3v-10z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

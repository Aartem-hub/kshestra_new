import React, { useState } from 'react';

interface KshestraLogoProps {
  className?: string;
  size?: number | string;
  color?: string;
  variant?: 'solid' | 'gold' | 'terracotta' | 'white';
  preferAssetImage?: boolean;
}

export const KshestraLogo: React.FC<KshestraLogoProps> = ({
  className = 'w-8 h-8',
  size,
  color,
  variant = 'terracotta',
  preferAssetImage = true
}) => {
  const [imageError, setImageError] = useState(false);

  // If user requested direct PNG asset and it hasn't failed to load
  if (preferAssetImage && !imageError) {
    const style = size ? { width: size, height: size } : undefined;
    return (
      <img
        src="/assets/Kshestra Logo PNG.png"
        alt="Kshestra Foundation Logo"
        onError={() => setImageError(true)}
        className={`inline-block shrink-0 object-contain ${className}`}
        style={style}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Determine fill color based on variant if explicit color is not provided
  let fillColor = color;
  if (!fillColor) {
    switch (variant) {
      case 'gold':
        fillColor = '#8A8E3E';
        break;
      case 'white':
        fillColor = '#FFF5E9';
        break;
      case 'solid':
        fillColor = '#3A2B27';
        break;
      case 'terracotta':
      default:
        fillColor = '#5C1D24';
        break;
    }
  }

  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 transition-transform ${className}`}
      style={style}
      aria-label="Kshestra Logo"
    >
      <g fill={fillColor}>
        {/* MASTER VECTOR DEFINITION: Pristine Bankura Stallion 'K' Monogram */}
        <g id="kshestra-monogram">
          {/* Main horse torso, base, and junction */}
          <path
            d="M 148 141 
               L 132 141 
               L 144 168 
               L 148 168 
               L 148 186 
               C 148 198 153 206 169 206 
               C 171 195 171 187 171 178 
               C 171 160 180 152 190 152 
               C 192 176 181 206 162 226 
               C 148 242 148 265 148 288 
               L 148 375 
               L 233 375 
               L 233 255 
               L 242 255 
               L 242 312 
               C 255 355 305 375 368 375 
               L 368 276 
               C 350 280 340 282 320 282 
               C 272 282 245 255 242 255 
               L 242 255 
               L 233 255 
               L 233 141 
               C 205 141 180 141 148 141 Z"
          />
          
          {/* Eye of the Bankura Stallion */}
          <circle cx="158" cy="186" r="4.5" fill={variant === 'white' ? '#3A2B27' : '#FFF5E9'} />

          {/* 3 Feathers / Wings Slanted Upward Right */}
          {/* Feather 1 (Inner) */}
          <polygon points="270,141 245,255 264,255 289,141" />
          
          {/* Feather 2 (Middle) */}
          <polygon points="314,141 273,255 292,255 333,141" />
          
          {/* Feather 3 (Outer Top Right) */}
          <polygon points="368,141 321,270 341,270 368,200" />
        </g>
      </g>
    </svg>
  );
};


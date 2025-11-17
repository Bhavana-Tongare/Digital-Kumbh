import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'dark' | 'light';
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', variant = 'dark' }) => {
  let sizeClass, imageSize;
  switch (size) {
     case 'small':
      sizeClass = 'text-lg md:text-xl';
      imageSize = 'h-16 w-16'; // ⬆️ Increased from 7x7 → 10x10
      break;
    case 'large':
      sizeClass = 'text-3xl md:text-4xl';
      imageSize = 'h-16 w-16'; // ⬆️ Increased from 10x10 → 16x16
      break;
    default:
      sizeClass = 'text-2xl md:text-3xl';
      imageSize = 'h-14 w-14'; // ⬆️ Increased from 8x8 → 12x12
  }

  return (
    <div className="flex items-center gap-2">
      {/* 🔹 Replace with your logo image */}
      <img
        src="logo.png"  // ← Path to your logo image (you can adjust)
        alt="Digital Kumbh Logo"
        className={`${imageSize} rounded-lg object-contain`}
      />

      <h1
        className={`font-bold ${sizeClass} ${
          variant === 'light' ? 'text-white' : 'text-pilgrim-brown'
        }`}
      >
        <span className="text-pilgrim-orange">Digital</span>Kumbh
      </h1>
    </div>
  );
};

export default Logo;

import React from 'react';

interface BrandLogoProps {
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ onClick, className }) => {
  return (
    <a
      href="#/"
      onClick={onClick}
      className={`flex items-center group ${className || ''}`}
      aria-label="MeeChain Home"
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-meebot-primary transition-transform duration-300 group-hover:rotate-12"
      >
        <path
          d="M6 34V12C6 8.68629 8.68629 6 12 6H28C31.3137 6 34 8.68629 34 12V34L28 28L20 34L12 28L6 34Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="18" r="3" fill="#00CFE8" />
        <circle cx="26" cy="18" r="3" fill="#00CFE8" />
      </svg>
      <h1 className="ml-3 text-2xl font-bold text-white transition-colors duration-300 group-hover:text-meebot-accent">
        MeeChain
      </h1>
    </a>
  );
};

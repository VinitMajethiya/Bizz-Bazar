import React from 'react';
import { Link } from 'react-router-dom';
import logoPng from '@/assets/logo.png';

interface LogoProps {
  className?: string;
  variant?: 'wordmark' | 'icon' | 'full';
  linkTo?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'full',
  linkTo = '/',
}) => {
  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {variant !== 'wordmark' && (
        <img
          src={logoPng}
          alt="By Raya.co logo"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-line/60 shadow-xs flex-shrink-0"
          width="36"
          height="36"
        />
      )}
      {variant !== 'icon' && (
        <span className="font-sans text-sm sm:text-base font-normal tracking-[0.2em] uppercase text-ink">
          By Raya<span className="text-muted lowercase tracking-normal">.co</span>
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="focus-visible:ring-1 focus-visible:ring-accent rounded-sm inline-block outline-none"
        aria-label="By Raya.co Home"
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;


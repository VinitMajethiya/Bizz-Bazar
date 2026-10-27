import React from 'react';
import { Link } from 'react-router-dom';
import logoSvg from '@/assets/logo.svg';

interface LogoProps {
  className?: string;
  variant?: 'wordmark' | 'icon' | 'full';
  linkTo?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'wordmark',
  linkTo = '/',
}) => {
  const content = (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {variant !== 'wordmark' && (
        <img
          src={logoSvg}
          alt="By Raya.co logo mark"
          className="h-8 w-8 object-contain"
          width="32"
          height="32"
        />
      )}
      {variant !== 'icon' && (
        <span className="font-sans text-base font-normal tracking-[0.2em] uppercase text-ink">
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


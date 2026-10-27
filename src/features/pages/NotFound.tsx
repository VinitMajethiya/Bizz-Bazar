import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-site mx-auto px-5 md:px-8 py-20 text-center">
      <div className="max-w-md mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest text-muted">Error 404</span>
        <h1 className="text-3xl font-light text-ink">Page Not Found</h1>
        <p className="text-xs text-muted leading-relaxed">
          The piece or page you are looking for does not exist or has moved.
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-ink text-bg text-xs uppercase tracking-wider font-medium rounded-ui hover:bg-accent transition-colors"
          >
            Return to Catalogue
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


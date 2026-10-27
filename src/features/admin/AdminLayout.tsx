import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Inbox,
  Star,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-line bg-surface p-6 sticky top-0 h-screen justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest font-medium text-ink">
              Admin Portal
            </span>
            <ThemeToggle />
          </div>

          <nav className="flex flex-col gap-1.5 text-xs font-medium" aria-label="Admin Navigation">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-ui transition-colors ${
                  isActive
                    ? 'bg-ink text-bg'
                    : 'text-ink hover:bg-line/60'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-ui transition-colors ${
                  isActive
                    ? 'bg-ink text-bg'
                    : 'text-ink hover:bg-line/60'
                }`
              }
            >
              <Package className="w-4 h-4" />
              <span>Products</span>
            </NavLink>
            <NavLink
              to="/admin/enquiries"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-ui transition-colors ${
                  isActive
                    ? 'bg-ink text-bg'
                    : 'text-ink hover:bg-line/60'
                }`
              }
            >
              <Inbox className="w-4 h-4" />
              <span>Enquiries &amp; Orders</span>
            </NavLink>
            <NavLink
              to="/admin/reviews"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-ui transition-colors ${
                  isActive
                    ? 'bg-ink text-bg'
                    : 'text-ink hover:bg-line/60'
                }`
              }
            >
              <Star className="w-4 h-4" />
              <span>Reviews</span>
            </NavLink>
            <NavLink
              to="/admin/deals"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-ui transition-colors ${
                  isActive
                    ? 'bg-ink text-bg'
                    : 'text-ink hover:bg-line/60'
                }`
              }
            >
              <Package className="w-4 h-4" />
              <span>Deals</span>
            </NavLink>
            <NavLink
              to="/admin/content"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-ui transition-colors ${
                  isActive
                    ? 'bg-ink text-bg'
                    : 'text-ink hover:bg-line/60'
                }`
              }
            >
              <Settings className="w-4 h-4" />
              <span>Content &amp; Settings</span>
            </NavLink>
          </nav>
        </div>

        <div className="space-y-3 pt-6 border-t border-line text-xs">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted hover:text-ink transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Storefront</span>
          </Link>
          <Link
            to="/admin/login"
            className="flex items-center gap-2 text-muted hover:text-danger transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-5 md:p-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Tab Bar (Overview, Products, Enquiries, Reviews, More) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg border-t border-line flex items-center justify-around h-16 px-2"
        aria-label="Mobile Admin Navigation"
      >
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full text-[10px] ${
              isActive ? 'text-accent font-medium' : 'text-muted'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Overview</span>
        </NavLink>
        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full text-[10px] ${
              isActive ? 'text-accent font-medium' : 'text-muted'
            }`
          }
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Products</span>
        </NavLink>
        <NavLink
          to="/admin/enquiries"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full text-[10px] ${
              isActive ? 'text-accent font-medium' : 'text-muted'
            }`
          }
        >
          <Inbox className="w-5 h-5 mb-0.5" />
          <span>Enquiries</span>
        </NavLink>
        <NavLink
          to="/admin/reviews"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full text-[10px] ${
              isActive ? 'text-accent font-medium' : 'text-muted'
            }`
          }
        >
          <Star className="w-5 h-5 mb-0.5" />
          <span>Reviews</span>
        </NavLink>
        <NavLink
          to="/admin/content"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full text-[10px] ${
              isActive ? 'text-accent font-medium' : 'text-muted'
            }`
          }
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AdminLayout;


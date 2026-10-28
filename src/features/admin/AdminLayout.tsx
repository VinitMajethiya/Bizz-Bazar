import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Inbox,
  Star,
  Settings,
  LogOut,
  ExternalLink,
  MoreHorizontal,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { signOutAdmin } from '../../lib/api/auth';
import { useToastStore } from '@/components/ui/toastStore';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  const handleSignOut = async () => {
    try {
      await signOutAdmin();
      showToast('Signed out', 'info');
      navigate('/admin/login', { replace: true });
    } catch {
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-line bg-surface p-6 sticky top-0 h-screen justify-between flex-shrink-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-ink">
              By Raya Admin
            </span>
            <ThemeToggle />
          </div>

          <nav className="flex flex-col gap-1 text-xs" aria-label="Admin Navigation">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-none transition-colors ${
                  isActive ? 'bg-ink text-bg font-normal' : 'text-muted hover:text-ink hover:bg-line/50 font-light'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4 stroke-[1.5]" />
              <span>Overview</span>
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-none transition-colors ${
                  isActive ? 'bg-ink text-bg font-normal' : 'text-muted hover:text-ink hover:bg-line/50 font-light'
                }`
              }
            >
              <Package className="w-4 h-4 stroke-[1.5]" />
              <span>Products</span>
            </NavLink>
            <NavLink
              to="/admin/enquiries"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-none transition-colors ${
                  isActive ? 'bg-ink text-bg font-normal' : 'text-muted hover:text-ink hover:bg-line/50 font-light'
                }`
              }
            >
              <Inbox className="w-4 h-4 stroke-[1.5]" />
              <span>Enquiries &amp; Orders</span>
            </NavLink>
            <NavLink
              to="/admin/reviews"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-none transition-colors ${
                  isActive ? 'bg-ink text-bg font-normal' : 'text-muted hover:text-ink hover:bg-line/50 font-light'
                }`
              }
            >
              <Star className="w-4 h-4 stroke-[1.5]" />
              <span>Reviews</span>
            </NavLink>
            <NavLink
              to="/admin/content"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-none transition-colors ${
                  isActive ? 'bg-ink text-bg font-normal' : 'text-muted hover:text-ink hover:bg-line/50 font-light'
                }`
              }
            >
              <Settings className="w-4 h-4 stroke-[1.5]" />
              <span>Content &amp; Settings</span>
            </NavLink>
          </nav>
        </div>

        <div className="space-y-3 pt-6 border-t border-line text-xs font-light">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted hover:text-ink transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>View Storefront</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 text-muted hover:text-red-500 transition-colors w-full text-left"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Mobile Bottom Tab Bar (Overview, Products, Enquiries, Reviews, More) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg/95 backdrop-blur-md border-t border-line flex items-center justify-around h-16 px-1 safe-area-pb"
        aria-label="Mobile Admin Navigation"
      >
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full text-[10px] transition-colors ${
              isActive ? 'text-ink font-medium' : 'text-muted font-light'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5 stroke-[1.5]" />
          <span>Overview</span>
        </NavLink>
        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full text-[10px] transition-colors ${
              isActive ? 'text-ink font-medium' : 'text-muted font-light'
            }`
          }
        >
          <Package className="w-5 h-5 mb-0.5 stroke-[1.5]" />
          <span>Products</span>
        </NavLink>
        <NavLink
          to="/admin/enquiries"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full text-[10px] transition-colors ${
              isActive ? 'text-ink font-medium' : 'text-muted font-light'
            }`
          }
        >
          <Inbox className="w-5 h-5 mb-0.5 stroke-[1.5]" />
          <span>Enquiries</span>
        </NavLink>
        <NavLink
          to="/admin/reviews"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full text-[10px] transition-colors ${
              isActive ? 'text-ink font-medium' : 'text-muted font-light'
            }`
          }
        >
          <Star className="w-5 h-5 mb-0.5 stroke-[1.5]" />
          <span>Reviews</span>
        </NavLink>
        <NavLink
          to="/admin/more"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full text-[10px] transition-colors ${
              isActive ? 'text-ink font-medium' : 'text-muted font-light'
            }`
          }
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5 stroke-[1.5]" />
          <span>More</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AdminLayout;

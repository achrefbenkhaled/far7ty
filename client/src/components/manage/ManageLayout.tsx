import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Plus, LayoutDashboard } from 'lucide-react';
import { useManageAuth } from '../../context/ManageAuthContext';

export function ManageLayout() {
  const { logout } = useManageAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/manage/login', { replace: true }); };
  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#2d241e]">
      <header className="border-b border-[#e6d9cc] bg-[#fffdf9]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/manage" className="text-xl font-black tracking-[0.28em]">INVLY <span className="ml-2 text-xs font-medium tracking-normal text-[#8a6a4a]">MANAGE</span></Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/manage" className="inline-flex items-center gap-2 rounded-full px-4 py-2 hover:bg-[#f8f1ea]"><LayoutDashboard className="h-4 w-4" />Dashboard</Link>
            <Link to="/manage/invitations/new" className="inline-flex items-center gap-2 rounded-full bg-[#2d241e] px-4 py-2 font-semibold text-white"><Plus className="h-4 w-4" />New invitation</Link>
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-[#d8c4a8] px-4 py-2"><LogOut className="h-4 w-4" />Logout</button>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

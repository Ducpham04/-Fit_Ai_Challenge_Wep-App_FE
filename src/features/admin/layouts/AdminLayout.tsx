import { useState } from "react";
import { Button } from "@/components_1/ui/button";
import {
  Users,
  Dumbbell,
  CreditCard,
  Gift,
  BookOpen,
  Apple,
  Settings as SettingsIcon,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export function AdminLayout({
  children,
  currentPage,
  onPageChange,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "users", label: "Users", icon: <Users size={20} /> },
    { id: "challenges", label: "Challenges", icon: <Dumbbell size={20} /> },
    { id: "transactions", label: "Transactions", icon: <CreditCard size={20} /> },
    { id: "rewards", label: "Rewards", icon: <Gift size={20} /> },
    { id: "training-plans", label: "Training Plans", icon: <BookOpen size={20} /> },
    { id: "meals", label: "Meals", icon: <Apple size={20} /> },
    { id: "foods", label: "Foods", icon: <Apple size={20} /> },
  ];

  return (
    <div className="flex bg-gray-100">
      {/* Sidebar - Fixed */}
      <aside
        className={`fixed left-0 top-0 h-screen ${
          sidebarOpen ? "w-[220px]" : "w-[70px]"
        } bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col border-r border-gray-800 z-40`}
      >
        {/* Header + Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <LayoutDashboard size={20} />
              </div>
              <span className="font-bold text-lg">FitAdmin</span>
            </div>
          )}

          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8 p-0 hover:bg-gray-800"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-2 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`
                  w-full flex items-center gap-3 h-10 rounded-lg px-3 text-sm transition-colors
                  ${isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"}
                `}
              >
                {/* Icon */}
                <div className="flex-shrink-0 flex justify-center items-center w-6">
                  {item.icon}
                </div>

                {/* Label */}
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Settings at Bottom */}
        <div className="p-2 border-t border-gray-800">
          <button
            className="w-full flex items-center gap-3 h-10 rounded-lg px-3 text-sm transition-colors text-gray-300 hover:bg-gray-800"
          >
            <SettingsIcon size={20} />
            {sidebarOpen && <span>Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main Content - Offset by sidebar width */}
      <main className={`flex-1 overflow-auto transition-all duration-300 ${
        sidebarOpen ? "ml-[220px]" : "ml-[70px]"
      }`}>
        {children}
      </main>
    </div>
  );
}

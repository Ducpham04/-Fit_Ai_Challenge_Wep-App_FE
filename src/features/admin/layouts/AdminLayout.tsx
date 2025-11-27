import { useState, ReactNode } from "react";
import { SimpleButton as Button } from "@/components_1/ui/simple-button";
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
  Target,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

export function AdminLayout({ children, currentPage, onPageChange }: AdminLayoutProps) {
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
    { id: "goals", label: "Goals", icon: <Target size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-40
          bg-gray-900 text-white border-r border-gray-800
          transition-all duration-300 ease-in-out
          flex flex-col
          ${sidebarOpen ? "w-[220px]" : "w-[70px]"}
        `}
      >
        {/* Logo + Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <LayoutDashboard size={20} />
              </div>
              <span className="font-bold text-lg">FitAdmin</span>
            </div>
          )}

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
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`
                  w-full flex items-center gap-3 h-10 rounded-lg px-3 text-sm
                  transition-colors
                  ${active ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"}
                `}
              >
                <div className="w-6 flex justify-center">{item.icon}</div>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Settings */}
        <div className="p-2 border-t border-gray-800">
          <button className="w-full flex items-center gap-3 h-10 rounded-lg px-3 text-sm text-gray-300 hover:bg-gray-800">
            <SettingsIcon size={20} />
            {sidebarOpen && <span>Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`
          flex-1 relative transition-all duration-300 min-h-screen
          ${sidebarOpen ? "ml-[220px]" : "ml-[70px]"}
        `}
      >
        {children}
      </main>
    </div>
  );
}

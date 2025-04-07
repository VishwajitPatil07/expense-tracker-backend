import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  BarChartHorizontal, 
  UserCog, 
  Settings, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";

type MenuItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

export default function Sidebar() {
  const { logoutMutation } = useAuth();
  const [location] = useLocation();
  
  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="text-xl mr-3" />,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: <Receipt className="text-xl mr-3" />,
    },
    {
      name: "Budget",
      path: "/budget",
      icon: <PieChart className="text-xl mr-3" />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChartHorizontal className="text-xl mr-3" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <UserCog className="text-xl mr-3" />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="text-xl mr-3" />,
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="fixed hidden lg:block inset-y-0 left-0 w-64 bg-white border-r border-neutral-200 z-20 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-neutral-900">Spendyzer</h1>
      </div>
      <nav className="mt-2 px-4 space-y-1">
        {menuItems.map((item) => (
          <a
            key={item.name}
            href={item.path}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
              location === item.path
                ? "bg-primary-50 text-primary border-r-2 border-primary"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {item.icon}
            {item.name}
          </a>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full border-t border-neutral-200 p-4">
        <Button
          variant="ghost"
          className="flex w-full items-center px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="text-xl mr-3" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </aside>
  );
}

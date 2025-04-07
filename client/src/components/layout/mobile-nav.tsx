import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Receipt, 
  PlusCircle, 
  PieChart, 
  BarChart 
} from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();
  
  const navItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard className="text-xl" /> },
    { name: "Transactions", path: "/transactions", icon: <Receipt className="text-xl" /> },
    { name: "Add", path: "#", icon: <PlusCircle className="text-3xl text-primary" /> },
    { name: "Budget", path: "/budget", icon: <PieChart className="text-xl" /> },
    { name: "Reports", path: "/reports", icon: <BarChart className="text-xl" /> },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 z-20 w-full border-t border-neutral-200 bg-white">
      <div className="grid h-16 grid-cols-5">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.path}
            className={`inline-flex flex-col items-center justify-center font-medium ${
              location === item.path ? "text-primary" : "text-neutral-600"
            }`}
          >
            {item.icon}
            <span className="text-xs">{item.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

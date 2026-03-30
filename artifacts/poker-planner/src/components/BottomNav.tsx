import { Link, useLocation } from "wouter";
import { CalendarDays, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const tabs = [
    { href: "/", label: "Schedule", icon: CalendarDays },
    { href: "/my-list", label: "My List", icon: Star },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="flex items-center p-1.5 bg-card/90 backdrop-blur-xl border border-border rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          {tabs.map((tab) => {
            const isActive = location === tab.href;
            return (
              <Link key={tab.href} href={tab.href} className="flex-1">
                <div
                  className={cn(
                    "flex flex-col items-center justify-center py-2.5 rounded-full transition-all duration-300 relative overflow-hidden",
                    isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-primary rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]" />
                  )}
                  <tab.icon className={cn("w-5 h-5 relative z-10 mb-1", isActive ? "stroke-[2.5]" : "stroke-2")} />
                  <span className="text-[10px] font-bold uppercase tracking-wider relative z-10">
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

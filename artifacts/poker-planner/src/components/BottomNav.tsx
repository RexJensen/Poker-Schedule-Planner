import { Link, useLocation } from "wouter";
import { CalendarDays, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMyList } from "@workspace/api-client-react";

export function BottomNav() {
  const [location] = useLocation();
  const { data: myListIds = [] } = useGetMyList();
  const savedCount = myListIds.length;

  const tabs = [
    { href: "/", label: "Schedule", icon: CalendarDays, badge: 0 },
    { href: "/my-list", label: "My List", icon: Star, badge: savedCount },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-3 pointer-events-none">
      <div className="max-w-sm mx-auto pointer-events-auto">
        <div className="flex items-center p-1 bg-card/95 backdrop-blur-xl border border-border/60 rounded-full shadow-[0_4px_24px_rgb(0,0,0,0.5)]">
          {tabs.map((tab) => {
            const isActive = location === tab.href;
            return (
              <Link key={tab.href} href={tab.href} className="flex-1">
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center py-2 rounded-full transition-all duration-200",
                    isActive ? "text-primary-foreground" : "text-muted-foreground active:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-primary rounded-full" />
                  )}
                  <div className="relative z-10 flex items-center gap-1.5">
                    <tab.icon className={cn("w-4 h-4", isActive ? "stroke-[2.5]" : "stroke-2")} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {tab.label}
                    </span>
                    {tab.badge > 0 && !isActive && (
                      <span className="w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                        {tab.badge > 99 ? "99" : tab.badge}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

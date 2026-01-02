import React, { useState, useEffect, useMemo } from "react";
import { AlertTriangle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface AlertItem {
  name: string;
  alertColor: string;
}

const AnimatedAlertList: React.FC<{ items: AlertItem[] }> = ({ items }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // 1. Debounce Logic (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 2. Filter Logic
  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [debouncedSearch, items]);

  return (
    <div className="flex flex-col w-full p-6 h-full overflow-scroll font-sanss">
      {/* 3. Animation Styles */}
      <style>{`
        @keyframes slideInUp {
          from { 
            opacity: 0; 
            transform: translateY(15px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .item-animate {
          animation: slideInUp 0.4s ease-out forwards;
        }
      `}</style>

      {/* Search Input - Rounded, Solid Border */}
      <div className="relative mb-4 group">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
          strokeWidth={1}
          size={26}
        />
        <Input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-11 rounded-md border border-slate-300 focus-visible:ring-0 focus-visible:border-blue-500 transition-all h-10"
        />
      </div>

      {/* 4. Vertical List */}
      <ul className="flex flex-col gap-2">
        {isLoading
          ? // 6 Row Skeleton Loader
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))
          : filteredItems.map((item, index) => (
              <li
                key={`${item.name}-${debouncedSearch}`} // Key changes on search to re-trigger animation
                className="item-animate flex items-center text-md font-light ps-1 py-1"
                style={{
                  fontFamily: "Roboto, sans-serif",
                  // Creates a staggered entry effect
                  animationDelay: `${index * 0.05}s`,
                  opacity: 0, // Start invisible until animation kicks in
                }}
              >
                {/* Custom Alert Icon */}
                <div className="mr-3">
                  <AlertTriangle
                    size={24}
                    stroke="white"
                    fill={item.alertColor} // The triangle interior
                    fillOpacity={0.4} // 40% opacity on the fill
                  />
                </div>
                <span className="text-gray-800 break-all leading-tight">
                  {item.name}
                </span>
              </li>
            ))}

        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center text-gray-400 py-10 font-light">
            No matching items found.
          </div>
        )}
      </ul>
    </div>
  );
};

export default AnimatedAlertList;

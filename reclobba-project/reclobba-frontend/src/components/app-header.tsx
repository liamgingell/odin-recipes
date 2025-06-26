import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function AppHeader() {
  const [location] = useLocation();
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    queryFn: () => api.getUser(),
  });

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-dark-grey border-b border-light-grey sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg font-extrabold bg-purple-main">
              RC
            </div>
            <span className="text-xl font-bold text-white">ReClobba</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/wardrobe" className={`font-medium transition-colors ${
              isActive("/wardrobe") || isActive("/")
                ? "text-purple-main border-b-2 border-purple-main pb-1"
                : "text-text-gray hover:text-white"
            }`}>
              Wardrobe
            </Link>
            <Link href="/outfits" className={`font-medium transition-colors ${
              isActive("/outfits")
                ? "text-purple-main border-b-2 border-purple-main pb-1"
                : "text-text-gray hover:text-white"
            }`}>
              Outfits
            </Link>
            <Link href="/suggestions" className={`font-medium transition-colors ${
              isActive("/suggestions")
                ? "text-purple-main border-b-2 border-purple-main pb-1"
                : "text-text-gray hover:text-white"
            }`}>
              Suggestions
            </Link>
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">{user?.name || "Loading..."}</p>
              <p className="text-xs text-text-gray">{user?.location || "Location"}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-main to-purple-light flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || "U"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

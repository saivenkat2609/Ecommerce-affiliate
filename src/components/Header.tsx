import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  // Update search query from URL when on search page
  useEffect(() => {
    if (location.pathname === '/search') {
      const queryFromUrl = searchParams.get('q') || '';
      setSearchQuery(queryFromUrl);
    }
  }, [location.pathname, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Clear search when navigating away from search page
  useEffect(() => {
    if (location.pathname !== '/search') {
      setSearchQuery('');
    }
  }, [location.pathname]);

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/">
              <h1 className="text-2xl font-bold text-primary cursor-pointer hover:text-primary/80 transition-colors">
                ShopFlow
              </h1>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="pl-10 pr-16 py-2 w-full"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                Search
              </Button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <User className="h-4 w-4 mr-2" />
              Account
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Cart</span>
              <span className="absolute -top-1 -right-1 bg-deal text-deal-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 mt-3 pt-3 border-t border-border">
          <Link to="/category/electronics">
            <Button variant="ghost" size="sm" className="hover:text-primary transition-colors">
              Electronics
            </Button>
          </Link>
          <Link to="/category/fashion">
            <Button variant="ghost" size="sm" className="hover:text-primary transition-colors">
              Fashion
            </Button>
          </Link>
          <Link to="/category/home-garden">
            <Button variant="ghost" size="sm" className="hover:text-primary transition-colors">
              Home & Garden
            </Button>
          </Link>
          <Link to="/category/sports">
            <Button variant="ghost" size="sm" className="hover:text-primary transition-colors">
              Sports
            </Button>
          </Link>
          <Link to="/category/books">
            <Button variant="ghost" size="sm" className="hover:text-primary transition-colors">
              Books
            </Button>
          </Link>
          <Link to="/category/todays-deals">
            <Button variant="ghost" size="sm" className="text-deal font-semibold hover:text-deal/80 transition-colors">
              Today's Deals
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
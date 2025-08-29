import { Heart, LogOut, Menu, User } from "lucide-react";
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore.jsx";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { user, logout } = useUserStore();
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  useEffect(() => {}, [user]);

  const navItems = React.useMemo(() => {
    if (!user) return [];

    const baseItems = [
      { key: "nav.home", path: "/dashboard" },
      { key: "nav.learn", path: "/learn" },
      { key: "nav.chat", path: "/ask" },
    ];

    if (user.userType === "adult") {
      baseItems.push(
        { key: "nav.stories", path: "/stories" },
        { key: "nav.consultations", path: "/consultations" }
      );
    }

    return baseItems;
  }, [user]);

  if (!user) return null;

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Flex row that stays in one line */}
        <div className="flex items-center justify-between h-16 flex-nowrap">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              HealthConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Language Switcher */}
            <select
              onChange={handleLanguageChange}
              value={i18n.language}
              className="border rounded-md px-2 py-1 text-sm text-gray-700"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>

            {/* User Info (desktop only) */}
            <div className="hidden md:flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title={t("nav.logout")}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-md">
          <div className="px-4 pt-3 pb-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === item.path
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {t(item.key)}
              </Link>
            ))}

            {/* Language Switcher (mobile) */}
            <select
              onChange={handleLanguageChange}
              value={i18n.language}
              className="w-full border rounded-md px-2 py-2 text-sm text-gray-700"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>

            {/* User Info + Logout (mobile) */}
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title={t("nav.logout")}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

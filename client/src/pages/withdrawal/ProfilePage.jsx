import React, { useEffect, useState } from "react";
import { LogOut, Lock } from "lucide-react";
import BottomBar from "../../components/BottomBar";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { useBalance } from "../../context/BalanceContext";
import { Menu, Transition } from "@headlessui/react";
import { API_CONFIG } from "../../config/api.config";

// ✅ Reusable MenuLink Component
const MenuLink = ({ to, href, active, children, onClick }) => {
  const baseClasses = "block px-4 py-2 text-sm";
  const activeClasses = active ? "bg-red-500 text-white" : "text-gray-200";

  // Agar `to` diya hai to React Router Link use hoga
  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${activeClasses}`}>
        {children}
      </Link>
    );
  }

  // Agar external link ya custom action hai
  return (
    <a
      href={href || "/"}
      onClick={onClick}
      className={`${baseClasses} ${activeClasses}`}
    >
      {children}
    </a>
  );
};

export default function ProfilePage() {
  const [isReferOpen, setIsReferOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const [games, setGames] = useState([]);
  const { balance } = useBalance();

  const integerBalance = Number.isNaN(Number(balance))
    ? 0
    : Math.floor(Number(balance));

  useEffect(() => {
    fetch(`${API_CONFIG.API_BASE}/v1/users/visible-games`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setGames(data.data);
        }
      });
  }, []);

  return (
    <section className="bg-[#160003]">
      <div className="min-h-screen overflow-scroll pb-20 mx-auto md:max-w-lg text-white flex flex-col">
        {/* Top Section */}
        <div className="p-4 flex justify-end items-center">
          <div className="flex gap-4">
            {isAuthenticated ? (
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="relative h-10 w-10 flex justify-center items-center rounded-full bg-transparent text-amber-200 text-xl font-medium z-50 shadow-xs shadow-[#9C1137]">
                    {user?.fullName?.[0] || "U"}
                  </Menu.Button>
                </div>

                <Transition
                  enter="transition-transform transition-opacity duration-300 ease-out"
                  enterFrom="-translate-x-full opacity-0"
                  enterTo="translate-x-0 opacity-100"
                  leave="transition-transform transition-opacity duration-300 ease-in"
                  leaveFrom="translate-x-0 opacity-100"
                  leaveTo="-translate-x-full opacity-0"
                >
                  <Menu.Items className="fixed top-0 left-0 z-50 h-screen overflow-y-auto w-64 sm:w-full bg-[#160003] focus:outline-none pt-4">
                    {/* Games List */}
                    {games.map((gameKey) => (
                      <Menu.Item key={gameKey.link}>
                        {({ active }) => (
                          <MenuLink href={gameKey.link} active={active}>
                            {gameKey.displayName}
                          </MenuLink>
                        )}
                      </Menu.Item>
                    ))}

                    {/* Static Links */}
                    <Menu.Item>
                      {({ active }) => (
                        <MenuLink to="/transactions" active={active}>
                          Transactions
                        </MenuLink>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <MenuLink to="/spinner" active={active}>
                          Spinner
                        </MenuLink>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <MenuLink to="/bets" active={active}>
                          All Bets
                        </MenuLink>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <MenuLink to="/ranking" active={active}>
                          Ranking
                        </MenuLink>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <MenuLink to="/" active={active}>
                          Help & Support
                        </MenuLink>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <MenuLink
                          href="/"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsReferOpen(true);
                          }}
                          active={active}
                        >
                          Refer & Earn
                        </MenuLink>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <>
                <Link to={"/login"}>
                  <button className="bg-transparent shadow-xs shadow-[#9C1137] px-4 py-2 rounded">
                    Login
                  </button>
                </Link>
                <Link to={"/signup"}>
                  <button className="bg-gradient-to-b from-[#9C1137] via-[#9C1137] to-black px-4 py-2 rounded">
                    Register
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="text-center">
          <h2 className="text-lg font-semibold">{user?.phoneNumber || "Guest"}</h2>
          <div className="flex items-center justify-center mt-3">
            <div>
              <p className="text-gray-400 text-sm">Available(₹)</p>
              <p className="text-xl font-bold">₹ {integerBalance}</p>
            </div>
          </div>
        </div>

        {/* Menu List */}
        <div className="mt-6 space-y-3 mx-4">
          {isAuthenticated && (
            <div className="p-4 bg-white text-black shadow rounded-xl flex items-center justify-between">
              <span className="block py-2 text-sm cursor-pointer">
                <p className="text-[#9C1137]">{user?.fullName}</p>
                <p>
                  {user?._id?.[0]}
                  {user?._id?.[1]}*****{user?._id?.[user._id.length - 1]}
                  {user?._id?.[user._id.length - 2]}
                </p>
              </span>
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="block py-2 text-white px-4 rounded-3xl bg-[#9C1137] text-sm hover:shadow-xs shadow-red-500 focus:outline-none"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          )}

          <Link
            to={"/change-password"}
            className="p-4 bg-white shadow rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-green-500" />
              <span className="text-gray-800 font-medium">Change Password</span>
            </div>
          </Link>

          {isAuthenticated && (
            <button
              onClick={logout}
              className="w-full p-4 text-black bg-white shadow rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="text-gray-800 font-medium">Sign out</span>
              </div>
            </button>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed left-0 bottom-0 z-20">
          <BottomBar />
        </div>
      </div>
    </section>
  );
}

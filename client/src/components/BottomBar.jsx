import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { BadgeIndianRupee, Club, School, Trophy, User, X } from "lucide-react";
import { API_CONFIG } from "../config/api.config";

const BottomBar = ({ hidden }) => {
  const [open, setOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const [games, setGames] = useState([]);

  console.log(user);
  useEffect(() => {
    fetch(`${API_CONFIG.API_BASE}/v1/users/visible-games`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setGames(data.data);
        }
      });
  }, []);

  const gameInfo = {
    chicken: {
      displayName: "Chicken Escape",
      image: "/header.png",
      link: "/chicken-road",
    },
    mining: {
      displayName: "Gold Miner Quest",
      image: "/header.png",
      link: "mines",
    },
    aviator: {
      displayName: "Aviator",
      image: "/header.png",
      link: "mines",
    },
    color: {
      displayName: "Color Trading",
      image: "/header.png",
      link: "mines",
    },
  };

  return (
    <nav className="min-w-screen px-4 py-2 md:border-0 border-t-1 bg-[#160003] border-amber-200">
      <div
        className={`text-amber-200    md:hidden flex justify-between min-w-full items-center`}
      >
        <Link to={"/"} className="flex flex-col items-center">
          <School />
          <p>Home</p>
        </Link>

        <Link to={"/ranking"} className="flex flex-col items-center">
          <Trophy />
          <p>Ranking</p>
        </Link>

        <Link to={"/bets"} className="flex z-50 flex-col items-center">
          <BadgeIndianRupee />
          <p>Earn</p>
        </Link>

        <Link to={"/profile"} className="flex z-50 flex-col items-center">
          <User />
          <p>Mine</p>
        </Link>

        {/* <span
          className="flex flex-col items-center"
          onClick={() => setOpen(!open)} // Custom button to toggle the menu
        >
          <Club />
          <p>Mine</p>
        </span> */}
      </div>

      {/* Menu toggle */}
      <div
        className={`transition-transform duration-500 ease-in-out transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } fixed top-0 left-0 z-50 w-[14rem] h-screen bg-[#160003] text-white backdrop-blur-sm`}
      >
        <div className="flex items-start">
          {/* Close Button */}
          <button
            className="z-50 text-gray-300 hover:text-red-500 transition top-2 right-4 absolute"
            onClick={() => setOpen(false)} // Close the menu
            aria-label="Close"
          >
            <X size={28} />
          </button>

          {/* Menu Content */}
          <div className="p-4 text-start z-40 mt-12">
            {isAuthenticated && (
              <div>
                <span className="block py-2 text-sm cursor-pointer">
                  <p className="text-amber-200">{user?.fullName}</p>
                  <p>
                    {user._id[0]}
                    {user._id[1]}*****{user._id[user._id.length - 1]}
                    {user._id[user._id.length - 2]}
                  </p>
                </span>
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="block py-2 text-sm hover:shadow-xs shadow-red-500 focus:outline-none"
                  >
                    Admin Panel
                  </Link>
                )}
              </div>
            )}

            {games.map((gameKey) => {
              const info = gameInfo[gameKey];
              if (!info) return null;

              return (
                <Link
                  key={info.displayName}
                  to={info.link}
                  className="block py-2 text-sm hover:shadow-xs shadow-red-500 focus:outline-none"
                >
                  {info.displayName}
                </Link>
              );
            })}

            {isAuthenticated && (
              <a
                onClick={logout}
                className="block py-2 text-sm hover:shadow-xs shadow-red-500 focus:outline-none cursor-pointer"
              >
                Sign out
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomBar;

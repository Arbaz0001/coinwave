import React from "react";
import hero from "../assets/homebitkoin.jpg";
import bitCoinCard from "../assets/bitCoinCard.png";
import coinJar from "../assets/coinJar.png";
import coinExpert from "../assets/coinExpert.png";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user } = useAuth();
  console.log("Current user:", user);
  return <div>{user ? `Welcome ${user.fullName}` : "Not logged in"}</div>;
};


export default function Home() {

  return (
    <div className="w-full space-y-3 sm:space-y-4 pb-24 sm:pb-28">
      {/* Hero Card */}
      <div className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-lg border">
        <img
          src={hero}
          alt="Hero"
          className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
        />
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 md:top-6 md:left-6 text-white bg-black/40 p-2 sm:p-3 md:p-4 rounded backdrop-blur-sm">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">
            Welcome to Coinpay
          </h1>
          <p className="mt-1 text-xs sm:text-sm md:text-base lg:text-lg">
            Exchange more, earn more <br className="hidden sm:block" /> 
            <span className="sm:hidden">make your life better</span>
            <span className="hidden sm:inline">make your life better</span>
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
  {/* Card 1 */}
  <div className="bg-white border border-blue-500 shadow-lg rounded-lg sm:rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4 items-start">
    <img
      src={bitCoinCard}
      alt="Get started"
      className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg lg:text-xl">
        Get started in seconds
      </h3>
      <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
        Whether you are a beginner or an expert, you can easily get started without any professional knowledge.
      </p>
    </div>
  </div>

  {/* Card 2 (Image on right) */}
  <div className="bg-white border border-blue-500 shadow-lg rounded-lg sm:rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4 items-start justify-between">
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg lg:text-xl">
        Boost your yields
      </h3>
      <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
        Every transaction has potential for huge profits, allowing every user to thrive simultaneously with the platform.
      </p>
    </div>
    <img
      src={coinJar}
      alt="Boost"
      className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain flex-shrink-0"
    />
  </div>

  {/* Card 3 */}
  <div className="bg-white border border-blue-500 shadow-lg rounded-lg sm:rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4 items-start md:col-span-2 lg:col-span-1">
    <img
      src={coinExpert}
      alt="Expert"
      className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg lg:text-xl">
        Access expert knowledge
      </h3>
      <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
        Ensure that every user can earn profits on the platform regardless of how much money they have.
      </p>
    </div>
  </div>
</div>
</div>
  );
}


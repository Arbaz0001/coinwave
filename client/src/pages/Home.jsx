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
    <div className="m-[4px] space-y-2">
      {/* Hero Card */}
      <div className="relative rounded-xl overflow-hidden shadow-lg border">
        <img
          src={hero}
          alt="Hero"
          className="w-full h-40 md:h-[500px] object-cover"
        />
        <div className="absolute top-2 left-2 md:top-4 md:left-4 text-white bg-black/30 p-2 md:p-4 rounded">
          <h1 className="text-2xl md:text-5xl font-bold">
            Welcome to Coinwave
          </h1>
          <p className="mt-1 text-xs md:text-lg">
            Exchange more, earn more <br /> make your life better
          </p>
        </div>
      </div>

     {/* Feature Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Card 1 */}
  <div className="bg-white border border-blue-500 shadow-lg rounded-xl p-4 flex  gap-4 items-start">
    <img
      src={bitCoinCard}
      alt="Get started"
      className="w-16 h-16 md:w-20 md:h-20 object-contain"
    />
    <div className="flex-1">
      <h3 className="font-semibold text-gray-900 text-base md:text-xl">
        Get started in seconds
      </h3>
      <p className="text-gray-600 mt-2 text-sm md:text-base">
        Whether you are a beginner or an expert, you can easily get started without any professional knowledge.
      </p>
    </div>
  </div>

  {/* Card 2 (Image on right) */}
  <div className="bg-white border border-blue-500 shadow-lg rounded-xl p-4 flex gap-4 items-start justify-between">
    <div className="flex-1">
      <h3 className="font-semibold text-gray-900 text-base md:text-xl">
        Boost your yields
      </h3>
      <p className="text-gray-600 mt-2 text-sm md:text-base">
        Every transaction has potential for huge profits, allowing every user to thrive simultaneously with the platform.
      </p>
    </div>
    <img
      src={coinJar}
      alt="Boost"
      className="w-16 h-16 md:w-20 md:h-20 object-contain"
    />
  </div>

  {/* Card 3 */}
  <div className="bg-white border border-blue-500 shadow-lg rounded-xl p-4 flex gap-4 items-start">
    <img
      src={coinExpert}
      alt="Expert"
      className="w-16 h-16 md:w-20 md:h-20 object-contain"
    />
    <div className="flex-1">
      <h3 className="font-semibold text-gray-900 text-base md:text-xl">
        Access expert knowledge
      </h3>
      <p className="text-gray-600 mt-2 text-sm md:text-base">
        Ensure that every user can earn profits on the platform regardless of how much money they have.
      </p>
    </div>
  </div>
</div>

    </div>
  );
}

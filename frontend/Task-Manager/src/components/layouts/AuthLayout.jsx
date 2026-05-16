import React from 'react';
import UI_IMG from "../../assets/images/auth-img.png";
import bg from "../../assets/images/bg.svg";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">

      {/* Left Section */}
      <div className="w-full md:w-[60vw] px-6 md:px-12 py-8 flex flex-col justify-center">

        {/* Logo */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Task Manager
          </h2>

          <p className="text-gray-500 mt-1">
            Organize your work efficiently
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
          {children}
        </div>
      </div>

      {/* Right Section */}
      <div
        className="
          hidden md:flex
          w-[40vw]
          min-h-screen
          items-center
          justify-center
          bg-cover
          bg-center
          relative
          overflow-hidden
          p-8
        "
        style={{ backgroundImage: `url(${bg})` }}
      >

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/90 via-indigo-900/80 to-purple-800/90"></div>

        {/* Glow Effects */}
        <div className="absolute w-72 h-72 bg-blue-400/30 rounded-full blur-3xl top-10 left-10"></div>

        <div className="absolute w-72 h-72 bg-purple-500/30 rounded-full blur-3xl bottom-10 right-10"></div>

        {/* Image Card */}
        <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">

          <img
            src={UI_IMG}
            alt="Auth Illustration"
            className="w-full max-w-md drop-shadow-2xl"
          />

        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
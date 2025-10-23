import Logo from "/images/logo.svg";

export default function MainScreen() {
  return (
    <div className="w-screen h-screen bg-gray-900 text-white flex flex-col items-center justify-between p-6">
      {/* Company Logo Area */}
      <header className="w-full flex items-center mb-4">
        <div className="h-16 w-48 rounded-lg flex items-center justify-center shadow-lg">
          {/* Replace with your <img src="logo.png" /> */}
          <span className="text-xl font-bold tracking-wide text-orange-400">
            <img src="/images/logo.svg" alt="Logo" className="w-45 h-45" />
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-center gap-10">
        {/* Left Stats Panel */}
        <div className="flex flex-col gap-6 items-center">
          {/* Arc Container */}
          <div className="w-60 h-45 bg-gray-800 rounded-3xl shadow-xl flex flex-col items-center justify-center border-4 border-orange-500">
            <p className="text-lg uppercase tracking-widest text-gray-300">
              Arc
            </p>
            <span className="text-6xl font-bold text-orange-400">32.3°</span>
          </div>

          {/* Grade Container */}
          <div className="w-60 h-45 bg-gray-800 rounded-3xl shadow-xl flex flex-col items-center justify-center border-4 border-orange-500">
            <p className="text-lg uppercase tracking-widest text-gray-300">
              Grade
            </p>
            <span className="text-6xl font-bold text-orange-400">40.6°</span>
          </div>

          {/* Basketball Icon */}
          <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
            <img
              src="/images/basketball.png"
              alt="Basket Hoop"
              className="w-20 h-20 object-contain rounded-3xl"
            />
          </div>
        </div>

        {/* Middle Basket Area */}
        <div className="relative w-[40rem] h-[40rem] bg-gray-800 rounded-3xl flex items-center justify-center shadow-inner border-4 border-gray-700">
          <img
            src="/images/basket-hoop.png"
            alt="Basket Hoop"
            className="w-[calc(40rem-10px)] h-[calc(40rem-10px)] object-contain rounded-3xl"
          />
          {/* Shot indicator example */}
          <div className="absolute right-2/3 top-1/3 w-50 h-50 rounded-full flex items-center justify-center">
            {/* Red semi-transparent circle */}
            <div className="absolute inset-0 bg-red-500 opacity-50 rounded-full border-2 border-white"></div>

            {/* X mark */}
            <span className="relative text-red-700 font-extrabold text-3xl pointer-events-none">
              ×
            </span>
          </div>
        </div>

        {/* Right Player/Video Area */}
        <div className="w-[20rem] h-[40rem] bg-gray-800 rounded-3xl shadow-xl overflow-hidden border-4 border-gray-700 flex items-center justify-center">
          {/* Replace with actual <video> or <img> */}
          <span className="text-gray-400 text-xl">Player Camera Feed</span>
        </div>
      </div>

      {/* Footer Placeholder */}
      <footer className="w-full mt-4 text-center text-sm text-gray-400">
        © 2025 Swish
      </footer>
    </div>
  );
}

export default function Login() {
  return (
    <div className="min-h-screen flex">
      {/* Left side (branding/info) */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-cyan-500 to-blue-700 text-white p-12">
        <h1 className="text-4xl font-bold mb-4">⚽ StatSphere</h1>
        <p className="text-lg text-gray-100 text-center max-w-md">
          Your all-in-one football analytics hub — track players, teams, and predictions.
        </p>
      </div>

      {/* Right side (login form) */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-900 text-white p-8">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-80 md:w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign in to StatSphere</h2>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button className="w-full bg-cyan-500 hover:bg-cyan-600 py-2 rounded font-semibold transition">
            Sign In
          </button>
          <p className="text-center text-gray-400 text-sm mt-4">
            Don’t have an account?{" "}
            <a href="#" className="text-cyan-400 hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

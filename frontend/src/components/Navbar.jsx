import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white shadow-md py-3 px-6 flex justify-between items-center">
      {/* Left: Brand Name (Clickable) */}
      <Link to="/">
        <h1 className="text-xl font-bold text-blue-600 tracking-wide hover:underline">
          CodeAnalyzer
        </h1>
      </Link>

      {/* Right Side: Snippets Link + Logout */}
      <div className="flex gap-4 items-center">
        <Link
          to="/snippets"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          📚 Snippets
        </Link>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition font-medium"
        >
          Logout
        </motion.button>
      </div>
    </nav>
  );
}

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/SignUp";
import Home from "./components/Dashboard";
import Snippets from "./pages/Snippets";


function App() {
  return (
    <Router>

      <Routes>

        <Route path="/" element={<Home/>} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/snippets" element={<Snippets/>} />
        {/* Other routes go here */}
      </Routes>
    </Router>
  );
}

export default App;

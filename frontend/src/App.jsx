  
import React from "react";
import Auth from "./components/Auth-page.jsx";
import Spline from "@splinetool/react-spline";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import SignUp from "./components/SignUp.jsx";
import Navbar from "./components/NavBar.jsx";

function App() {
  return (
    <Router>
      <Navbar></Navbar>
      <Routes>
        <Route 
          path="/" 
          element={
            <div style={{ display: "flex", height: "100vh" }}>
              {/* Left side: Auth page */}
              <Auth />

              {/* Right side: Spline scene */}
              <Spline scene="https://prod.spline.design/SXjPeI852Lx9FeFV/scene.splinecode" />
            </div>
          } 
        />
        <Route path="/SignUp" element={
            <div style={{ display: "flex", height: "100vh" }}>
              {/* Left side: Auth page */}
              <SignUp />

              {/* Right side: Spline scene */}
              <Spline scene="https://prod.spline.design/hLFqIWZUESFhrZ-2/scene.splinecode" />
            </div>
          } />
      </Routes>
    </Router>
  );

}

export default App;

  import React from "react";
import SignIn from "./pages/SignIn.jsx";
import Spline from "@splinetool/react-spline";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import SignUp from "./pages/SignUp.jsx";
import Home from "./pages/Home.jsx"
import OtpVerification from "./components/OTP_verify.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route  path="/"element={
          <div>
            <Home></Home>
          </div>
        }/>
        <Route path="/SignIn" element={
            <div>
              <SignIn />
            </div>
          } 
        />
        <Route path="/SignUp"  element={
            <div>
              <SignUp />
            </div>
          } />
        <Route path="/verify-otp" element={ 
          <div>
            <OtpVerification />
          </div>
        } />
      </Routes>
    </Router>
  );

}

export default App;

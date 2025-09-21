import React from "react";
import SignIn from "./pages/SignIn.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import SignUp from "./pages/SignUp.jsx";
import Home from "./pages/Home.jsx"
import OtpVerification from "./components/OTP_verify.jsx";
import Form from './pages/Form.jsx';
import Dashboard from "./pages/Dashboard.jsx"; 
import Features from "./pages/FeaturePage.jsx";
import CommunityPage from "./pages/Community.jsx";
import CreateCommunityMember from "./pages/CreatePost.jsx";


function App() {
  return (
    <Router>
      <Routes>
        <Route  path="/" element={
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
       <Route path="/form" element={
          <div>
            <Form></Form>
          </div>
        }/>
        <Route path="/dashboard" element={
          <div>
            <Dashboard />
          </div>
        }/>
        <Route path="/Features" element={
          <div>
            <Features></Features>
          </div>
        }/>
        <Route path="/community" element={
          <div>
            <CommunityPage></CommunityPage>
          </div>
        }></Route>
        <Route path="/community/create" element={
          <div>
            <CreateCommunityMember></CreateCommunityMember>
          </div>
        }></Route>
      </Routes>
    </Router>
  );

}

export default App;

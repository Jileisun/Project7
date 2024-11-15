import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function LoginRegister({ onLoginSuccess }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [loginName, setLoginName] = useState("");
  const [user, setUser] = useState(null);
  const [registerData, setRegisterData] = useState({
    login_name: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: ""
  });
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("/admin/login", { login_name: loginName });
      const loggedInUser = response.data;
      setUser(loggedInUser);
      onLoginSuccess(); // Notify PhotoShare to fetch user list
      navigate(`/users/${loggedInUser._id}`);
    } catch (error) {
      console.error("Login failed:", error.response ? error.response.data : error.message);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post("/user", registerData);
      setIsLoginView(true);
    } catch (error) {
      console.error("Registration failed:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="login-register-container">
      {user ? (
        <div>
          <h2>Welcome, {user.first_name}</h2>
        </div>
      ) : (
        <div>
          <button onClick={() => setIsLoginView(!isLoginView)}>
            {isLoginView ? "Switch to Register" : "Switch to Login"}
          </button>
          {isLoginView ? (
            <div>
              <h2>Login</h2>
              <input
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Login Name"
              />
              <button onClick={handleLogin}>Login</button>
            </div>
          ) : (
            <div>
              <h2>Register</h2>
              <input
                type="text"
                name="login_name"
                value={registerData.login_name}
                onChange={(e) => setRegisterData({ ...registerData, login_name: e.target.value })}
                placeholder="Login Name"
              />
              <input
                type="text"
                name="first_name"
                value={registerData.first_name}
                onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                placeholder="First Name"
              />
              <input
                type="text"
                name="last_name"
                value={registerData.last_name}
                onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                placeholder="Last Name"
              />
              <input
                type="text"
                name="location"
                value={registerData.location}
                onChange={(e) => setRegisterData({ ...registerData, location: e.target.value })}
                placeholder="Location"
              />
              <input
                type="text"
                name="description"
                value={registerData.description}
                onChange={(e) => setRegisterData({ ...registerData, description: e.target.value })}
                placeholder="Description"
              />
              <input
                type="text"
                name="occupation"
                value={registerData.occupation}
                onChange={(e) => setRegisterData({ ...registerData, occupation: e.target.value })}
                placeholder="Occupation"
              />
              <button onClick={handleRegister}>Register</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LoginRegister;





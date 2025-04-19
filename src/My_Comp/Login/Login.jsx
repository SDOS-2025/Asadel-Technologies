"use client"
import "./Login.css"
import ReactDOM from "react-dom/client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("")
  // This 
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  // This is the function that activates
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const data = await api.login(formData)
      
      // Store the token in localStorage
      localStorage.setItem("token", data.token)
      // localStorage.setItem("user", JSON.stringify(data.user))

      // Use navigate instead of window.location
      navigate("/Home")
    } catch (err) {
      setError(err.message || "Invalid credentials")
      console.error("Login error:", err)
    }
  }

  return (
    <div className="login-container">
      <main className="login-main">
        <div className="login-logo">
          <img
            src="/logo.png"
            alt="Asadel Technologies Logo"
          />
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2>Sign-in</h2>
            <p>Please enter your details</p>
          </div>

          <div className="login-card-body">
            {error && <div className="login-error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label htmlFor="email" className="login-form-label">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="login-form-control" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="login-form-group">
                <label htmlFor="password" className="login-form-label">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  className="login-form-control" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>

              <a href="#" className="login-forgot-password">
                Forgot Password
              </a>

              <button type="submit" className="login-submit-btn">
                Login
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}


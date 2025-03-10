"use client"
import "./Login.css"
import ReactDOM from "react-dom/client"

export default function Login() {
  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle login logic here
    console.log("Login attempted")
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
            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label htmlFor="username" className="login-form-label">Username</label>
                <input type="text" id="username" name="username" className="login-form-control" required />
              </div>

              <div className="login-form-group">
                <label htmlFor="password" className="login-form-label">Password</label>
                <input type="password" id="password" name="password" className="login-form-control" required />
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


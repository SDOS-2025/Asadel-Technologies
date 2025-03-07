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
    <div className="container">
     

      <main className="main">
        <div className="logo">
          <img
          src="/logo.png"
          alt="Asadel Technologies Logo"
          />
        </div>

     

        <div className="login-card">
          <div className="card-header">
            <h2>Sign-in</h2>
            <p>Please enter your details</p>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" required />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" required />
              </div>

              <a href="#" className="forgot-password">
                Forgot Password
              </a>

              <button type="submit" className="login-button">
                Login
              </button>
            </form>
          </div>
        </div>
      </main>

    </div>
  )
}


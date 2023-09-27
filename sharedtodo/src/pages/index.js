import { useState } from "react";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleLoginMode = () => {
    setIsLogin((prevMode) => !prevMode);
  };

  const SubmitForm = async (event) => {
    event.preventDefault(); // Prevent the form from submitting in the default way

    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;

    if (!isLogin) {
      const confirmPassword = document.querySelector(
        'input[name="confirmPassword"]'
      ).value;
      if (password !== confirmPassword) {
        alert("Passwords don't match");
        return;
      }
      const username = document.querySelector('input[name="username"]').value;

      console.log("Signup:", { email, password, username });
      // Send the data to the server
      try {
        const response = await fetch("http://localhost:8888/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, username }),
        });
        // Check the response status code
        if (response.status === 200) {
          const responseData = await response.text(); // Use text() to get the response body as text
          alert("Signup successful: " + responseData);
          setIsLogin(true);
        } else {
          const responseData = await response.text(); // Use text() to get the response body as text
          alert("Signup failed: " + responseData);
        }
      } catch (error) {
        console.error("Error during signup:", error);
      }
    } else {
      // Login logic
      console.log("Login:", { email, password });
      // Send the data to the server
      try {
        const response = await fetch("http://localhost:8888/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        if (response.status == 200) {
          // const resData = await response.text();
          // alert("login successful: " + resData);
          window.location.href = "/dashboard";
        } else {
          const resData = await response.text();
          alert("login failed: " + resData);
        }
      } catch (error) {
        console.error("error during sign in");
      }
    }
  };

  return (
    <div>
      <h1>{isLogin ? "Login" : "Sign up"}</h1>
      <button onClick={toggleLoginMode}>
        {isLogin ? "Switch to Sign up" : "Switch to Login"}
      </button>
      <br />
      <form onSubmit={SubmitForm}>
        <label>
          Email:
          <input type="email" name="email" />
        </label>
        <br />
        <label>
          Password:
          <input type="password" name="password" />
        </label>
        <br />
        {!isLogin && (
          <>
            <label>
              Confirm Password:
              <input type="password" name="confirmPassword" />
            </label>
            <br />
            <label>
              Username:
              <input type="text" name="username" />
            </label>
            <br />
          </>
        )}
        <button type="submit">{isLogin ? "Login" : "Sign up"}</button>
      </form>
    </div>
  );
}

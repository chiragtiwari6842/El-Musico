document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const error = document.getElementById("error");

      const validUsername = "styleme";
      const validPassword = "fashion123";

      if (username === validUsername && password === validPassword) {
        localStorage.setItem("loggedIn", "true");
        window.location.href = "index.html";
      } else {
        error.textContent = "Invalid username or password.";
      }
    });
  }

  const isIndexPage = window.location.pathname.includes("index.html");
  if (isIndexPage) {
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    if (!loggedIn) {
      window.location.href = "login.html";
    }
  }
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
    });
  }
})

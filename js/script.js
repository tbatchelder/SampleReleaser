// Function to populate username dropdown with data from users.js
function populateUserDropdown() {
  const usernameSelect = document.getElementById("username");
  usernameSelect.innerHTML = ""; // Clear existing options

  // Loop through users array and add them to dropdown
  users.forEach(user => {
      let option = document.createElement("option");
      option.value = user.username;
      option.textContent = user.username;
      usernameSelect.appendChild(option);
  });
}

// Simulate basic password hashing (Replace with a stronger hashing method later)
function hashPassword(password) {
  return btoa(password);
}

// Handle login validation
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  const user = users.find(u => u.username === username);
  if (user && hashPassword(password) === user.password_hash) {
      message.textContent = `Login successful! Redirecting to dashboard...`;

      setTimeout(() => {
          // Role-based redirection
          if (user.role === "entry" && user.department === "rm lab") {
              window.location.href = "html/entry_raw.html";
          } else if (user.role === "entry" && user.department === "finished") {
              window.location.href = "html/entry_finished.html";
          } else if (user.role === "review" && user.department === "rm lab") {
              window.location.href = "html/review_raw.html";
          } else if (user.role === "review" && user.department === "finished") {
              window.location.href = "html/review_finished.html";
          } else if (user.role === "viewer") {
              window.location.href = "html/viewer.html";
          } else {
              message.textContent = "Invalid role or department!";
              message.style.color = "red";
          }
      }, 1000);
  } else {
      message.textContent = "Invalid username or password!";
      message.style.color = "red";
  }
}


// Ensure dropdown is populated on page load
window.onload = populateUserDropdown;

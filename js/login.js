// Function to populate username dropdown
function populateUserDropdown() {
  const usernameSelect = document.getElementById("username");
  usernameSelect.innerHTML = '<option value="">Choose a user...</option>'; // Reset with default option

  // Loop through users array and add them to dropdown
  users.forEach(user => {
    let option = document.createElement("option");
    option.value = user.username;
    option.textContent = user.username;
    usernameSelect.appendChild(option);
  });
}

// Password hashing function
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Store user session data
function storeUserSession(user) {
  localStorage.setItem('currentUser', JSON.stringify({
    username: user.username,
    role: user.role,
    department: user.department,
    loginTime: new Date().toISOString()
  }));
}

// Handle form submission
async function handleLogin(event) {
  event.preventDefault();
  
  const form = document.getElementById("loginForm");
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  // Show loading state
  form.classList.add("loading");
  showMessage("Logging in...", "info");

  try {
    // Find user
    const user = users.find(u => u.username === username);
    
    if (!user) {
      throw new Error("Invalid username or password!");
    }
    
    // Hash the entered password and compare
    const hashedPassword = await hashPassword(password);
    
    if (hashedPassword !== user.password_hash) {
      throw new Error("Invalid username or password!");
    }
    
    // Store user session data
    storeUserSession(user);
    
    // Success!
    showMessage("Login successful! Redirecting to dashboard...", "success");

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
        throw new Error("Invalid role or department!");
      }
    }, 1500);

  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    // Remove loading state
    form.classList.remove("loading");
  }
}

// Helper function to show messages
function showMessage(text, type) {
  const message = document.getElementById("message");
  message.textContent = text;
  message.className = type;
  
  // Auto-hide error messages after 5 seconds
  if (type === "error") {
    setTimeout(() => {
      message.style.display = "none";
    }, 5000);
  }
}

// Initialize dropdown on page load
window.addEventListener('DOMContentLoaded', populateUserDropdown);
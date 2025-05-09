let countdownTime = 10; // Set the countdown time
const countdownElement = document.getElementById("countdown");

const interval = setInterval(() => {
  countdownElement.textContent = `Redirecting in ${countdownTime} seconds...`;

  if (countdownTime <= 0) {
    clearInterval(interval); // Stop the interval
    const redirectUrl = "https://www.focusmode.com"; // Specify your redirect URL here //http://localhost:8080/
    window.location.href = redirectUrl; // Redirect the user
  } else {
    countdownTime--; // Decrease countdown time
  }
}, 1000);

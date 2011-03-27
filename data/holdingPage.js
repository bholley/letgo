// holdingPage.html script file

// Globals
var secondsLeft = 5;

// Updates the counter display
function updateCounterDisplay() {
  document.getElementById("timeLeft").innerHTML = secondsLeft;
}

// Set anothe timeout
function armTimeout() {
  window.setTimeout(tick, 1000);
}

// Called every second
function tick() {

  // Decrement the time left
  secondsLeft--;

  // Update the page
  updateCounterDisplay();

  // Forward if we've waited long enough
  if (secondsLeft == 0) {
    var baseURI = window.atob(getURLParam(window.location.href, "dst"));
    var fullURI = addURLParam(baseURI, "LetGoWaitComplete", "true");
    window.location.replace(fullURI);
  }
  // Otherwise, reset the timer
  else
    armTimeout();
}

// Init code
window.onload = function() {
  updateCounterDisplay();
  armTimeout();
};

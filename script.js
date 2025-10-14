// Pause the timer and update UI
function pauseTimer() {
  console.log("Pause button clicked, current paused state:", clockPaused);
  clockPaused = !clockPaused;
  setClockState(clockPaused ? "paused" : "running");
  // Update button text and icon
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) {
    const btnText = pauseBtn.querySelector('.btn-text');
    const btnIcon = pauseBtn.querySelector('.btn-icon');
    if (btnText) {
      btnText.textContent = clockPaused ? "Resume" : "Pause";
    }
    if (btnIcon) {
      btnIcon.setAttribute('data-lucide', clockPaused ? 'play' : 'pause');
      // Re-initialize icons
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  }

  // If resuming and no interval is running, start the timer interval from current state
  if (!clockPaused && !clockTimerInterval) {
    let elapsed = clockTotalTime - clockTimeLeft;
    const lengthBetween =
      Number(document.getElementById("lengthBetweenInput").value) * 60;
    const lengthHold =
      Number(document.getElementById("lengthHoldInput").value) * 60;
    let nextGong = lengthBetween + lengthHold;
    while (nextGong <= elapsed) {
      nextGong += lengthBetween + lengthHold;
    }
    clockTimerInterval = setInterval(() => {
      if (!clockPaused && clockTimeLeft > 0) {
        clockTimeLeft--;
        elapsed++;
        updateClockFace();
        updateTimerDisplay();
        if (elapsed === nextGong && clockTimeLeft > 0) {
          playGong();
          nextGong += lengthBetween + lengthHold;
        }
        if (clockTimeLeft === 4) {
          playGong();
          setTimeout(playGong, 2000);
        }
        if (clockTimeLeft === 0) {
          clearInterval(clockTimerInterval);
          clockTimerInterval = null;
          setClockState("done");
          document.getElementById("timerDisplay").textContent = "Done!";
        }
      }
    }, 1000);
  } else if (clockPaused && clockTimerInterval) {
    clearInterval(clockTimerInterval);
    clockTimerInterval = null;
  }
}
function setClockState(state) {
  const circle = document.getElementById("progressCircle");
  const timerContainer = document.getElementById("timerContainer");
  
  // Remove all state classes
  circle.classList.remove("running", "paused", "done");
  timerContainer.classList.remove("running", "paused", "done");

  // Add new state class if provided
  if (state && state.trim()) {
    circle.classList.add(state);
    timerContainer.classList.add(state);
  }

  // Add subtle background color changes with CSS classes instead of inline styles
  // This allows the CSS backdrop-filter and other effects to work properly
}
function updateTimerDisplay() {
  const minutes = Math.floor(clockTimeLeft / 60);
  const seconds = clockTimeLeft % 60;
  document.getElementById("timerDisplay").textContent = `${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
function updateClockFace() {
  const circle = document.getElementById("progressCircle");
  const circumference = 2 * Math.PI * 90;
  const offset = circumference * (1 - clockTimeLeft / clockTotalTime);
  circle.setAttribute("stroke-dashoffset", offset);
}
let clockTimerInterval = null;
let clockTimeLeft = 0;
let clockTotalTime = 0;
let clockPaused = false;

function startClockTimer(duration) {
  clockTotalTime = duration;
  clockTimeLeft = duration;
  clockPaused = false;
  updateClockFace();
  updateTimerDisplay();
  setClockState("running");

  let elapsed = 0;
  const lengthBetween =
    Number(document.getElementById("lengthBetweenInput").value) * 60;
  const lengthHold =
    Number(document.getElementById("lengthHoldInput").value) * 60;

  // Play gong at the very start to indicate time to get into first pose
  playGong();
  let nextGong = lengthBetween + lengthHold;
  console.log("gong scheduled for", nextGong);
  if (clockTimerInterval) clearInterval(clockTimerInterval);
  clockTimerInterval = setInterval(() => {
    if (!clockPaused && clockTimeLeft > 0) {
      clockTimeLeft--;
      elapsed++;
      updateClockFace();
      updateTimerDisplay();

      if (elapsed === nextGong && clockTimeLeft > 0) {
        console.log("Gong played at", elapsed);
        playGong();
        nextGong += lengthBetween + lengthHold; // schedule next gong after full cycle
      }

      // Play gong twice in the last 4 seconds (2 seconds apart)
      if (clockTimeLeft === 4) {
        playGong();
        setTimeout(playGong, 2000);
      }
      if (clockTimeLeft === 0) {
        clearInterval(clockTimerInterval);
        setClockState("done");
        document.getElementById("timerDisplay").textContent = "Done!";

        // Show start button and hide control buttons when timer completes
        const startBtn = document.getElementById("start-yin");
        const pauseBtn = document.getElementById("pauseBtn");
        const resetBtn = document.getElementById("resetBtn");

        startBtn.style.display = "block";
        pauseBtn.style.display = "none";
        resetBtn.style.display = "none";

        // Reset timer interval reference
        clockTimerInterval = null;

        // After a brief delay, show the calculated practice time again
        setTimeout(() => {
          calculateYinLength();
        }, 3000); // Show "Done!" for 3 seconds, then show practice time
      }
    }
  }, 1000);
}

function resetTimer() {
  console.log("=== RESET FUNCTION CALLED ===");
  console.log("Current state before reset:", {
    clockPaused,
    clockTimeLeft,
    clockTotalTime,
    hasInterval: !!clockTimerInterval,
  });

  try {
    // Clear any running timer
    if (clockTimerInterval) {
      clearInterval(clockTimerInterval);
      console.log("✓ Cleared timer interval");
    }

    // Reset ALL timer state completely
    clockTimerInterval = null;
    clockPaused = false;
    clockTimeLeft = 0;
    clockTotalTime = 0;
    console.log("✓ Reset all timer variables");

    // Reset visual state
    setClockState("");
    console.log("✓ Reset clock state");

    // Reset the progress circle to completely empty
    const circle = document.getElementById("progressCircle");
    if (circle) {
      const circumference = 2 * Math.PI * 90;
      circle.setAttribute("stroke-dashoffset", circumference.toString());
      console.log("✓ Reset progress circle");
    }

    // Update buttons
    const startBtn = document.getElementById("start-yin");
    const pauseBtn = document.getElementById("pauseBtn");
    const resetBtn = document.getElementById("resetBtn");

    console.log("Found buttons for reset:", {
      start: !!startBtn,
      pause: !!pauseBtn,
      reset: !!resetBtn,
    });

    if (pauseBtn) {
      const btnText = pauseBtn.querySelector('.btn-text');
      const btnIcon = pauseBtn.querySelector('.btn-icon');
      if (btnText) {
        btnText.textContent = "Pause";
      }
      if (btnIcon) {
        btnIcon.setAttribute('data-lucide', 'pause');
        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }
      console.log("✓ Reset pause button text");
    }

    if (startBtn) {
      startBtn.style.display = "block";
      console.log("✓ Showed start button");
    }
    if (pauseBtn) {
      pauseBtn.style.display = "none";
      console.log("✓ Hid pause button");
    }
    if (resetBtn) {
      resetBtn.style.display = "none";
      console.log("✓ Hid reset button");
    }

    // Show the calculated practice time
    calculateYinLength();
    console.log("✓ Recalculated practice time");

    console.log("=== RESET COMPLETE ===");
  } catch (error) {
    console.error("Error in resetTimer:", error);
  }
}

// Call this function to start the clock timer using sum (in minutes)
function startYinPractice() {
  console.log("Start Yin Practice clicked");
  calculateYinLength();
  console.log("Sum calculated:", sum);

  if (typeof sum === "undefined" || sum <= 0) {
    alert(
      "Please enter valid values and calculate the total length before starting the Yin practice."
    );
    return;
  }

  // Hide start button and show control buttons
  const startBtn = document.getElementById("start-yin");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");

  console.log("Hiding start button, showing control buttons");
  startBtn.style.display = "none";
  pauseBtn.style.display = "block";
  resetBtn.style.display = "block";

  startClockTimer(sum * 60);
}
let sum = 0; // Define sum in the global scope
let timerInterval = null;

function getInputValues() {
  return {
    poses: document.getElementById("posesInput").value,
    lengthBetween: document.getElementById("lengthBetweenInput").value,
    lengthHold: document.getElementById("lengthHoldInput").value,
  };
}

function isNonNegativeWholeNumber(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}

function isNonNegativeNumber(value) {
  const num = Number(value);
  if (Number.isNaN(num)) {
    alert("Please enter a valid number.");
    return false;
  }
  return num > 0;
}

function calculateYinLength() {
  const { poses, lengthBetween, lengthHold } = getInputValues();
  // Use poses, lengthBetween, lengthHold for your calculation
  // Validate inputs
  if (
    !isNonNegativeWholeNumber(poses) ||
    !isNonNegativeNumber(lengthBetween) ||
    !isNonNegativeNumber(lengthHold)
  ) {
    document.getElementById("totalLengthOutput").textContent = "0:00";
    sum = 0;
    // Reset timer display to show 00:00 if invalid inputs
    if (!clockTimerInterval) {
      document.getElementById("timerDisplay").textContent = "00:00";
    }
    return;
  }
  const posesNum = Number(poses);
  const lengthBetweenNum = Number(lengthBetween);
  const lengthHoldNum = Number(lengthHold);

  // Calculate total time in minutes (keep as decimal for internal calculations)
  sum = (lengthBetweenNum + lengthHoldNum) * posesNum;

  // Convert to total seconds and format consistently
  const totalSeconds = Math.round(sum * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Format as MM:SS for both displays
  const formattedTime = `${minutes.toString()}:${seconds
    .toString()
    .padStart(2, "0")}`;

  // Update both displays with the same formatted time
  document.getElementById("totalLengthOutput").textContent = formattedTime;

  // Update the timer display to show total practice time (only when not actively timing)
  if (!clockTimerInterval) {
    document.getElementById("timerDisplay").textContent = `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
}

function playGong() {
  const gong = new Audio("single-gong.mp3");
  gong.loop = false;
  gong.play();
}

// Preset button functions
function setLengthBetween(value) {
  document.getElementById("lengthBetweenInput").value = value;
  calculateYinLength(); // Recalculate total when preset is selected
}

function setLengthHold(value) {
  document.getElementById("lengthHoldInput").value = value;
  calculateYinLength(); // Recalculate total when preset is selected
}

// Initialize the application when the page loads
document.addEventListener("DOMContentLoaded", function () {
  console.log("Page loaded - initializing");

  // Calculate initial total length
  calculateYinLength();

  // Set initial button visibility
  const startBtn = document.getElementById("start-yin");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");

  console.log("Found buttons:", {
    start: !!startBtn,
    pause: !!pauseBtn,
    reset: !!resetBtn,
  });

  startBtn.style.display = "block";
  pauseBtn.style.display = "none";
  resetBtn.style.display = "none";

  // The onclick attributes in HTML are working fine, no need for duplicate event listeners

  // Add event listeners to recalculate when inputs change
  document
    .getElementById("posesInput")
    .addEventListener("input", calculateYinLength);
  document
    .getElementById("lengthBetweenInput")
    .addEventListener("input", calculateYinLength);
  document
    .getElementById("lengthHoldInput")
    .addEventListener("input", calculateYinLength);
});

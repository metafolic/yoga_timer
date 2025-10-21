// Pause the timer and update UI
function pauseTimer() {
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn && pauseBtn.disabled) return;

  console.log("Pause button clicked, current paused state:", clockPaused);
  clockPaused = !clockPaused;
  setClockState(clockPaused ? "paused" : "running");
  // Optionally update button text
  if (pauseBtn) {
    pauseBtn.textContent = clockPaused ? "Resume" : "Pause";
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

  // Remove all state classes from both elements
  circle.classList.remove("running", "paused", "done");
  timerContainer.classList.remove("running", "paused", "done");

  // Add new state class if provided
  if (state && state.trim()) {
    circle.classList.add(state);
    timerContainer.classList.add(state);
  }

  // Remove any inline background styles to let CSS handle it
  timerContainer.style.background = "";
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

        // Enable start button and disable control buttons when timer completes
        const startBtn = document.getElementById("start-yin");
        const pauseBtn = document.getElementById("pauseBtn");
        const resetBtn = document.getElementById("resetBtn");

        startBtn.disabled = false;
        pauseBtn.disabled = true;
        resetBtn.disabled = true;

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
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn && resetBtn.disabled) return;

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
      pauseBtn.textContent = "Pause";
      console.log("✓ Reset pause button text");
    }

    if (startBtn) {
      startBtn.disabled = false;
      console.log("✓ Enabled start button");
    }
    if (pauseBtn) {
      pauseBtn.disabled = true;
      console.log("✓ Disabled pause button");
    }
    if (resetBtn) {
      resetBtn.disabled = true;
      console.log("✓ Disabled reset button");
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
  const startBtn = document.getElementById("start-yin");
  if (startBtn && startBtn.disabled) return;

  console.log("Start Yin Practice clicked");
  calculateYinLength();
  console.log("Sum calculated:", sum);

  if (typeof sum === "undefined" || sum <= 0) {
    alert(
      "Please enter valid values and calculate the total length before starting the Yin practice."
    );
    return;
  }

  // Disable start button and enable control buttons
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");

  console.log("Disabling start button, enabling control buttons");
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;

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

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resetBtn.disabled = true;

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

// =============================================
// TAB SYSTEM
// =============================================
function switchTab(tabName) {
  // Remove active class from all tabs and buttons
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Add active class to selected tab and button
  document.getElementById(tabName + "-tab").classList.add("active");
  event.target.classList.add("active");

  // Reset any running timers when switching tabs
  if (tabName === "meditation") {
    resetMeditation();
  } else {
    resetTimer();
  }
}

// =============================================
// MEDITATION TIMER
// =============================================
let meditationTimer = null;
let meditationTimeLeft = 0;
let meditationTotalTime = 0;
let meditationPaused = false;

// Meditation timer now uses the same gong sound as yin yoga timer

// Use the same gong sound as the yin yoga timer for both start and end
function playMeditationBell() {
  playGong(); // Uses the same single-gong.mp3 as yin yoga timer
}

function playMeditationGong() {
  playGong(); // Uses the same single-gong.mp3 as yin yoga timer
}

function setMeditationTime(minutes) {
  document.getElementById("meditationMinutes").value = minutes;
  updateMeditationDisplay();
}

function updateMeditationDisplay() {
  const minutes = Math.floor(meditationTimeLeft / 60);
  const seconds = meditationTimeLeft % 60;
  const display = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
  document.getElementById("meditationDisplay").textContent = display;
}

function updateMeditationProgress() {
  const progress = document.getElementById("meditationProgress");
  const circumference = 2 * Math.PI * 90; // radius = 90 (matches yoga timer)
  const progressPercent =
    (meditationTotalTime - meditationTimeLeft) / meditationTotalTime;
  const offset = circumference - progressPercent * circumference;
  progress.style.strokeDashoffset = offset;
}

function startMeditationTimer() {
  const minutes = parseInt(document.getElementById("meditationMinutes").value);
  const startBell = document.getElementById("startBell").checked;

  if (meditationTimer) {
    clearInterval(meditationTimer);
  }

  meditationTimeLeft = minutes * 60;
  meditationTotalTime = meditationTimeLeft;
  meditationPaused = false;

  // Play start bell if enabled
  if (startBell) {
    playMeditationBell();
  }

  // Update UI
  document.getElementById("meditation-status").textContent = "Meditating...";
  document.getElementById("startMeditation").textContent = "🧘‍♀️ Meditating";
  document.getElementById("startMeditation").disabled = true;
  document.getElementById("pauseMeditation").disabled = false;
  document.getElementById("resetMeditation").disabled = false;

  // Start timer
  meditationTimer = setInterval(() => {
    if (!meditationPaused && meditationTimeLeft > 0) {
      meditationTimeLeft--;
      updateMeditationDisplay();
      updateMeditationProgress();

      if (meditationTimeLeft === 0) {
        finishMeditation();
      }
    }
  }, 1000);

  updateMeditationDisplay();
  updateMeditationProgress();
}

function finishMeditation() {
  const endGong = document.getElementById("endGong").checked;

  clearInterval(meditationTimer);
  meditationTimer = null;

  // Play end gong if enabled
  if (endGong) {
    playMeditationGong();
  }

  // Update UI
  document.getElementById("meditation-status").textContent =
    "Meditation complete! 🙏";
  document.getElementById("meditationDisplay").textContent = "00:00";
  document.getElementById("startMeditation").textContent =
    "🧘‍♀️ Start Meditation";
  document.getElementById("startMeditation").disabled = false;
  document.getElementById("pauseMeditation").disabled = true;
  document.getElementById("resetMeditation").disabled = true;

  // Reset progress circle
  document.getElementById("meditationProgress").style.strokeDashoffset = 0;
}

function pauseMeditation() {
  const pauseBtn = document.getElementById("pauseMeditation");

  meditationPaused = !meditationPaused;

  if (meditationPaused) {
    pauseBtn.textContent = "Resume";
    document.getElementById("meditation-status").textContent = "Paused";
  } else {
    pauseBtn.textContent = "Pause";
    document.getElementById("meditation-status").textContent = "Meditating...";
  }
}

function resetMeditation() {
  if (meditationTimer) {
    clearInterval(meditationTimer);
    meditationTimer = null;
  }

  meditationPaused = false;

  // Reset to initial time
  const minutes = parseInt(document.getElementById("meditationMinutes").value);
  meditationTimeLeft = minutes * 60;
  meditationTotalTime = meditationTimeLeft;

  // Update UI
  updateMeditationDisplay();
  document.getElementById("meditation-status").textContent = "Ready to begin";
  document.getElementById("startMeditation").textContent =
    "🧘‍♀️ Start Meditation";
  document.getElementById("startMeditation").disabled = false;
  document.getElementById("pauseMeditation").textContent = "Pause";
  document.getElementById("pauseMeditation").disabled = true;
  document.getElementById("resetMeditation").disabled = true;

  // Reset progress circle
  document.getElementById("meditationProgress").style.strokeDashoffset = 0;
}

// Initialize meditation timer display on page load
document.addEventListener("DOMContentLoaded", function () {
  const minutes = parseInt(document.getElementById("meditationMinutes").value);
  meditationTimeLeft = minutes * 60;
  meditationTotalTime = meditationTimeLeft;
  updateMeditationDisplay();
});

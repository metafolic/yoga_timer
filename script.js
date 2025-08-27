// Pause the timer and update UI
function pauseTimer() {
  clockPaused = !clockPaused;
  setClockState(clockPaused ? "paused" : "running");
  // Optionally update button text
  const pauseBtn = document.getElementById("pauseBtn");
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
  circle.classList.remove("running", "paused", "done");
  circle.classList.add(state);

  // Match background color to clock face color
  if (state === "running") {
    timerContainer.style.background = "#E5EDFF";
  } else if (state === "paused") {
    timerContainer.style.background = "#FFEED9";
  } else if (state === "done") {
    timerContainer.style.background = "#a0bda1";
  } else {
    timerContainer.style.background = "transparent";
  }
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

        // Re-enable start button when timer completes
        const startBtn = document.getElementById("start-yin");
        startBtn.disabled = false;
        startBtn.textContent = "Start Yin Practice";
      }
    }
  }, 1000);
}

function resetTimer() {
  clockTimeLeft = clockTotalTime;
  if (clockTimerInterval) clearInterval(clockTimerInterval);
  updateClockFace();
  updateTimerDisplay();
  clockPaused = true;
  setClockState("paused");

  // Update pause button text to 'Resume'
  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) {
    pauseBtn.textContent = "Resume";
  }

  // Re-enable start button when timer is reset
  const startBtn = document.getElementById("start-yin");
  startBtn.disabled = false;
  startBtn.textContent = "Start Yin Practice";
}

// Call this function to start the clock timer using sum (in minutes)
function startYinPractice() {
  calculateYinLength();
  if (typeof sum === "undefined" || sum <= 0) {
    alert(
      "Please enter valid values and calculate the total length before starting the Yin practice."
    );
    return;
  }

  // Remove focus from the button and disable it during timer
  const startBtn = document.getElementById("start-yin");
  startBtn.blur();
  startBtn.disabled = true;
  startBtn.textContent = "Practice in Progress...";

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
    alert(
      "Please enter valid, positive numbers for all fields. Number of Yin Poses must be a whole number."
    );
    document.getElementById("totalLengthOutput").textContent = 0;
    sum = 0;
    return;
  }
  const posesNum = Number(poses);
  const lengthBetweenNum = Number(lengthBetween);
  const lengthHoldNum = Number(lengthHold);
  sum = (lengthBetweenNum + lengthHoldNum) * posesNum;
  // Update the output span
  document.getElementById("totalLengthOutput").textContent = sum;
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

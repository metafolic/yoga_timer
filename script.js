let sum = 0; // Define sum in the global scope

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
    console.error("Invalid input: Please enter a valid number.");
  }
  // Example: document.getElementById('errorMessage').textContent = "Please enter a number.";
  else {
    return !isNaN(num) && num > 0;
  }
}

function calculateYinLength() {
  document.getElementById("errorMessage").textContent = ""; // Clear error message
  const { poses, lengthBetween, lengthHold } = getInputValues();
  // Use poses, lengthBetween, lengthHold for your calculation

  // Validate inputs
  if (
    !isNonNegativeWholeNumber(poses) ||
    !isNonNegativeNumber(lengthBetween) ||
    !isNonNegativeNumber(lengthHold)
  ) {
    document.getElementById("errorMessage").textContent =
      "Please enter valid, positive numbers for all fields. Poses must be a whole number.";
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

function calculateTime() {
  let seconds = sum * 60;
}

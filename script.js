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
  const { poses, lengthBetween, lengthHold } = getInputValues();
  // Use poses, lengthBetween, lengthHold for your calculation
  const posesNum = Number(poses);
  const lengthBetweenNum = Number(lengthBetween);
  const lengthHoldNum = Number(lengthHold);
  const sum = (lengthBetweenNum + lengthHoldNum) * posesNum;
  // Update the output span
  document.getElementById("totalLengthOutput").textContent = sum;
}

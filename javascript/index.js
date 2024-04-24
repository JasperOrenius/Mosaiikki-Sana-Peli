document.addEventListener("DOMContentLoaded", function() {
    var instructions = document.getElementById("instructions");
    instructions.style.display = "none";
  });
  function showInstructions() {
    var instructions = document.getElementById("instructions");
    instructions.style.display = instructions.style.display === "none" ? "block" : "none";
  }
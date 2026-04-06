function appendToDisplay(value) {
    const display = document.getElementById("display");
    display.textContent += value;
}

function clearDisplay() {
    const display = document.getElementById("display");
    display.textContent = "";
}

function calculate() {
    const display = document.getElementById("display");
    try {
        display.textContent = eval(display.textContent);
    } catch (error) {
        display.textContent = "Error";
    }
}

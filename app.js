const RANDOM_QUOTE_API_URL = "https://api.quotable.io/random";
const container = document.getElementById("container");
const quoteDisplayElement = document.getElementById("quoteDisplay");
const timerElement = document.getElementById("timer");
const wpmElement = document.getElementById("wpm");
const glow = document.getElementById("glow");
const rule = document.getElementById("footer-container");
let loading = document.getElementById("loading");
let timeWrapper = document.querySelectorAll(".time-wrapper");
let reset = document.getElementById("reset-logo");
let result = document.getElementById("result");
let logoImage = document.getElementById("logo-image");

var timerID;
var isTimerStated = false;
var quote = "";
var currentIndex = 0;
var strokes;
var glowID;
var span;
let spanId;
var loaded = false;
let focusContainer = false;
let time = 30;
let clickedTime = false;
let displayPopup = false;
let resetFocus = false;

let cursorDiv = document.createElement("div");
cursorDiv.setAttribute("id", "cursor");
rule.classList.add("hidden");
document.getElementById("reset-popup").classList.add("hidden");
document.getElementById("reset-arrow").classList.add("hidden");
result.classList.add("hidden");


logoImage.addEventListener("click", () => {
    clickedTime = true;
    location.reload(true);
});

(function () {
    timeWrapper.forEach((elem) => {
        elem.addEventListener("click", () => {
            if (!displayPopup) {
                stopTimer();
                // console.log(document.getElementsByClassName("time-wrapper"));
                // console.log(document.getElementById("timer"));
                document.getElementsByClassName("default-time")[0].classList.remove("default-time");
                elem.classList.add("default-time");
                time = parseInt(elem.innerText);
                clickedTime = true;
                currentIndex = 0;
                renderNewQuote(true);
            }
        })
    });
})();

reset.addEventListener("mouseenter", () => {
    document.getElementById("reset-popup").classList.remove("hidden");
    document.getElementById("reset-arrow").classList.remove("hidden");
});

reset.addEventListener("mouseleave", () => {
    document.getElementById("reset-popup").classList.add("hidden");
    document.getElementById("reset-arrow").classList.add("hidden");
});

reset.addEventListener("click", () => {
    document.getElementById("reset-popup").classList.add("hidden");
    document.getElementById("reset-arrow").classList.add("hidden");
    rule.classList.add("hidden");
    resetFocus = false;
    document.activeElement.blur();
    displayPopup = false;
    result.classList.remove("transform");
    container.classList.remove("blur");
    result.classList.add("hidden");
    clickedTime = true;
    currentIndex = 0;
    renderNewQuote(true);
})

window.addEventListener("click", (e) => {
    document.getElementById("reset-popup").classList.add("hidden");
    document.getElementById("reset-arrow").classList.add("hidden");
    resetFocus = false;
    if (document.getElementById("container").contains(e.target)) {
        if (!displayPopup) {
            focusContainer = true;
            rule.classList.add("hidden");
            // if (!isTimerStated) {
            container.classList.add("container-focus");
            container.classList.remove("blur");
            spanId = "span" + currentIndex;
            span = document.getElementById(spanId);
            span.appendChild(cursorDiv);
            // console.log(span);
            // startTimer();
            // }
        }
    } else {
        if (!displayPopup) {
            if (!clickedTime) {
                focusContainer = false;
                if (span)
                    span.removeChild(cursorDiv);
                container.classList.remove("container-focus");
                rule.classList.remove("hidden");
                glow.classList.add("hidden");
                container.classList.remove("container-glow");
                container.classList.add("blur");
                // timerElement.innerText = 0;
                // stopTimer();
                // currentIndex = 0;
                // quoteDisplayElement.childNodes.forEach((node) => {
                //     node.classList.remove("correct");
                //     node.classList.remove("incorrect");
                // });
            }
        }
        clickedTime = false;
    }
});

function calcualtewpm() {
    wpmElement.innerText = Math.round(
        parseFloat(correctStrokes()) / 5.0 / (parseFloat(time) / 60.0)
    );
    // console.log("wpm", correctStrokes(), getTimerTime());
}

function calculateacc() {
    // console.log(currentIndex, correctStrokes());
    document.getElementById("acc").innerText = Math.round(
        parseFloat((correctStrokes() / currentIndex) * 100.0)
    ) + "%";
}

window.addEventListener("keydown", (e) => {
    console.log(e.keyCode);
    if (e.keyCode == 13) {
        document.activeElement.click();
        return
    }
    if (e.keyCode == 9) {
        e.preventDefault();
        reset.focus();
        document.getElementById("reset-popup").classList.remove("hidden");
        document.getElementById("reset-arrow").classList.remove("hidden");
        focusContainer = false;
        resetFocus = true;
        if (span)
            span.removeChild(cursorDiv);
        container.classList.remove("container-focus");
        rule.classList.remove("hidden");
        glow.classList.add("hidden");
        container.classList.remove("container-glow");
        container.classList.add("blur");
        return;
    }
    if (e.keyCode == 122)
        return;
    e.preventDefault();
    document.getElementById("reset-popup").classList.add("hidden");
    document.getElementById("reset-arrow").classList.add("hidden");
    resetFocus = false;
    document.activeElement.blur();
    if (!focusContainer) {
        load();
        return;
    }
    if (loaded) {

        if (!isTimerStated) {
            startTimer();
        }
        if (isTimerStated) {
            clearTimeout(glowID);
            glow.classList.remove("hidden");
            container.classList.add("container-glow");
            glowTimer();
            var charCode = e.keyCode;
            if (
                (charCode > 64 && charCode < 91) ||
                (charCode > 96 && charCode < 123) ||
                charCode === 32 ||
                charCode === 188 ||
                charCode === 186 ||
                charCode === 222 ||
                charCode === 190 ||
                charCode === 191 ||
                charCode === 49 ||
                charCode === 189
            ) {
                if (quote[currentIndex] == e.key) {
                    quoteDisplayElement.childNodes[currentIndex].classList.add("correct");
                    quoteDisplayElement.childNodes[currentIndex].classList.remove(
                        "incorrect"
                    );
                    strokes[currentIndex] = 1;
                } else {
                    quoteDisplayElement.childNodes[currentIndex].classList.add("incorrect");
                    quoteDisplayElement.childNodes[currentIndex].classList.remove(
                        "correct"
                    );
                    strokes[currentIndex] = 0;
                }
                if (span)
                    span.removeChild(cursorDiv);
                currentIndex++;
                spanId = "span" + currentIndex;
                span = document.getElementById(spanId);
                if (currentIndex !== quote.length)
                    span.appendChild(cursorDiv);
                if (currentIndex === quote.length) {
                    calcualtewpm();
                    calculateacc();
                    currentIndex = 0;
                    popup();
                }
            } else if (charCode === 8) {
                if (currentIndex === 0) return;
                span.removeChild(cursorDiv);
                currentIndex--;
                spanId = "span" + currentIndex;
                span = document.getElementById(spanId);
                span.appendChild(cursorDiv);
                quoteDisplayElement.childNodes[currentIndex].classList.remove("correct");
                quoteDisplayElement.childNodes[currentIndex].classList.remove(
                    "incorrect"
                );
            } else {
                console.log("not a key");
            }
        }
    }
});

const getRandomQuote = () => {
    return fetch(RANDOM_QUOTE_API_URL)
        .then((response) => response.json())
        .then((data) => data.content);
};

function correctStrokes() {
    let count = 0;
    strokes.forEach((stroke) => {
        if (stroke) count++;
    });
    return count;
}

const renderNewQuote = async (flag) => {
    loaded = false;
    stopTimer();
    if (!isTimerStated)
        timerElement.classList.add("hidden");
    if (true)
        quoteDisplayElement.innerHTML = "";
    loading.classList.remove("hidden");
    let id = 0;
    quote = "";
    while (quote.length < 500) {
        quote = quote + await getRandomQuote() + " ";
        quote = quote.toLowerCase();
        quote = quote.replaceAll(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "");
    }
    quote = quote.slice(0, -1) + ".";
    if (isTimerStated) {
        stopTimer();
        // startTimer();
    }
    currentIndex = 0;
    strokes = new Array(quote.length);
    strokes.fill(0);
    quoteDisplayElement.innerHTML = "";
    loading.classList.add("hidden");
    quote.split("").forEach((char) => {
        const charSpan = document.createElement("span");
        charSpan.innerText = char;
        charSpan.style.fontSize = "0.6rem";
        charSpan.setAttribute("id", "span" + id);
        charSpan.style.position = "relative";
        // console.log("span" + id);
        id++;
        quoteDisplayElement.appendChild(charSpan);
    });

    spanId = "span" + 0;
    span = document.getElementById(spanId);
    if (flag)
        span.appendChild(cursorDiv);
    loaded = true;
    load();
};

let startTime;
function startTimer() {
    isTimerStated = true;
    timerElement.classList.remove("hidden");
    timerElement.innerText = time;
    startTime = new Date();
    timerID = setInterval(() => {
        timerElement.innerText = time - parseInt(getTimerTime());
        if (timerElement.innerText == 0) {
            stopTimer();
            calcualtewpm();
            calculateacc();
            currentIndex = 0;
            popup();
        }
    }, 1000);
}

function getTimerTime() {
    return Math.floor((new Date() - startTime) / 1000);
}
function stopTimer() {
    isTimerStated = false;
    clearInterval(timerID);
}

function glowTimer() {
    clearTimeout(glowID);
    glowID = setTimeout(() => {
        glow.classList.add("hidden");
        container.classList.remove("container-glow");
    }, 300)
}

renderNewQuote(false);

let load = function () {
    container.click();
}

let popup = function () {
    stopTimer();
    focusContainer = false;
    if (span && !resetFocus)
        span.removeChild(cursorDiv);
    document.activeElement.blur();
    document.getElementById("reset-popup").classList.add("hidden");
    document.getElementById("reset-arrow").classList.add("hidden");
    timerElement.classList.add("hidden");
    container.classList.remove("container-focus");
    glow.classList.add("hidden");
    container.classList.remove("container-glow");
    container.classList.add("blur");
    result.classList.remove("hidden");
    // result.style.transform = "scale(1)";
    result.classList.add("transform");
    displayPopup = true;
}
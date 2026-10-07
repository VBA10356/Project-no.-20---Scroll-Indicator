const progressBar = document.getElementById("progressBar");
const badge = document.getElementById("badge");
const fullscreenButton = document.getElementById("fullscreenButton");
const themeButtons = document.querySelectorAll("[data-theme-choice]");
const writingCanvas = document.getElementById("writingCanvas");
const penColor = document.getElementById("penColor");
const penSize = document.getElementById("penSize");
const penSizeValue = document.getElementById("penSizeValue");
const clearCanvasButton = document.getElementById("clearCanvas");
const noteForm = document.getElementById("noteForm");
const noteInput = document.getElementById("noteInput");
const notesList = document.getElementById("notesList");
const notesEmpty = document.getElementById("notesEmpty");
const clearNotesButton = document.getElementById("clearNotes");
const drawingContext = writingCanvas.getContext("2d");
const strokes = [];
let activeStroke = null;

function redrawCanvas() {
    const bounds = writingCanvas.getBoundingClientRect();
    drawingContext.clearRect(0, 0, bounds.width, bounds.height);

    strokes.forEach((stroke) => {
        drawingContext.beginPath();
        drawingContext.strokeStyle = stroke.color;
        drawingContext.fillStyle = stroke.color;
        drawingContext.lineWidth = stroke.size;
        drawingContext.lineCap = "round";
        drawingContext.lineJoin = "round";

        const firstPoint = stroke.points[0];
        const firstX = firstPoint.x * bounds.width;
        const firstY = firstPoint.y * bounds.height;
        drawingContext.moveTo(firstX, firstY);

        if (stroke.points.length === 1) {
            drawingContext.arc(firstX, firstY, stroke.size / 2, 0, Math.PI * 2);
            drawingContext.fill();
        } else {
            stroke.points.slice(1).forEach((point) => {
                drawingContext.lineTo(point.x * bounds.width, point.y * bounds.height);
            });
            drawingContext.stroke();
        }
    });
}

function resizeCanvas() {
    const bounds = writingCanvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    writingCanvas.width = Math.round(bounds.width * pixelRatio);
    writingCanvas.height = Math.round(bounds.height * pixelRatio);
    drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    redrawCanvas();
}

function getCanvasPoint(event) {
    const bounds = writingCanvas.getBoundingClientRect();
    return {
        x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
        y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
    };
}

function drawPoint(stroke, point) {
    const bounds = writingCanvas.getBoundingClientRect();
    const previousPoint = stroke.points[stroke.points.length - 1];
    stroke.points.push(point);
    drawingContext.beginPath();
    drawingContext.strokeStyle = stroke.color;
    drawingContext.fillStyle = stroke.color;
    drawingContext.lineWidth = stroke.size;
    drawingContext.lineCap = "round";
    drawingContext.lineJoin = "round";

    if (previousPoint) {
        drawingContext.moveTo(previousPoint.x * bounds.width, previousPoint.y * bounds.height);
        drawingContext.lineTo(point.x * bounds.width, point.y * bounds.height);
        drawingContext.stroke();
    } else {
        drawingContext.arc(point.x * bounds.width, point.y * bounds.height, stroke.size / 2, 0, Math.PI * 2);
        drawingContext.fill();
    }
}

writingCanvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    writingCanvas.setPointerCapture(event.pointerId);
    activeStroke = { color: penColor.value, size: Number(penSize.value), points: [] };
    strokes.push(activeStroke);
    drawPoint(activeStroke, getCanvasPoint(event));
});

writingCanvas.addEventListener("pointermove", (event) => {
    if (activeStroke) drawPoint(activeStroke, getCanvasPoint(event));
});

function finishStroke() {
    activeStroke = null;
}

writingCanvas.addEventListener("pointerup", finishStroke);
writingCanvas.addEventListener("pointercancel", finishStroke);
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

penSize.addEventListener("input", () => {
    penSizeValue.value = `${penSize.value} px`;
});

clearCanvasButton.addEventListener("click", () => {
    strokes.length = 0;
    redrawCanvas();
});

function updateNotesState() {
    const hasNotes = notesList.childElementCount > 0;
    notesEmpty.hidden = hasNotes;
    clearNotesButton.disabled = !hasNotes;
}

function addNote(text) {
    const note = document.createElement("li");
    const noteText = document.createElement("p");
    const removeButton = document.createElement("button");

    note.className = "note-item";
    noteText.className = "note-text";
    noteText.textContent = text;
    removeButton.className = "note-remove";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", "Remove note");
    removeButton.addEventListener("click", () => {
        note.remove();
        updateNotesState();
    });

    note.append(noteText, removeButton);
    notesList.append(note);
    updateNotesState();
}

noteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = noteInput.value.trim();
    if (!text) return;
    addNote(text);
    noteInput.value = "";
    noteInput.focus();
});

clearNotesButton.addEventListener("click", () => {
    notesList.replaceChildren();
    updateNotesState();
});

function setReadingTheme(theme) {
    document.body.dataset.theme = theme;
    themeButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme));
    });
    try {
        localStorage.setItem("readingTheme", theme);
    } catch {
        // Theme switching still works when storage is unavailable.
    }
}

let savedTheme;
try {
    savedTheme = localStorage.getItem("readingTheme");
} catch {
    savedTheme = null;
}
const validThemes = ["light", "green", "yellow", "sepia"];
setReadingTheme(validThemes.includes(savedTheme) ? savedTheme : "light");

themeButtons.forEach((button) => {
    button.addEventListener("click", () => setReadingTheme(button.dataset.themeChoice));
});

fullscreenButton.addEventListener("click", async () => {
    if (document.fullscreenElement) {
        await document.exitFullscreen();
    } else {
        await document.documentElement.requestFullscreen();
    }
});

document.addEventListener("fullscreenchange", () => {
    const isFullscreen = Boolean(document.fullscreenElement);
    fullscreenButton.textContent = isFullscreen ? "Exit fullscreen" : "Fullscreen";
    fullscreenButton.setAttribute("aria-label", isFullscreen ? "Exit fullscreen" : "Enter fullscreen");
});

function updateProgress() {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const progress = Math.round((scrollTop/docHeight)*100)
    progressBar.style.width = progress+"%";
    badge.textContent = progress + "% read"

    if (progress >=100) {
        badge.classList.add("complete");
        badge.innerText = "completed";

    } else {
        badge.classList.remove("complete");
    }

}


window.addEventListener("scroll", updateProgress)

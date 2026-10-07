const progressBar = document.getElementById("progressBar");
const badge = document.getElementById("badge");
const fullscreenButton = document.getElementById("fullscreenButton");

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

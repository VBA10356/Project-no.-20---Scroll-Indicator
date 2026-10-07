const progressBar = document.getElementById("progressBar");
const badge = document.getElementById("badge");

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

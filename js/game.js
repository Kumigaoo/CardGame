// Recupera el nom del jugador i el color de fons
const playerName = document.cookie
    .split("; ")
    .find(row => row.startsWith("playerName="))
    ?.split("=")[1];

const backgroundColor = sessionStorage.getItem("backgroundColor");
if (backgroundColor) {
    document.body.style.backgroundColor = backgroundColor;
}

const channel = new BroadcastChannel("game_channel");

if (!localStorage.getItem("gameInProgress")) {
    alert("No hi ha cap partida activa. Tancant...");
    window.close();
}

// Configura la graella del joc
const grid = document.getElementById("gameGrid");
const cards = Array.from({ length: 20 }, (_, i) => i % 10).sort(() => Math.random() - 0.5);
let firstCard = null;
let score = 0;

cards.forEach((card,i) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.dataset.cardValue = card;
    div.textContent = "?";
    div.addEventListener("click", () => flipCard(div));
    grid.appendChild(div);
});

document.getElementById("playerInfo").textContent = `Jugador: ${playerName}, Punts: 0`;
/**
 * Gira una carta i comprova si hi ha una parella
 */
function flipCard(card) {
    if (card.textContent !== "?") return;

    card.textContent = card.dataset.cardValue;

    if (!firstCard) {
        firstCard = card;
    } else {
        if (firstCard.dataset.cardValue === card.dataset.cardValue) {
            score += 10;
            channel.postMessage({ action: "updateScore", playerName, score });
            document.getElementById("playerInfo").textContent = `Jugador: ${playerName}, Punts: ${score}`;
            firstCard = null;
        } else {
            score -= 3;
            channel.postMessage({ action: "updateScore", playerName, score });
            document.getElementById("playerInfo").textContent = `Jugador: ${playerName}, Punts: ${score}`;
            setTimeout(() => {
                card.textContent = "?";
                firstCard.textContent = "?";
                firstCard = null;
            }, 1000);
        }
    }

    // Comprova si la partida ha acabat
    if (Array.from(document.querySelectorAll(".card")).every(c => c.textContent !== "?")) {
        const highScore = JSON.parse(localStorage.getItem("highScore")) || { score: 0 };
        if (score > highScore.score) {
            localStorage.setItem("highScore", JSON.stringify({ player: playerName, score }));
            channel.postMessage({ action: "highScore", player: playerName, score });
        }
        channel.postMessage({action:"endGame", score, player: playerName})
        alert("Partida finalitzada!" );
        localStorage.removeItem("gameInProgress");
        window.close();
    }
}

// Escolta el final de la partida
channel.onmessage = (event) => {
    if (event.data.action === "end") {
        alert("Partida finalitzada!");
        window.close();
    }
};

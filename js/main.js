// Mostra la informació del navegador i la URL a la pantalla inicial
document.getElementById("browserInfo").textContent = navigator.userAgent;
document.getElementById("urlInfo").textContent = window.location.href;

// Configura el color de fons segons el navegador
const browser = navigator.userAgent.toLowerCase();
if (browser.includes("firefox")) {
    document.body.style.backgroundColor = "orange";
    sessionStorage.setItem("backgroundColor", "orange");
} else if (browser.includes("chrome")) {
    document.body.style.backgroundColor = "green";
    sessionStorage.setItem("backgroundColor", "green");
}

// Configura els botons
document.getElementById("startGame").addEventListener("click", startGame);
document.getElementById("deleteGame").addEventListener("click", deleteGame);
document.getElementById("instructions").addEventListener("click", showInstructions);

// Mostra el nom del jugador si existeix una cookie
const playerCookie = document.cookie
    .split("; ")
    .find(row => row.startsWith("playerName="))
    ?.split("=")[1];
if (playerCookie) {
    document.getElementById("playerName").value = playerCookie;
}

// Guarda la millor puntuació si existeix
const highScore = localStorage.getItem("highScore");
if (highScore) {
    const highScoreData = JSON.parse(highScore);
    document.getElementById("highScore").textContent = `Jugador: ${highScoreData.player}, Punts: ${highScoreData.score}`;
}

/**
 * Funció per començar una nova partida
 */
function startGame() {
    const playerName = document.getElementById("playerName").value;

    if (!playerName) {
        alert("Has d'informar un nom per poder començar la partida.");
        return;
    }

    // Guarda el nom del jugador en una cookie
    document.cookie = `playerName=${playerName}; path=/`;

    if (localStorage.getItem("gameInProgress")) {
        alert("Ja hi ha una partida començada!");
        return;
    }
    // Marca la partida com a activa
    localStorage.setItem("gameInProgress", "true");

    // Obre la finestra del joc
    const gameWindow = window.open("game.html", "Joc de les Parelles", "width=500,height=700");

    // Configura el canal de comunicació
    const channel = new BroadcastChannel("game_channel");
    channel.postMessage({ action: "start", playerName });

    document.getElementById("currentScore").textContent = `Jugador: ${playerName}, Punts: 0 ESTAT PARTIDA: En joc`
    // Actualitza la puntuació en temps real
    channel.onmessage = (event) => {
        if (event.data.action === "updateScore") {
            document.getElementById("currentScore").textContent = `Jugador: ${event.data.playerName}, Punts: ${event.data.score},ESTAT PARTIDA: En joc`;
        }
        if(event.data.action ==="endgame"){
            document.getElementById("currentScore").textContent = `Jugador: ${event.data.playerName}, Punts: ${event.data.score},ESTAT PARTIDA: Joc finalitzat`;
        }

        if (event.data.action === "highScore") {
            document.getElementById("highScore").textContent = `Jugador: ${event.data.player}, Punts: ${event.data.score}`;
        }
    };
}

/**
 * Funció per esborrar la partida actual
 */
function deleteGame() {
    if (!localStorage.getItem("gameInProgress")) {
        alert("No hi ha cap partida per esborrar.");
        return;
    }

    localStorage.removeItem("gameInProgress");
    document.getElementById("currentScore").textContent = "No hi ha cap partida en joc";

    const channel = new BroadcastChannel("game_channel");
    channel.postMessage({ action: "end" });

    channel.close();
}

/**
 * Mostra una finestra amb les instruccions
 */
function showInstructions() {
    const instructionsWindow = window.open("", "Instruccions", "width=400,height=400");
    instructionsWindow.document.write(`
        <h1>Instruccions del Joc</h1>
        <p>Has d'encertar les parelles de cartes. Cada vegada que encertis una parella, sumaràs 10 punts. Si no encertes, es restaran 3 punts.</p>
        <button onclick="window.close()">Tanca la finestra</button>
    `);
}

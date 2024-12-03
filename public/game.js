// Show the modal on page load

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("instructions-modal");
  const startGameButton = document.getElementById("start-game");
  const playButton = document.getElementById("play-btn");

  // Add event listener to the Start Game button
  startGameButton.addEventListener("click", () => {
    modal.style.display = "none"; // Hide the modal
    playButton.disabled = false; // Enable the Play button
  });
});

class Tile {
  constructor(name, points, type, translation) {
    this.name = name; // Chinese name
    this.points = points; // Tile points
    this.type = type; // Tile type (character, dot, bamboo)
    this.translation = translation; // English translation
  }
}

// Define the pool of tiles
const tiles = [
  new Tile("1万", 1, "character", "1 character"),
  new Tile("2万", 2, "character", "2 characters"),
  new Tile("3万", 3, "character", "3 characters"),
  new Tile("4万", 4, "character", "4 characters"),
  new Tile("5万", 5, "character", "5 characters"),
  new Tile("6万", 6, "character", "6 characters"),
  new Tile("7万", 7, "character", "7 characters"),
  new Tile("8万", 8, "character", "8 characters"),
  new Tile("9万", 9, "character", "9 characters"),
  new Tile("1筒", 1, "dot", "1 dot"),
  new Tile("2筒", 2, "dot", "2 dots"),
  new Tile("3筒", 3, "dot", "3 dots"),
  new Tile("4筒", 4, "dot", "4 dots"),
  new Tile("5筒", 5, "dot", "5 dots"),
  new Tile("6筒", 6, "dot", "6 dots"),
  new Tile("7筒", 7, "dot", "7 dots"),
  new Tile("8筒", 8, "dot", "8 dots"),
  new Tile("9筒", 9, "dot", "9 dots"),
  new Tile("1条", 1, "bamboo", "1 bamboo"),
  new Tile("2条", 2, "bamboo", "2 bamboos"),
  new Tile("3条", 3, "bamboo", "3 bamboos"),
  new Tile("4条", 4, "bamboo", "4 bamboos"),
  new Tile("5条", 5, "bamboo", "5 bamboos"),
  new Tile("6条", 6, "bamboo", "6 bamboos"),
  new Tile("7条", 7, "bamboo", "7 bamboos"),
  new Tile("8条", 8, "bamboo", "8 bamboos"),
  new Tile("9条", 9, "bamboo", "9 bamboos")
];

// Game state
let playerTiles = [];
let timeLeft = 60;
let gameActive = false;

// Get random tiles from the pool
function getRandomTiles(count) {
  const selectedTiles = [];
  for (let i = 0; i < count; i++) {
    selectedTiles.push(tiles[Math.floor(Math.random() * tiles.length)]);
  }
  return selectedTiles;
}

// Calculate the score based on the groups
function calculateScore(groups) {
  let totalScore = 0;
  let keziCount = 0;
  let shunziCount = 0;
  let duizi = false;

  // Evaluate the first 4 groups of 3 tiles
  for (let i = 0; i < 4; i++) {
    const group = groups[i];
    const points = group.map((tile) => tile.points);
    const types = group.map((tile) => tile.type);

    const isKezi = group.every(
      (tile) =>
        tile.name === group[0].name &&
        tile.type === group[0].type &&
        tile.points === group[0].points
    );

    const isShunzi =
      types.every((type) => type === types[0]) &&
      points.sort((a, b) => a - b).every((val, idx, arr) => idx === 0 || val === arr[idx - 1] + 1);

    let groupScore = points.reduce((sum, point) => sum + point, 0);
    if (isKezi) {
      groupScore *= 2;
      keziCount++;
    } else if (isShunzi) {
      groupScore *= 2;
      shunziCount++;
    }

    totalScore += groupScore;
  }

  // Evaluate the last group of 2 tiles for Duizi
  const lastGroup = groups[4];
  if (
    lastGroup.length === 2 &&
    lastGroup[0].name === lastGroup[1].name &&
    lastGroup[0].type === lastGroup[1].type &&
    lastGroup[0].points === lastGroup[1].points
  ) {
    duizi = true;
    totalScore += (lastGroup[0].points + lastGroup[1].points) * 2;
  } else {
    totalScore += lastGroup.reduce((sum, tile) => sum + tile.points, 0);
  }

  // Check for the winning condition (Hu)
  const hu =
    keziCount + shunziCount === 4 && duizi
      ? "You have reached Hu! (Winning Pattern)"
      : "You haven't reached Hu yet.";

  if (hu.includes("Hu")) {
    totalScore *= 2; // Double the score if Hu is reached
  }

  return {
    message: `Congratulations, you have formed ${shunziCount} Shunzi, ${keziCount} Kezi, ${
      duizi ? 1 : 0
    } Duizi. ${hu} Your total score is: ${totalScore} (Score is ${
      hu.includes("Hu") ? "doubled for Hu!" : "calculated normally."
    })`,
    totalScore,
    hu
  };
}

// Render the board and tiles
function renderBoard() {
  const gameBoard = document.getElementById("game-board");
  gameBoard.innerHTML = "";

  const groups = [];
  for (let i = 0; i < 5; i++) {
    const groupSize = i < 4 ? 3 : 2;
    groups.push(playerTiles.slice(i * 3, i * 3 + groupSize));
  }

  groups.forEach((group, groupIndex) => {
    const groupDiv = document.createElement("div");
    groupDiv.classList.add("segment");

    group.forEach((tile, tileIndex) => {
      const tileDiv = document.createElement("div");
      tileDiv.classList.add("tile");
      tileDiv.innerHTML = `<strong>${tile.name}</strong><br>${tile.translation}`;
      if (gameActive) {
        tileDiv.addEventListener("click", () => {
          const tilePosition = groupIndex * 3 + tileIndex; // Calculate tile position
          playerTiles[tilePosition] = tiles[Math.floor(Math.random() * tiles.length)];
          renderBoard(); // Rerender board after tile change
        });
      }
      groupDiv.appendChild(tileDiv);
    });

    gameBoard.appendChild(groupDiv);

    if (groupIndex < 4) {
      const divider = document.createElement("div");
      divider.classList.add("divider");
      gameBoard.appendChild(divider);
    }
  });

  if (!gameActive) {
    const score = calculateScore(groups);
    document.getElementById("score-message").textContent = score.message;
  }
}

// Timer functionality
function startTimer() {
  const timerElement = document.getElementById("timer");
  const interval = setInterval(() => {
    if (!gameActive) {
      clearInterval(interval);
      return;
    }
    timeLeft--;
    timerElement.textContent = `Time Left: ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(interval);
      gameActive = false;
      renderBoard(); 
      // calculating score
      const groups = [];
      for (let i = 0; i < 5; i++) {
        const groupSize = i < 4 ? 3 : 2; 
        groups.push(playerTiles.slice(i * 3, i * 3 + groupSize));
      }

      // get score
      const { totalScore } = calculateScore(groups);

      // submit score
      submitScore(totalScore);
    }
  }, 1000);
}

// Initialize game on Play button click
document.getElementById("play-btn").addEventListener("click", () => {
  playerTiles = getRandomTiles(14); // Generate 14 random tiles
  timeLeft = 5; // Reset timer
  gameActive = true;
  renderBoard();
  startTimer();
});

function submitScore(score) {
  fetch('/submit-score', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ score }), // sending score
  })
      .then(response => response.json())
      .then(data => {
          console.log('Score submitted successfully:', data);
      })
      .catch(error => {
          console.error('Error submitting score:', error);
      });
}

function fetchLeaderboard() {
  fetch('http://localhost:3000/get-scores')
    .then(response => response.json())
    .then(data => {
      const leaderboardDiv = document.getElementById('leaderboard');
      leaderboardDiv.innerHTML = '';

      const scoresList = document.createElement('ul');
      data.scores.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. Score: ${entry.score}, Time: ${entry.timeStamp}`;
        scoresList.appendChild(listItem);
      });

      leaderboardDiv.appendChild(scoresList);
    });
}
document.getElementById('view-leaderboard').addEventListener('click', fetchLeaderboard);



// Initial board rendering
renderBoard();







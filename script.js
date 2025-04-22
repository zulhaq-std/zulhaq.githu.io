const totalPlayers = 8;
const rounds = 7;
const matchesPerRound = 4;
let scheduleData = [];

document.addEventListener("DOMContentLoaded", () => {
  const otherPlayersContainer = document.getElementById("otherPlayers");
  for (let i = 2; i <= totalPlayers; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Player ${i}`;
    input.id = `player${i}`;
    otherPlayersContainer.appendChild(input);
  }
});

function generateSchedule() {
  const players = [];
  for (let i = 1; i <= totalPlayers; i++) {
    const val = document.getElementById(`player${i}`)?.value.trim();
    players.push(val || `Player ${i}`);
  }

  scheduleData = Array.from({ length: rounds }, () =>
    Array.from({ length: matchesPerRound }, () => ["", ""])
  );

  const table = document.createElement("table");
  const header = table.insertRow();
  header.innerHTML = "<th>Ronde</th>" + Array.from({ length: 4 }, (_, i) => `<th>Pertandingan ${i + 1}</th>`).join("");

  for (let r = 0; r < rounds; r++) {
    const row = table.insertRow();
    const rondeCell = row.insertCell();
    rondeCell.textContent = `Ronde ${r + 1}`;

    for (let m = 0; m < matchesPerRound; m++) {
      const cell = row.insertCell();
      if ([0, 1, 3].includes(r)) {
        const select1 = createPlayerSelect(players, r, m, 0);
        const vsText = document.createTextNode(" vs ");
        const select2 = createPlayerSelect(players, r, m, 1);
        cell.appendChild(select1);
        cell.appendChild(vsText);
        cell.appendChild(select2);
      } else {
        cell.textContent = "-";
      }
    }
  }

  const scheduleDiv = document.getElementById("scheduleTable");
  scheduleDiv.innerHTML = "";
  scheduleDiv.appendChild(table);
}

function createPlayerSelect(players, round, match, playerIndex) {
  const select = document.createElement("select");
  select.dataset.round = round;
  select.dataset.match = match;
  select.dataset.player = playerIndex;

  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = "-- Pilih --";
  select.appendChild(empty);

  players.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    select.appendChild(opt);
  });

  select.addEventListener("change", handleManualChange);
  return select;
}

function handleManualChange(e) {
  const round = parseInt(e.target.dataset.round);
  const match = parseInt(e.target.dataset.match);
  const player = parseInt(e.target.dataset.player);
  scheduleData[round][match][player] = e.target.value;

  if (isRoundFilled(0) && isRoundFilled(1)) {
    generateRound3();
    updateRoundText(2);
  }

  if (isRoundFilled(0) && isRoundFilled(1) && isRoundFilled(3)) {
    generateRemainingRounds();
    updateRoundText(4);
    updateRoundText(5);
    updateRoundText(6);
  }
}

function isRoundFilled(roundIndex) {
  return scheduleData[roundIndex].every(([a, b]) => a && b);
}

function hasPlayed(p1, p2, roundsToCheck) {
  return roundsToCheck.some(rnd =>
    scheduleData[rnd].some(([a, b]) => (a === p1 && b === p2) || (a === p2 && b === p1))
  );
}

function generateRound3() {
  const group = [...new Set(scheduleData[0].flat().concat(scheduleData[1].flat()))];
  const used = new Set();
  const newPairs = [];

  for (let p1 of group) {
    if (used.has(p1)) continue;
    for (let p2 of group) {
      if (p1 === p2 || used.has(p2)) continue;
      if (!hasPlayed(p1, p2, [0, 1])) {
        newPairs.push([p1, p2]);
        used.add(p1);
        used.add(p2);
        break;
      }
    }
  }

  for (let i = 0; i < matchesPerRound; i++) {
    scheduleData[2][i] = newPairs[i] || ["", ""];
  }
}

function generateRemainingRounds() {
  const playedPairs = new Set();
  for (let r = 0; r <= 3; r++) {
    scheduleData[r].forEach(([a, b]) => {
      if (a && b) playedPairs.add(pairKey(a, b));
    });
  }

  const players = [...new Set(scheduleData[0].flat())];
  const generatedRounds = [];

  while (generatedRounds.length < 3) {
    const used = new Set();
    const roundPairs = [];

    for (let p1 of players) {
      if (used.has(p1)) continue;
      for (let p2 of players) {
        if (p1 === p2 || used.has(p2)) continue;
        const key = pairKey(p1, p2);
        if (!playedPairs.has(key)) {
          roundPairs.push([p1, p2]);
          used.add(p1);
          used.add(p2);
          playedPairs.add(key);
          break;
        }
      }
    }

    generatedRounds.push(
      roundPairs.concat(Array(matchesPerRound - roundPairs.length).fill(["", ""]))
    );
  }

  // Tukar urutan: [7, 5, 6] → [5, 6, 7]
  scheduleData[4] = generatedRounds[2]; // Ronde 5 ← pola Ronde 7
  scheduleData[5] = generatedRounds[0]; // Ronde 6 ← pola Ronde 5
  scheduleData[6] = generatedRounds[1]; // Ronde 7 ← pola Ronde 6
}


function updateRoundText(roundIndex) {
  const row = document.querySelectorAll("#scheduleTable table tr")[roundIndex + 1];
  if (!row) return;
  for (let m = 0; m < matchesPerRound; m++) {
    const cell = row.cells[m + 1];
    cell.textContent = `${scheduleData[roundIndex][m][0]} vs ${scheduleData[roundIndex][m][1]}`;
  }
}

function pairKey(a, b) {
  return [a, b].sort().join("-");
}

function saveSchedule() {
  alert("Jadwal berhasil disimpan!");
}

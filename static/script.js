let totalTimer;
let partTimer;
let isLaunched = false;
let isPaused = false;
let partTime;
let totalTime;
let partTimes;
let partNames;

let elapsedParts;
let partsNumber = 0;

const totalTimeEl = document.getElementById("total-time");
const partTimeEl = document.getElementById("part-time");
const partNameEl = document.getElementById("part-name");
const nextPartNameEl = document.getElementById("next-part-name");
const startButton = document.getElementById("lnc-btn");
const pauseButton = document.getElementById("pse-btn");
const startTime = 3;
const beep = new Audio("static/beep2.m4a");

function deleteLine(line) {
  const parent = document.getElementById("main");
  const child = document.getElementById(line);
  parent.removeChild(child);
}

function addLine(name = "", duration = 0) {
  const lines = document.querySelectorAll(".sub-container");
  let cid = 0;
  lines.forEach((line) => {
    if (line.id > cid) {
      cid = line.id;
    }
  });
  cid++;

  const nline = document.createElement("div");
  nline.className = "sub-container";
  nline.id = cid;

  const i1 = document.createElement("input");
  i1.type = "text";
  i1.id = "name";
  i1.value = name;
  const i2 = document.createElement("input");
  i2.type = "number";
  i2.id = "time";
  i2.value = duration;

  nline.appendChild(i1);
  nline.appendChild(i2);

  const b1 = document.createElement("button");
  b1.addEventListener("click", function () {
    deleteLine(cid);
  });
  b1.innerHTML = "-";
  nline.appendChild(b1);

  const parent = document.getElementById("main");
  const btn = document.getElementById("add-btn");
  parent.insertBefore(nline, btn);
}

function launchTimer() {
  clearInterval(totalTimer);
  clearInterval(partTimer);
  elapsedParts = 0;

  const repNumber = document.getElementById("reps").value;
  const lines = document.querySelectorAll(".sub-container");

  totalTime = startTime;
  partTimes = [startTime];
  partNames = ["Préparez vous !"];
  partsNumber = 1;

  for (let i = 0; i < repNumber; i++) {
    lines.forEach((line) => {
      partTimes.push(Number(line.children[1].value));
      totalTime += Number(line.children[1].value);
      // partNames.push(line.children[0].value);
      partNames.push(`R${i + 1} ${line.children[0].value}`);
      ++partsNumber;
    });
  }

  dispTime(totalTimeEl, totalTime);
  totalTimer = setInterval(dimTotalTime, 1000);

  partTime = partTimes[0];
  dispTime(partTimeEl, partTime);
  partTimer = setInterval(dimPartTime, 1000);

  partNameEl.innerHTML = partNames[0];
  nextPartNameEl.innerHTML = "ENSUITE: " + partNames[1];

  isLaunched = true;
  isPaused = false;
  pauseButton.innerHTML = "PAUSE";
  startButton.innerHTML = "RELANCER";
}

function dispTime(el, time) {
  let minutes = parseInt(time / 60, 10);
  let seconds = parseInt(time % 60, 10);
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  el.innerHTML = minutes + ":" + seconds;
}

function stopTimer() {
  if (isLaunched) {
    isLaunched = false;
    isPaused = false;
    pauseButton.innerHTML = "PAUSE";
    startButton.innerHTML = "LANCER";
    clearInterval(totalTimer);
    clearInterval(partTimer);
    dispTime(partTimeEl, 0);
    dispTime(totalTimeEl, 0);
    nextPartNameEl.innerHTML = "-";
    partNameEl.innerHTML = "-";
  }
}

function pauseTimer() {
  if (isLaunched === true && isPaused === false) {
    try {
      clearInterval(totalTimer);
      clearInterval(partTimer);
      isPaused = true;
      pauseButton.innerHTML = "REPRENDRE";
    } catch (e) {
      console.log(e);
    }
  } else {
    if (isLaunched === true && isPaused === true) {
      partTimer = setInterval(dimPartTime, 1000);
      totalTimer = setInterval(dimTotalTime, 1000);
      isPaused = false;
      pauseButton.innerHTML = "PAUSE";
    }
  }
}

function dimTotalTime() {
  if (totalTime == 0) {
    clearInterval(totalTimer);
    isLaunched = false;
    isPaused = false;
    pauseButton.innerHTML = "PAUSE";
    startButton.innerHTML = "LANCER";
  } else {
    totalTime--;

    let minutes = parseInt(totalTime / 60, 10);
    let seconds = parseInt(totalTime % 60, 10);
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    totalTimeEl.innerHTML = minutes + ":" + seconds;
  }
}

function dimPartTime() {
  if (partTime == 0) {
    ++elapsedParts;
    if (elapsedParts == partsNumber) {
      clearInterval(partTimer);
    } else {
      partTime = partTimes[elapsedParts] - 1;
      let minutes = parseInt(partTime / 60, 10);
      let seconds = parseInt(partTime % 60, 10);
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      partTimeEl.innerHTML = minutes + ":" + seconds;
      partNameEl.innerHTML = partNames[elapsedParts];
      if (typeof partNames[elapsedParts + 1] !== "undefined") {
        nextPartNameEl.innerHTML = "ENSUITE: " + partNames[elapsedParts + 1];
      } else {
        nextPartNameEl.innerHTML = "ENSUITE: Fin";
      }
    }
  } else {
    if (partTime == 1) {
      let doSound = document.getElementById("sound-checkbox").checked;
      console.log(doSound);
      if (doSound) {
        beep.play();
      }
    }
    partTime--;
    let minutes = parseInt(partTime / 60, 10);
    let seconds = parseInt(partTime % 60, 10);
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    partTimeEl.innerHTML = minutes + ":" + seconds;
  }
}

function loadFile() {
  let input = document.createElement("input");
  input.type = "file";
  input.onchange = (e) => {
    resetProgram(false);
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    // here we tell the reader what to do when it's done reading...
    reader.onload = (readerEvent) => {
      let content = readerEvent.target.result; // this is the content!
      let exercise = JSON.parse(content);
      exercise.forEach((part) => {
        addLine(part.name, part.duration);
      });
    };
  };

  input.click();
}

function saveFile() {
  const lines = document.querySelectorAll(".sub-container");
  let fileData = [];
  lines.forEach((line) => {
    name = line.children.name.value;
    duration = line.children.time.value;
    fileData.push({ name, duration });
  });
  let fileName = prompt("Enter file name", "default.json");
  // let loc = window.location.pathname;
  // let dir = loc.substring(0, loc.lastIndexOf("/"));
  // let fullFileName = `${dir}/data/${fileName}`

  var jsonData = JSON.stringify(fileData, null, 2); // La présence de null et 2 indique l'indentation de 2 espaces pour une meilleure lisibilité

  // Créer un objet Blob qui représente les données JSON
  var blob = new Blob([jsonData], { type: "application/json" });

  // Créer un objet URL pour le Blob
  var url = URL.createObjectURL(blob);

  // Créer un élément d'ancre pour le téléchargement du fichier
  // console.log(fullFileName)

  var a = document.createElement("a");
  a.href = url;
  a.download = fileName; // Nom du fichier de sauvegarde

  // Ajouter l'élément d'ancre au DOM et déclencher le téléchargement
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function resetProgram(newLine = true) {
  const lines = document.querySelectorAll(".sub-container");

  lines.forEach((line) => {
    deleteLine(line.id);
  });
  if (newLine) {
    addLine();
  }
}

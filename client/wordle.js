'use strict';

const guessBoard = document.querySelector('.board');

const keyboard = document.querySelector('.keyboard');

const alertBoarder = document.querySelector('.alert-border');

// variables in lines 12-15 are in sync with the variables
// in line 342-348 of svr.js so that todaysDate has the
// same value as the index of wordleWords in line 349 of svr.js
const startingDate = new Date(2022, 4, 2);
const diffInMiliseconds = Date.now() - startingDate;
const diffInDays = diffInMiliseconds / 86400000;
const todaysDate = Math.floor(diffInDays);

// here i create a boolean variable that contains
// the initialization state of the local storage
let lsInitialized = false;

window.addEventListener('load', pageLoaded);
async function pageLoaded() {
  let todaysWord = '';
  // the if statement below checks if the local storage is initialized
  if (localStorage.length !== 0) {
    lsInitialized = true;
  }
  // the if statement below initializes the local storage
  if (lsInitialized === false) {
    localStorage.setItem('gamesWon', 0);
    localStorage.setItem('streak', 0);
    localStorage.setItem('date', todaysDate);
    localStorage.setItem('attemptCounter', 0);
    localStorage.setItem('played', false);
  }
  // the if statement below checks how many attempts the user has submitted before
  // refreshing the page and places them the way they were before refreshing
  if (Number(localStorage.date) === todaysDate && Number(localStorage.attemptCounter > 0)) {
    for (let row = 0; row < Number(localStorage.length); row++) {
      // the for loop below searches for the attempts in the order submitted by the user
      for (let i = 0; i < Number(localStorage.length); i++) {
        if (Number(localStorage.key(i)) === row) {
          const attributename = localStorage.key(i);
          const storedAttempt = localStorage.getItem(attributename).toLowerCase();
          // the states variable below is an array that holds the state of every
          // letter in the current attempt(states can be 'correct','in-word','not-in-word')
          const states = await sendAttempt('/sendattempt', { word: storedAttempt });
          // the correctLetters variable below hold the number
          // of the correct letters in the current attempt
          const correctLetters = correctLettersCount(states);
          if (correctLetters === 5) { todaysWord = storedAttempt; }
          // function below styles buttons and tiles
          refreshStyling(storedAttempt, states);
        }
      }
    }
    // The if statement below checks if the user completed today's challenge
    if (localStorage.played === 'true') {
      stopResponding();
      alertDisplay(`Todays word:${todaysWord}, Games won: ${localStorage.gamesWon}, Win streak:${localStorage.streak}`, 8000);
    }
    // the if statement below activates the game if the user hasn't
    // completed today's challenge before refreshing the page
  }
  if (localStorage.played === 'false') {
    initialization();
  }
  // the if statement below checks if the day has changed
  if (Number(localStorage.date) !== todaysDate) {
    localStorage.date = todaysDate;
    localStorage.played = false;
    localStorage.attemptCounter = 0;
    // the for loop below iterates localStorage in
    // reverse order since i'm removing elements
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const attributename = localStorage.key(i);
      const storedAttempt = localStorage.getItem(attributename);

      if (storedAttempt.length >= 5 && storedAttempt !== 'false') {
        localStorage.removeItem(attributename);
      }
    }
    initialization();
  }
}
// the function below is used to style
// the tiles after the page is refreshed
function refreshStyling(storedAttempt, states) {
  for (let column = 0; column < 5; column++) {
    const tileCon = guessBoard.querySelector(':not([data-character])');
    tileCon.textContent = storedAttempt[column];
    tileCon.dataset.character = storedAttempt[column];
    const letter = keyboard.querySelector(`[data-key="${storedAttempt[column]}"]`);

    if (states[column] === 'correct') {
      tileCon.dataset.state = 'correct-location';
      letter.classList.add('correct');
    } else if (states[column] === 'in-word') {
      tileCon.dataset.state = 'wrong-location';
      letter.classList.add('wrong-location');
    } else {
      tileCon.dataset.state = 'not-in-word';
      letter.classList.add('completely-wrong');
    }
  }
}

function initialization() {
  document.addEventListener('keydown', keyPressHandler);
  document.addEventListener('click', clickHandler);
}

function stopResponding() {
  document.removeEventListener('keydown', keyPressHandler);
  document.removeEventListener('click', clickHandler);
}

// the function below handles everything that is clicked by the mouse
function clickHandler(p) {
  // the reason the if statement below contains the third
  // && statement is because 'Enter' is within 'A'-'Z'
  if ((p.target.textContent >= 'A' && p.target.textContent <= 'Z' && p.target.textContent !== 'Enter')) {
    pressButton(p.target.textContent);
    return;
  }

  if (p.target.textContent === 'Enter') {
    submitCurrentGuess();
    return;
  }

  if (p.target.id === 'backspace') {
    deleteLetter();
  }
}

// the function below handles every key press on the physical keyboard
function keyPressHandler(p) {
  if (p.code === 'Enter') {
    // the line below prevents the user
    // from interacting with the system
    stopResponding();
    submitCurrentGuess();
    initialization();
    return;
  }

  if (p.code === 'Backspace') {
    deleteLetter();
    return;
  }

  if (p.code >= 'KeyA' && p.code <= 'KeyZ') {
    pressButton(p.code[3]);
  }
}
// the function below get called whenever a
// button from (A-Z) is pressed or clicked
function pressButton(key) {
  const currentTiles = getCurrentTiles();
  // the if statement below prevents the user from
  // entering more than 5 letters in a row
  if (currentTiles.length > 4) {
    return;
  }
  // The following 4 lines make the system traverse
  // through the tiles,style them and insert a letter in them
  const followingTile = guessBoard.querySelector(':not([data-character])');
  followingTile.textContent = key;
  followingTile.dataset.character = key.toLowerCase();
  followingTile.dataset.state = 'current-letter';
}

// the function below returns the active
// tiles to the submitCurrentGuess function
function getCurrentTiles() {
  const allCurrentTiles = guessBoard.querySelectorAll('[data-state="current-letter"]');
  return allCurrentTiles;
}

// the function below deletes letters from the guessBoard
function deleteLetter() {
  const currentTiles = getCurrentTiles();
  const endingTile = currentTiles[currentTiles.length - 1];
  if (endingTile == null) {
    return;
  }
  // the following three lines are
  // used to empty the selected tile
  endingTile.textContent = '';
  delete endingTile.dataset.state;
  delete endingTile.dataset.character;
}

async function submitCurrentGuess() {
  // the line below turns the nodelist returned
  // from get getCurrentTiles into an array
  const currentTiles = [...getCurrentTiles()];
  if (currentTiles.length < 5) {
    alertDisplay('Not enough characters', 750);
    return;
  }
  // line 204 turns the array of line 198 into a string
  const attempt = currentTiles.reduce((currentAttempt, tiles) => {
    return currentAttempt + tiles.textContent;
  }, '');
  // the if statement below checks if the current attempt
  // is a word or a random collection of characters
  if (await dictionary(attempt) === false) {
    alertDisplay('Not a word', 750);
    return;
  }
  const states = await sendAttempt('/sendattempt', { word: attempt });
  // line 216 passess everything(currentTile,index of tile,array of tiles,
  // the current attempt and the states array)for each currentTile
  currentTiles.forEach((...everything) => checkPosition(...everything, attempt, states));
}

// the function below is what display's the window alerts
function alertDisplay(content, timer) {
  const message = document.createElement('div');
  message.textContent = content;
  message.classList.add('alert-message');
  alertBoarder.prepend(message);
  setTimeout(() => {
    message.classList.add('hide');
  }, timer);
}

// the function below checks if the word that the user
// submitted is actually a word or a random collection of letters
async function dictionary(currentTry) {
  const url = 'https://dictionary-dot-sse-2020.nw.r.appspot.com/' + currentTry;
  const response = await fetch(url);
  try {
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
  }
}

function checkPosition(currentTile, index, array, attempt, states) {
  stopResponding();
  const character = currentTile.textContent.toLowerCase();
  const keyboardButton = keyboard.querySelector(`[data-key="${character}"]`);
  initialStyling(states, index, currentTile, keyboardButton);
  // the if statement below is used to determine if the system
  // has gone through all 5 letters of the current attempt
  if (index === array.length - 1) {
    localStorage.setItem(Number(localStorage.attemptCounter), attempt);
    localStorage.attemptCounter = Number(localStorage.attemptCounter) + 1;
    initialization();
    checkGameOver(states);
  }
}
// the function below applies styling to the
// tiles after an attempt has been submitted
function initialStyling(states, index, currentTile, keyboardButton) {
  if (states[index] === 'correct') {
    currentTile.dataset.state = 'correct-location';
    keyboardButton.classList.add('correct');
  } else if (states[index] === 'in-word') {
    currentTile.dataset.state = 'wrong-location';
    keyboardButton.classList.add('wrong-location');
  } else {
    currentTile.dataset.state = 'not-in-word';
    keyboardButton.classList.add('completely-wrong');
  }
}

// the function below checks if the user completed
// today's challenge(won/run out of attempts)
function checkGameOver(states) {
  const counter = correctLettersCount(states);
  if (counter === 5) {
    localStorage.gamesWon = Number(localStorage.gamesWon) + 1;
    localStorage.streak = Number(localStorage.streak) + 1;
    alertDisplay(`You Won, Games won: ${localStorage.gamesWon}, Win streak:${localStorage.streak}`, 8000);
    localStorage.played = true;
    stopResponding();
    return;
  }
  // the line below searches for empty tiles in order
  // to determine if the user run out of attempts
  const remainingEmptyTiles = guessBoard.querySelectorAll(':not([data-character])');
  if (remainingEmptyTiles.length === 0) {
    localStorage.streak = 0;
    alertDisplay(`YOU'VE LOST, Games won: ${localStorage.gamesWon}, Win streak:${localStorage.streak}`, 8000);
    localStorage.played = true;
    stopResponding();
  }
}
// the function below sends the user's attempt to the server and gets
// back an array containing the states of each letter of the attempt
async function sendAttempt(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}
// the function below counts the number of correctly placed letters
// in order to determine if the user correctly guessed today's word
function correctLettersCount(states) {
  let counter = 0;
  for (const state of states) {
    if (state === 'correct') { counter++; }
  }
  return counter;
}

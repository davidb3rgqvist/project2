/* jshint esversion: 11 */

/**
  This script handles the logic for a French-English word matching game.
  It includes functions for displaying game sections, handling user input,
  and updating scores.
*/

// Variables for the listen to the correct answer button.
let SpeechSynthesisUtterance;
let speechSynthesis;

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // Clear the the highscore.
    localStorage.clear();

    // All constants.
    const userNameElement = document.getElementById("user-name");
    const userNameDisplayElement = document.getElementById("user-heading");
    const startButton = document.getElementById("start-game");
    const userInputElement = document.getElementById("input-word");
    const introSection = document.getElementById("intro");
    const gameSection = document.getElementById("game");
    const scoreSection = document.getElementById("score");
    const exitGameButton = document.getElementById("exit-game");
    const backToGameButton = document.getElementById("back-to-game");
    const speakButton = document.getElementById("speak-button");
    const correctAnswerCountElement = document.getElementById("correct-answer-count");

    // First 50 words
    const words = [
      {"fr": "comme", "en": "as"},
      {"fr": "je", "en": "I"},
      {"fr": "son", "en": "his"},
      {"fr": "que", "en": "that"},
      {"fr": "il", "en": "he"},
      {"fr": "était", "en": "was"},
      {"fr": "pour", "en": "for"},
      {"fr": "sur", "en": "on"},
      {"fr": "sont", "en": "are"},
      {"fr": "avec", "en": "with"},
      {"fr": "ils", "en": "they"},
      {"fr": "être", "en": "be"},
      {"fr": "à", "en": "at"},
      {"fr": "un", "en": "one"},
      {"fr": "avoir", "en": "have"},
      {"fr": "à partir de", "en": "from"},
      {"fr": "ce", "en": "this"},
      {"fr": "par", "en": "by"},
      {"fr": "chaud", "en": "hot"},
      {"fr": "mot", "en": "word"},
      {"fr": "mais", "en": "but"},
      {"fr": "que", "en": "what"},
      {"fr": "certains", "en": "some"},
      {"fr": "est", "en": "is"},
      {"fr": "il", "en": "it"},
      {"fr": "vous", "en": "you"},
      {"fr": "ou", "en": "or"},
      {"fr": "eu", "en": "had"},
      {"fr": "la", "en": "the"},
      {"fr": "de", "en": "of"},
      {"fr": "à", "en": "to"},
      {"fr": "et", "en": "and"},
      {"fr": "un", "en": "a"},
      {"fr": "dans", "en": "in"},
      {"fr": "nous", "en": "we"},
      {"fr": "boîte", "en": "can"},
      {"fr": "dehors", "en": "out"},
      {"fr": "autre", "en": "other"},
      {"fr": "étaient", "en": "were"},
      {"fr": "qui", "en": "which"},
      {"fr": "faire", "en": "do"},
      {"fr": "leur", "en": "their"},
      {"fr": "temps", "en": "time"},
      {"fr": "si", "en": "if"},
      {"fr": "volonté", "en": "will"},
      {"fr": "comment", "en": "how"},
      {"fr": "dit", "en": "said"},
      {"fr": "un", "en": "an"},
      {"fr": "chaque", "en": "each"},
      {"fr": "dire", "en": "tell"},
    ];

    // Array with the game words.
    const shuffledWords = shuffleWords([...words]);

    // All variables.

    let currentWordIndex = 0;
    let totalCorrectAnswers = 0;
    let consecutiveCorrectAnswers = 0;

    // Array with the high scores.
    let highScores = JSON.parse(localStorage.getItem("highScores")) || [];

    // The declarations and initializations of SpeechSynthesisUtterance and speechSynthesis.
    SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance;
    speechSynthesis = window.speechSynthesis || window.webkitSpeechSynthesis;

    // All event listeners:

    // Add event listener listen to the correct word button.
    speakButton.addEventListener("click", function () {
        speakWord(shuffledWords[currentWordIndex].fr);
    });

    // Add event listener to the Start Game button, together with validation.
    startButton.addEventListener("click", function () {
      const userNameValue = userNameElement.value;
      if (userNameValue !== "") {
        userNameDisplayElement.textContent = userNameValue;
        showGameSection();
        displayWord();
      } else {
        // Alert the user when name field is empty.
        alert("Please enter a valid username.");
      }
    });

    // Add event listener to the username input field, together with validation.
    document.getElementById("user-name").addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        const userNameValue = userNameElement.value.trim();
        if (userNameValue !== "") {
          userNameDisplayElement.textContent = userNameValue;
          showGameSection();
          displayWord();
        } else {
          // Alert the user or handle the case where the username is empty.
          alert("Please enter a valid username.");
        }
      }
    });

    // Add event listener for the "Submit" button.
    document.getElementById("user-answer").addEventListener("click", function () {
          checkAnswer();
    });

    // Add event listener for the "Text input".
    document.getElementById("input-word").addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        userInputElement.value = userInputElement.value.trim();
        checkAnswer();
      }
    });

    // Add event listener for the "Play Again" button.
    document.getElementById("play-again").addEventListener("click", function () {
      resetGame();
      userInputElement.focus();
      showGameSection();
    });

    // Add event listener for the "Highscore" button.
    exitGameButton.addEventListener("click", function () {
          showScoreSection();
          displayHighScores();
    });

    // Add event listener for the "Back to game" button.
    backToGameButton.addEventListener("click", function () {
          showGameSection();
    });

    // All Functions.

    /**
     * Show intro-section and hide others.
     */
    function showIntroSection () {
      introSection.classList.remove("hide");
      gameSection.classList.add("hide");
      scoreSection.classList.add("hide");
    }

    /**
     * Show game-section and hide others.
     */
    function showGameSection () {
      introSection.classList.add("hide");
      gameSection.classList.remove("hide");
      scoreSection.classList.add("hide");
      userInputElement.focus();
    }

    /**
     * Show score-section and hide others.
     */ 
    function showScoreSection () {
      introSection.classList.add("hide");
      gameSection.classList.add("hide");
      scoreSection.classList.remove("hide");
    }

    /**
     * Counts correct answers.
     *
     * @param {Number} count correct answer count.
     */
    function updateCorrectAnswerCount (count) {
      correctAnswerCountElement.textContent = "Correct Answers: " + count;
    }

    /**
     * Resets correct answers counter.
     */ 
    function resetCorrectAnswerCount () {
      updateCorrectAnswerCount(0);
    }

    /**
     * Makes it possible to here the correct word in french.
     *
     * @param {String} word the word to speak.
     */
    function speakWord (word) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'fr-FR';
      speechSynthesis.speak(utterance);
    }

    /**
     * Shuffles the word to have a new "first" word every time the webpage reloads.
     *
     * @param {Array} words
     * @returns {Array}  A shuffled array.
     */
    function shuffleWords (words) {
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
        }
        return words;
    }

    /**
     * Adds the game word to the flashcard.
     */ 
    function displayWord () {
      const flashcardElement = document.getElementById("flashcard");
      flashcardElement.textContent = shuffledWords[currentWordIndex].en;
      flashcardElement.style.fontSize = "30px";
      flashcardElement.style.fontWeight = "bold";
      flashcardElement.style.color = "#393E40";
      flashcardElement.style.backgroundColor = "rgb(241, 236, 230)";
      userInputElement.focus();
    }

    /**
     * Reset the game.
     */ 
    function resetGame () {
      currentWordIndex = 0;
      totalCorrectAnswers = 0;
      speakButton.style.display = "none";
      exitGameButton.style.display = "block";
      resetCorrectAnswerCount();
      displayWord();
      showGameSection();
      userInputElement.focus();
      document.getElementById("input-word").style.display = "block";
      document.getElementById("user-answer").style.display = "block";
      document.getElementById("play-again").style.display = "none";
      document.getElementById("wrong-answer").style.display = "none";
      userInputElement.value = "";
    }

    /**
     * Adds the score of each run, sorts them and adds it to local storage.
     *
     * @param {Number} score The score to be added to the high scores.
     */
    function updateHighScores(score) {
      highScores.push(score);
      highScores.sort((a, b) => b - a);
      highScores = highScores.slice(0, 10);
      localStorage.setItem("highScores", JSON.stringify(highScores));
    }

    /**
     * Gets the score and sends it to the scoreboard.
     */
    function displayHighScores() {
      const scoreSection = document.getElementById("results");
      const highScoresList = document.createElement("ol");
      highScoresList.id = "high-scores-list";
      highScores.forEach((score, index) => {
          const listItem = document.createElement("ol");
          highScoresList.appendChild(listItem);
          if (score !== undefined && score !== null) {
              const listItem = document.createElement("ol");
              listItem.textContent = `${score} words in a row`;
              highScoresList.appendChild(listItem);
          }
      });
      scoreSection.innerHTML = "<h1>Your top 10 High Scores</h1>";
      scoreSection.appendChild(highScoresList);
    }

    /**
     * Check if the user have inserted the correct word.
     */ 
    function checkAnswer () {
      const userInputElement = document.getElementById("input-word");
      const flashcardElement = document.getElementById("flashcard");
      const wrongAnswerDiv = document.getElementById("wrong-answer");
      const submitButton = document.getElementById("user-answer");
      const playAgainButton = document.getElementById("play-again");

      if (userInputElement.value.toLowerCase() === shuffledWords[currentWordIndex].fr.toLowerCase()) {
        currentWordIndex++;
        consecutiveCorrectAnswers++;
        totalCorrectAnswers++;
        flashcardElement.style.color = "green";
        flashcardElement.style.backgroundColor = "green";
        setTimeout(() => {
        displayWord();
        }, 500);
        userInputElement.value = "";
        wrongAnswerDiv.style.display = "none";
        submitButton.style.display = "block";
        playAgainButton.style.display = "none";
        speakButton.style.display= "none";
        updateCorrectAnswerCount(totalCorrectAnswers);
      } else {
        consecutiveCorrectAnswers = 0;
        speakButton.style.display= "block";
        wrongAnswerDiv.style.display = "block";
        flashcardElement.textContent = "Correct word = " + shuffledWords[currentWordIndex].fr;
        flashcardElement.style.color = "#f1f2f2";
        flashcardElement.style.backgroundColor = "rgb(197, 21, 21)";
        userInputElement.style.display = "none";
        submitButton.style.display = "none";
        playAgainButton.style.display = "block";
        playAgainButton.addEventListener("click", function() {
          resetGame();
        });

        // Gets the score and sends it to the scoreboard.
        updateHighScores(totalCorrectAnswers);
        displayHighScores();
        }
    }

    // Initial setup.
    showIntroSection ();
});
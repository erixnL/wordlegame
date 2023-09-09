const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");
const ANSWER_LENGTH = 5;
const ROUND = 6;

async function init() {
    //track the row
    let currentRow = 0;
    let currentGuess = "";
    let done = false;
    let isLoading = true;

    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const {word: wordRes} = await res.json();
    const word = wordRes.toUpperCase();
    const wordParts = word.split("");
    isLoading = false;

    function isLetter(letter) {
        //regular expression
        return /^[a-zA-Z]$/.test(letter);
      }
    
    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;
        } else {
            // replace the last letter with the new enter
            currentGuess = currentGuess.substring(0, currentGuess.length-1) + letter;
        }
        //write the update to the DOM
        //the returned array of querySelectorAll is in order
        letters[ANSWER_LENGTH*currentRow + currentGuess.length -1].innerText = letter
    }

    async function commit() {
        if (currentGuess.length != ANSWER_LENGTH) {
            return;
        }

        //write on a new line
        currentRow ++;
        currentGuess = "";
    }

    function backsapce() {
        currentGuess = currentGuess.substring(0, currentGuess.length-1);
        letters[ANSWER_LENGTH*currentRow + currentGuess.length].innerText = "";
    }

    document.addEventListener("keydown", function handleKeyPress (event) {
        const action = event.key;
        if (action === "Enter") {
            commit();
        } else if (action === "Backspace") {
            backsapce();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase())
        } else {
            //do nothing
        }
    });
 
}

init();

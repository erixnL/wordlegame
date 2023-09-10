const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

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
        
        //validate the guessed word
        isLoading = true;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({word: currentGuess})
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;
        //const { validWord } = await res.json();

        isLoading = false;
        setLoading(false);

        if (!validWord) {
            markInvalidWord();
            return;
        } 

        //split the letters in the word
        const guessPart = currentGuess.split("");
        const map = makeMap(wordParts);

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            
            if (guessPart[i] === wordParts[i]) {
                //correct letter in a correct position
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
                // if guess correct, reduce the remaining letter counts
                //map is the container of correct letters
                map[guessPart[i]]--;
            } else if (wordParts.includes(guessPart[i])&& map[guessPart[i]] >0) {
                // correct letter in wrong position
                letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
                map[guessPart[i]]--;
            } else {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
            } 

        }

        //write on a new line
        currentRow ++;

        //if win
        //or run out of rounds
        if (currentGuess === word) {
            document.querySelector(".brand").classList.add("winner");
            done = true;
            return;
        } else if (currentRow === ROUNDS) {
            alert(`you lose, the word was ${word}`);
            done = true;
        }
        currentGuess = "";
    }
        

    function backsapce() {
        currentGuess = currentGuess.substring(0, currentGuess.length-1);
        letters[ANSWER_LENGTH*currentRow + currentGuess.length].innerText = "";
    }

    function markInvalidWord() {
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");

            setTimeout(function() {
                letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");
            }, 500);
        }
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


function isLetter(letter) {
    //regular expression
    return /^[a-zA-Z]$/.test(letter);
  }

  //toggle the loading
function setLoading(isLoading) {
    loadingDiv.classList.toggle("show", isLoading);
}

// check if there are two same letter in one word, like "pool"
// takes an array of letters (like ['E', 'L', 'I', 'T', 'E']) and creates
// an object out of it (like {E: 2, L: 1, T: 1}) so we can use that to
// (obj[array[i]]) return true or false
function makeMap(array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        if (obj[array[i]]) {
            obj[array[i]]++;
        } else {
            obj[array[i]] = 1;
        }
    }
    return obj;
}

init();

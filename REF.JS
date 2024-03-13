// with this code the whole line scrolls. should i just make it where the part with the first line scrolls??? (How???)
const hangmanImage = document.querySelector(".hangman-box img");
const wordDisplay = document.querySelector(".word-display");
const guessesText = document.querySelector(".guesses-text");
const keyboardDiv = document.querySelector(".keyboard");
const gameModel = document.querySelector(".game-model");
const playAgainBtn = document.querySelector(".play-again");

let letterFound = false; // Variable to track if the clicked letter is found in the word
let currentWord, correctLetters, wrongGuessCount, remainingGuessCount, hiddenWord, isVictory, gameOverTimeout;
const maxGuesses = 6;
let wordsUsed = [];
let gameReset = false; // Variable to track if the game is reset

const dataToSend = [];
const currentWordLength = currentWord ? currentWord.length : 0; // Calculate the length of the currentWord
const numSpaces = Math.max(16 - currentWordLength, 0); // Calculate the number of spaces needed to fill up to 16 characters
const spaces = Array(numSpaces).fill(0x20).map(val => String.fromCharCode(val)).join('');

// Concatenate the hidden word with spaces to make up 16 characters

const fullword = (hiddenWord + spaces).slice(0, 16); // Ensure the total length is 16 characters
const firstline = spaces.slice(0, 16);



const resetGame = async (resetWordsUsed = true) => { 
    correctLetters = [];
    wrongGuessCount = 0;
    remainingGuessCount = 6;
    hangmanImage.src = `hangman${wrongGuessCount}.png`
    guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;
    keyboardDiv.querySelectorAll("button").forEach(btn => btn.disabled = false);
    wordDisplay.innerHTML = currentWord.split("").map(() => `<li class="letter"></li>`).join("");
    gameModel.classList.remove("show");
    if (resetWordsUsed) {
        wordsUsed = []; // Reset the array of words used only if resetWordsUsed is true
    }
    
     
    const dataToSend = [];
    dataToSend.push(firstline);
    dataToSend.push(fullword); // Assuming hiddenWord and spaces are defined elsewhere
    dataToSend.push(remainingGuessCount);
        
    await WritetoSerial(dataToSend);
    gameReset = true; 

}

// Function to read words from text file (async because reading from file takes some time. js can execute other code while waiting for this to finish)
async function ReadFromFileandSelectRandomWord() {
    try {
        const response = await fetch('EnglishWords.txt');
        const text = await response.text();
        const words = text.split('\n');
        const randomWord = words[Math.floor(Math.random() * words.length)];
        currentWord = randomWord;
        resetGame();
    } catch (error) {
        console.error("Error reading words from file.", error); 
        }
}

const gameOver = async (victory) => {
    isVictory = victory;
    wordsUsed.push(currentWord);

    // Clear the previous timeout if it exists
    if (gameOverTimeout) {
        clearTimeout(gameOverTimeout);
    }

    // after 600ms of game completion show model with relevant details
    gameOverTimeout = setTimeout(async () => {
        const modelText = isVictory ? `Well done! You have solved` : `Sorry! The correct word was:`;
        gameModel.querySelector("img").src = `images/${isVictory ? 'victory' : 'lost'}.png`;
        gameModel.querySelector("h4").innerText = `${isVictory ? 'Congrats!' : 'Game Over!'}`;
        gameModel.querySelector("p").innerHTML = `${modelText} <b>${currentWord}</b>. You have solved <b>${wordsUsed.length}</b> puzzles out of 1000`;
        gameModel.classList.add("show");

        // Calculate the number of spaces needed to fill up to 16 characters
        if (!gameReset) {
        // Sending game outcome logic to the serial port
        const gameOutcome = isVictory ? `Well done! You have solved ${wordsUsed.length} puzzles out of 1000` : `Sorry! The correct word was: ${currentWord}. You have solved ${wordsUsed.length} puzzles out of 1000`;
        const dataToSend = [];
        // Concatenate the hidden word with spaces to make up 16 characters
        dataToSend.push(gameOutcome);
        dataToSend.push(fullword); // Assuming hiddenWord and spaces are defined elsewhere
        dataToSend.push(remainingGuessCount);

        await WritetoSerial(dataToSend);
        }

        gameReset = false;

    }, 300);
}

const initGame = async (button, clickedLetter) => {

    if (remainingGuessCount === undefined) {
        // If remainingGuessCount is undefined (i.e., game just started), send the initial value (6) to the serial port
        dataToSend.push(firstline);
        dataToSend.push(firstline); // Assuming hiddenWord and spaces are defined elsewhere
        dataToSend.push(maxGuesses);

        await WritetoSerial(dataToSend);
    }

    if (currentWord.includes(clickedLetter)) {
        [...currentWord].forEach((letter, index) => {
            if (letter === clickedLetter) {
                correctLetters.push(letter);
                wordDisplay.querySelectorAll('li')[index].innerText = letter;
                wordDisplay.querySelectorAll('li')[index].classList.add("guessed");
                letterFound = true; // Set the flag to true if the letter is found
            }
        });

        // If the letter is found, reconstruct the hidden word and update the display immediately
        if (letterFound) {
            let hiddenWord = '';
            [...currentWord].forEach(letter => {
                if (correctLetters.includes(letter)) {
                    hiddenWord += letter;
                } else {
                    hiddenWord += '_';
                }
            });

        // Calculate the number of spaces needed to fill up to 16 characters
                // Sending game outcome logic to the serial port
        const dataToSend = [];
        dataToSend.push(firstline);
        dataToSend.push(fullword); // Assuming hiddenWord and spaces are defined elsewhere
        dataToSend.push(remainingGuessCount);

      await WritetoSerial(dataToSend);
        }
    } else {
        wrongGuessCount++;
        remainingGuessCount--;
        hangmanImage.src = `hangman${wrongGuessCount}.png`;

        const dataToSend = [];
        dataToSend.push(firstline);
        dataToSend.push(fullword); // Assuming hiddenWord and spaces are defined elsewhere
        dataToSend.push(remainingGuessCount);

        await WritetoSerial(dataToSend);
    }

    button.disabled = true;
    guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;

    console.log("Remaining Guess Count:", remainingGuessCount);

    if (wrongGuessCount === maxGuesses) return gameOver(false);
    if (correctLetters.length === currentWord.length) return gameOver(true);
}


window.addEventListener('keydown', async function(event) {
    if (gameModel.classList.contains('show')) {
        const key = event.key.toLowerCase();
        if (key === 'y') {
            const dataToSend = [0x01]; // Command 0x01 to clear the display
            await WritetoSerial(dataToSend);
            await resetGame();
            playAgainBtn.click();
            // gameOver(false, false); // Pass false to prevent resetting wordsUsed on 'Y'
        } else if (key === 'n') {
            gameModel.querySelector("h4").innerText = "GAME OVER!";
            gameModel.querySelector("p").innerText = "";
            const over = 'GAME OVER!';
            // Pad the message with spaces to total up to 16 characters
            padover = over.padEnd(16, String.fromCharCode(0x20));
            const dataToSend = [];
            dataToSend.push(padover);
            dataToSend.push(fullword); // Assuming hiddenWord and spaces are defined elsewhere
            dataToSend.push(remainingGuessCount);

            await WritetoSerial(dataToSend);

        }
    } else {
        const key = event.key.toLowerCase();
        if (key.match(/[a-z]/)) {
            const correspondingButton = keyboardDiv.querySelector(`button[data-key="${key}"]`);
            if (correspondingButton) {
                correspondingButton.click();
            } 
        }
    }
});

//creating keyboard buttons
for (let i = 97; i <= 122; i++) {
    const button = document.createElement("button");
    button.innerText = String.fromCharCode(i);
    button.dataset.key = String.fromCharCode(i);
    keyboardDiv.appendChild(button);
    button.addEventListener("click", e => initGame(e.target, String.fromCharCode(i)));
}

// Function to connect to serial port
async function connectSerial() {
    try {
        const port = await navigator.serial.requestPort();     
        if (!port) {
            throw new Error("Serial port is not available.");
        }
        
        await port.open({ baudRate: 9600, parity: 'none', dataBits: 8, stopBits: 1 });

        const reader = port.readable.getReader();

        // Continuously read data from the serial port
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const receivedData = new TextDecoder().decode(value);
            handleReceivedData(receivedData);
        }
    } catch (error) {
        console.error("Error accessing serial port:", error);
    }
}

async function WritetoSerial(messages) {
    try {
        const ports = await navigator.serial.getPorts();
        console.log(ports);
        if (!ports || ports.length === 0) {
            throw new Error("No serial ports available.");
        }

        // Select the first available port
        const port = ports[0];

        if (!port.writable) {
            throw new Error("Serial port does not support writing.");
        }

        // Check if the WritableStream is locked
        if (port.writable.locked) {
            throw new Error("WritableStream is locked.");
        }

        // Concatenate messages into a single string
        const formattedMessage = messages.join("");
    
        // Write data to the serial port
        const writer = port.writable.getWriter();
        const data = new TextEncoder().encode(formattedMessage);
        await writer.write(data);
        console.log("Data Sent to Port: ", formattedMessage);
        await writer.close();

    } catch (error) {
        console.error("Error accessing serial port:", error);
    }
}


// Function to handle received data from the serial port
function handleReceivedData(data) {
    const keys = data.trim().split(""); // Split data into individual characters
    keys.forEach(key => {
        const correspondingButton = keyboardDiv.querySelector(`button[data-key="${key}"]`);
        if (correspondingButton) {
            correspondingButton.click();
            if (gameModel.classList.contains('show')) {
                if (keys === 'y') {
                    playAgainBtn.click();
                } else if (keys === 'n') { // n doesnt work fix later
                    gameModel.querySelector("h4").innerText = "GAME OVER!";
                    gameModel.querySelector("p").innerText = "";

                }
            }
        }
    });
    console.log("Received data from PS2 keyboard:", data);
}

connectSerial(); 
ReadFromFileandSelectRandomWord();
playAgainBtn.addEventListener("click", ReadFromFileandSelectRandomWord);

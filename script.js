/**
 * Initializes the Trivia Game when the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("trivia-form");
    const questionContainer = document.getElementById("question-container");
    const newPlayerButton = document.getElementById("new-player");
    const usernameInput = document.getElementById("username");

    // Initialize Game
    checkUsername();
    fetchQuestions();
    displayScores();

    /**
     * ------------------------------------
     * COOKIE MANAGEMENT
     * ------------------------------------
     */

    function setCookie(name, value, days = 7) {
        const date = new Date();
        date.setTime(date.getTime() + days * 86400000);
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
    }

    function getCookie(name) {
        const decoded = decodeURIComponent(document.cookie);
        const parts = decoded.split(";");

        for (let c of parts) {
            c = c.trim();
            if (c.startsWith(name + "=")) {
                return c.substring(name.length + 1);
            }
        }
        return "";
    }

    function checkUsername() {
        const username = getCookie("username");

        if (username !== "") {
            usernameInput.classList.add("hidden");
            newPlayerButton.classList.remove("hidden");
            usernameInput.value = username;
        } else {
            usernameInput.classList.remove("hidden");
            newPlayerButton.classList.add("hidden");
        }
    }

    /**
     * ------------------------------------
     * FETCH & DISPLAY QUESTIONS
     * ------------------------------------
     */

    function fetchQuestions() {
        showLoading(true);

        fetch("https://opentdb.com/api.php?amount=10&type=multiple")
            .then(res => res.json())
            .then(data => {
                displayQuestions(data.results);
                showLoading(false);
            })
            .catch(err => {
                console.error("Error:", err);
                showLoading(false);
            });
    }

    function showLoading(isLoading) {
        const loader = document.getElementById("loading-container");

        loader.classList = isLoading ? "" : "hidden";
        questionContainer.classList = isLoading ? "hidden" : "";
    }

    function displayQuestions(questions) {
        questionContainer.innerHTML = "";

        questions.forEach((question, index) => {
            const box = document.createElement("div");

            box.innerHTML = `
                <p>${question.question}</p>
                ${createOptions(question.correct_answer, question.incorrect_answers, index)}
            `;

            questionContainer.appendChild(box);
        });
    }

    function createOptions(correct, incorrect, index) {
        const answers = [correct, ...incorrect].sort(() => Math.random() - 0.5);

        return answers
            .map(
                (ans) => `
            <label>
                <input type="radio" 
                       name="answer${index}" 
                       value="${ans}"
                       ${ans === correct ? 'data-correct="true"' : ''}>
                ${ans}
            </label>
        `
            )
            .join("");
    }

    /**
     * ------------------------------------
     * SCORE CALCULATION
     * ------------------------------------
     */

    function calculateScore() {
        let score = 0;

        for (let i = 0; i < 10; i++) {
            const selected = document.querySelector(
                `input[name="answer${i}"]:checked`
            );

            if (selected && selected.hasAttribute("data-correct")) {
                score++;
            }
        }
        return score;
    }

    /**
     * ------------------------------------
     * SCORE STORAGE (localStorage)
     * ------------------------------------
     */

    function saveScore(username, score) {
        let scores = JSON.parse(localStorage.getItem("scores")) || [];

        scores.push({ username, score });
        localStorage.setItem("scores", JSON.stringify(scores));
    }

    function displayScores() {
        const tbody = document.querySelector("#score-table tbody");
        tbody.innerHTML = "";

        let scores = JSON.parse(localStorage.getItem("scores")) || [];

        scores.forEach((entry) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${entry.username}</td><td>${entry.score}</td>`;
            tbody.appendChild(row);
        });
    }

    /**
     * ------------------------------------
     * FORM SUBMISSION
     * ------------------------------------
     */

    form.addEventListener("submit", handleFormSubmit);

    function handleFormSubmit(event) {
        event.preventDefault();

        let username = usernameInput.value.trim();

        if (getCookie("username") === "") {
            if (username === "") {
                alert("Please enter your name!");
                return;
            }
            setCookie("username", username);
        } else {
            username = getCookie("username");
        }

        const score = calculateScore();
        saveScore(username, score);
        displayScores();

        alert(`Your score: ${score}`);

        // Fetch new questions
        fetchQuestions();
    }

    /**
     * ------------------------------------
     * NEW PLAYER RESET
     * ------------------------------------
     */

    newPlayerButton.addEventListener("click", newPlayer);

    function newPlayer() {
        setCookie("username", "", -1); // delete cookie
        usernameInput.value = "";
        checkUsername();
    }
});

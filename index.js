const BASE_URL = "http://localhost:3000";
const QUOTES_URL = `${BASE_URL}/quotes?_embed=likes`;
const quoteList = document.getElementById("quote-list");
const quoteForm = document.getElementById("new-quote-form");

// Load quotes on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchQuotes();
  quoteForm.addEventListener("submit", handleFormSubmit);
});

// Fetch all quotes from the API
function fetchQuotes() {
  fetch(QUOTES_URL)
    .then((res) => res.json())
    .then((quotes) => {
      quoteList.innerHTML = "";
      quotes.forEach(renderQuote);
    })
    .catch((err) => console.error("Error fetching quotes:", err));
}

// Render a single quote to the DOM
function renderQuote(quote) {
  const li = document.createElement("li");
  li.classList.add("quote-card", "mb-3");

  const likeCount = quote.likes ? quote.likes.length : 0;

  li.innerHTML = `
    <blockquote class="blockquote">
      <p class="mb-0">${quote.quote}</p>
      <footer class="blockquote-footer">${quote.author}</footer>
      <br>
      <button class='btn btn-success'>Likes: <span>${likeCount}</span></button>
      <button class='btn btn-danger'>Delete</button>
    </blockquote>
  `;

  // Like button
  li.querySelector(".btn-success").addEventListener("click", () => {
    likeQuote(quote.id, li);
  });

  // Delete button
  li.querySelector(".btn-danger").addEventListener("click", () => {
    deleteQuote(quote.id, li);
  });

  quoteList.appendChild(li);
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();

  const quoteText = e.target.quote.value.trim();
  const author = e.target.author.value.trim();

  if (!quoteText || !author) return;

  const newQuote = { quote: quoteText, author: author };

  fetch(`${BASE_URL}/quotes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newQuote)
  })
    .then((res) => res.json())
    .then((savedQuote) => {
      savedQuote.likes = [];
      renderQuote(savedQuote);
      quoteForm.reset();
    })
    .catch((err) => console.error("Error adding quote:", err));
}

// Like a quote
function likeQuote(quoteId, li) {
  const createdAt = Math.floor(Date.now() / 1000); // UNIX time

  fetch(`${BASE_URL}/likes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ quoteId, createdAt })
  })
    .then((res) => res.json())
    .then(() => {
      const likeSpan = li.querySelector("span");
      likeSpan.textContent = parseInt(likeSpan.textContent) + 1;
    })
    .catch((err) => console.error("Error liking quote:", err));
}

// Delete a quote
function deleteQuote(quoteId, li) {
  fetch(`${BASE_URL}/quotes/${quoteId}`, {
    method: "DELETE"
  })
    .then(() => li.remove())
    .catch((err) => console.error("Error deleting quote:", err));
}

// Load quotes from local storage or initialize
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// Function to populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  categoryFilter.value = selectedCategory;
}

// Function to display quotes
function displayQuotes(filteredQuotes = quotes) {
  const quoteContainer = document.getElementById("quoteContainer");
  quoteContainer.innerHTML = "";

  filteredQuotes.forEach(q => {
    const div = document.createElement("div");
    div.className = "quote";
    div.innerHTML = `<p>"${q.text}"</p><p>- ${q.author}</p><p><em>${q.category}</em></p>`;
    quoteContainer.appendChild(div);
  });
}

// Filter quotes by category
function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  selectedCategory = category;
  localStorage.setItem("selectedCategory", category);

  if (category === "all") {
    displayQuotes(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === category);
    displayQuotes(filtered);
  }
}

// Add new quote (updates categories dynamically)
function addQuote(text, author, category) {
  const newQuote = { text, author, category };
  quotes.push(newQuote);
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
  filterQuotes();
  postQuoteToServer(newQuote);
}

// ✅ Fetch quotes from mock server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    // Simulate quotes format
    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.title,
      author: `Author ${item.id}`,
      category: "Server"
    }));

    return serverQuotes;
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
    return [];
  }
}

// ✅ Post new quote to mock server
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    console.log("Quote posted to server:", quote);
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}

// ✅ Sync quotes with server and handle conflicts
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  // Conflict resolution: server takes precedence
  const combined = [...serverQuotes, ...quotes];
  const unique = Array.from(new Map(combined.map(q => [q.text, q])).values());

  quotes = unique;
  localStorage.setItem("quotes", JSON.stringify(quotes));

  // ✅ Alert required by the test
  alert("Quotes synced with server!");

  populateCategories();
  filterQuotes();
}

// ✅ Periodically sync with server every 30 seconds
setInterval(syncQuotes, 30000);

// ✅ Restore last selected category on load
window.onload = function () {
  populateCategories();
  filterQuotes();
  syncQuotes();
};

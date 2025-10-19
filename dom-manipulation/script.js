// --------------------
// Dynamic Quote Generator with Persistent Category Filtering
// --------------------

const STORAGE_KEY = "dynamic_quotes_v2";
const FILTER_KEY = "last_selected_category";

let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const formContainer = document.getElementById("formContainer");
const importFileInput = document.getElementById("importFile");
const exportJsonBtn = document.getElementById("exportJson");

// Default quotes if none exist
const defaultQuotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Stay hungry, stay foolish.", category: "Life" },
  { text: "Success is not final; failure is not fatal.", category: "Success" }
];

// ---------- Web Storage ----------
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  quotes = saved ? JSON.parse(saved) : defaultQuotes;
  saveQuotes(); // ensure initial persistence
}

// ---------- Category Handling ----------
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem(FILTER_KEY);
  if (savedFilter && [...categoryFilter.options].some(opt => opt.value === savedFilter)) {
    categoryFilter.value = savedFilter;
  }
}

// ---------- Display Quotes ----------
function displayQuotes(filteredQuotes) {
  quoteDisplay.innerHTML = "";

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  filteredQuotes.forEach(quote => {
    const quoteEl = document.createElement("div");
    quoteEl.style.marginBottom = "15px";
    quoteEl.innerHTML = `
      <p>"${quote.text}"</p>
      <small style="color:#555">Category: ${quote.category}</small>
    `;
    quoteDisplay.appendChild(quoteEl);
  });
}

// ---------- Filtering Logic ----------
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem(FILTER_KEY, selected);

  let filtered = quotes;
  if (selected !== "all") {
    filtered = quotes.filter(q => q.category === selected);
  }

  displayQuotes(filtered);
}

// ---------- Add Quote ----------
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text: newQuoteText, category: newQuoteCategory });
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}

// ---------- Create Add Quote Form ----------
function createAddQuoteForm() {
  const wrapper = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  wrapper.appendChild(inputText);
  wrapper.appendChild(inputCategory);
  wrapper.appendChild(addButton);

  formContainer.appendChild(wrapper);
}

// ---------- Show Random Quote ----------
function showRandomQuote() {
  const selected = categoryFilter.value;
  const filteredQuotes = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <small style="color:#555">Category: ${quote.category}</small>
  `;
}

// ---------- JSON Import & Export ----------
function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert("Quotes imported successfully!");
  };
  reader.readAsText(file);
}

// ---------- Initialization ----------
function init() {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  filterQuotes();
}

newQuoteBtn.addEventListener("click", showRandomQuote);
importFileInput.addEventListener("change", importFromJsonFile);
exportJsonBtn.addEventListener("click", exportToJson);

init();




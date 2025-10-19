// --------------------
// Dynamic Quote Generator with Server Sync & Conflict Resolution
// --------------------

const STORAGE_KEY = "dynamic_quotes_v3";
const SELECTED_CATEGORY_KEY = "selectedCategory";
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock server

let quotes = [];
let selectedCategory = "all";

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const formContainer = document.getElementById("formContainer");
const importFileInput = document.getElementById("importFile");
const exportJsonBtn = document.getElementById("exportJson");
const manualSyncBtn = document.getElementById("manualSync");
const notificationDiv = document.getElementById("notification");

// ---------- Notifications ----------
function showNotification(message, color = "#4CAF50") {
  notificationDiv.style.display = "block";
  notificationDiv.style.backgroundColor = color;
  notificationDiv.style.color = "#fff";
  notificationDiv.textContent = message;
  setTimeout(() => { notificationDiv.style.display = "none"; }, 4000);
}

// ---------- Storage ----------
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      quotes = JSON.parse(saved);
    } catch {
      quotes = [];
    }
  } else {
    quotes = [
      { text: "The best way to predict the future is to create it.", category: "Motivation" },
      { text: "Stay hungry, stay foolish.", category: "Life" }
    ];
    saveQuotes();
  }
}

function saveSelectedCategory() {
  localStorage.setItem(SELECTED_CATEGORY_KEY, selectedCategory);
}

function restoreSelectedCategory() {
  const saved = localStorage.getItem(SELECTED_CATEGORY_KEY);
  selectedCategory = saved || "all";
}

// ---------- Categories ----------
function populateCategories() {
  const uniqueCategories = Array.from(new Set(quotes.map(q => q.category))).sort();
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
  categoryFilter.value = selectedCategory;
}

// ---------- Display & Filtering ----------
function displayQuotes(list) {
  quoteDisplay.innerHTML = "";
  if (!list.length) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }
  list.forEach(q => {
    const div = document.createElement("div");
    div.style.marginBottom = "12px";
    div.innerHTML = `<p>"${q.text}"</p><small>Category: ${q.category}</small>`;
    quoteDisplay.appendChild(div);
  });
}

function filterQuotes() {
  selectedCategory = categoryFilter.value;
  saveSelectedCategory();
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);
  displayQuotes(filtered);
}

// ---------- Add Quote ----------
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const cat = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !cat) return alert("Please fill in both fields.");

  quotes.push({ text, category: cat });
  saveQuotes();
  populateCategories();
  filterQuotes();
  showNotification("New quote added locally!");

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ---------- Add Quote Form ----------
function createAddQuoteForm() {
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
}

// ---------- Random Quote ----------
function showRandomQuote() {
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);
  if (!filtered.length) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  displayQuotes([random]);
}

// ---------- Import / Export ----------
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const imported = JSON.parse(e.target.result);
    quotes.push(...imported);
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification("Quotes imported successfully!");
  };
  reader.readAsText(file);
}

// ---------- Simulated Server Sync ----------
async function fetchFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const serverData = await res.json();

    // Simulate server quotes based on first 5 posts
    const serverQuotes = serverData.slice(0, 5).map(p => ({
      text: p.title,
      category: "Server"
    }));

    // Conflict resolution: server takes precedence
    const merged = [...quotes.filter(q => q.category !== "Server"), ...serverQuotes];
    quotes = merged;
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification("Data synced with server (server took precedence).", "#2196F3");
  } catch (err) {
    console.error("Server sync failed:", err);
    showNotification("Failed to sync with server.", "#f44336");
  }
}

// Manual sync button
manualSyncBtn.addEventListener("click", fetchFromServer);

// Periodic sync every 30 seconds
setInterval(fetchFromServer, 30000);

// ---------- Init ----------
newQuoteBtn.addEventListener("click", showRandomQuote);
exportJsonBtn.addEventListener("click", exportToJson);
importFileInput.addEventListener("change", importFromJsonFile);

function init() {
  loadQuotes();
  restoreSelectedCategory();
  createAddQuoteForm();
  populateCategories();
  filterQuotes();
  fetchFromServer(); // initial sync
}

init();

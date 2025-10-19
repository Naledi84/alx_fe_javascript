const quotes = [
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  {
    text: "Life is what happens when you're busy making other plans.",
    category: "Life",
  },
];

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  document.getElementById(
    "quoteDisplay"
  ).innerText = `"${quote.text}" - ${quote.category}`;
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);

function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;
  if (text && category) {
    quotes.push({ text, category });
    alert("Quote added!");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  }
}

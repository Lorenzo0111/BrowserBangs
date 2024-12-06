let bangs = [];

async function fetchBangs() {
  try {
    console.log("Fetching bangs...");

    const response = await fetch("https://duckduckgo.com/bang.js");
    if (!response.ok) throw new Error(`An error occurred while fetching bangs`);

    const data = await response.json();
    bangs = data;
  } catch (error) {
    console.error("Failed to fetch bangs:", error);
  }
}

self.addEventListener("install", () => {
  fetchBangs();
});

chrome.omnibox.onInputEntered.addListener((text) => {
  const bang = text.trim();
  const url = `https://www.duckduckgo.com/?q=${encodeURIComponent(`!${bang}`)}`;

  chrome.tabs.create({ url });
});

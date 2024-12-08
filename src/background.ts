// Manually generated typings from https://duckduckgo.com/bang.js
type Bang = {
  c: string;
  d: string;
  r: number;
  s: string;
  sc: string;
  t: string;
  u: string;
};

// Fetch bangs from DuckDuckGo
let bangs: Bang[] = [];

fetchBangs();

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

// Support for omnibox using !
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  const bang = text.trim();
  const bangsMatch = bangs.find((b) => b.t === bang);
  if (!bangsMatch) return;

  const url = bangsMatch.u.replace(/{{{s}}}/g, encodeURIComponent(bang));

  if (disposition === "newForegroundTab" || disposition === "newBackgroundTab")
    chrome.tabs.create({ url });
  else chrome.tabs.update({ url });
});

// Support for search engines
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = new URL(details.url);
    const searchParams = url.searchParams;
    const query = searchParams.get("q") || searchParams.get("p");
    if (!query) return;

    const querySplit = query.split(" ");
    const bang = querySplit.find((q) => q.startsWith("!"))?.slice(1);
    if (!bang) return;

    const bangsMatch = bangs.find((b) => b.t === bang);
    if (!bangsMatch) return;

    const newUrl = bangsMatch.u.replace(
      /{{{s}}}/g,
      encodeURIComponent(query.replace(`!${bang}`, ""))
    );

    return {
      redirectUrl: newUrl,
    };
  },
  {
    urls: [
      "https://www.google.com/search*",
      "https://www.bing.com/search*",
      "https://search.yahoo.com/search*",
    ],
  },
  ["blocking"]
);

// Support for popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== "refresh") return;

  fetchBangs().then(() => {
    sendResponse({ bangs });
  });
});

// 1) Put your Unsplash Access Key here:
const ACCESS_KEY = "0Z6Oo8eKo4ER8RjbU7AOEH6CWTu4gKTYgX9H7XXVen8"; 

// 2) Basic references
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const resultsEl = document.getElementById("results");
const showMoreBtn = document.getElementById("show-more");

// 3) State
let page = 1;
let currentQuery = "";
const PER_PAGE = 15;

// 4) Helpers
function clearResults() {
  resultsEl.innerHTML = "";
}

function setShowMoreVisible(visible) {
  showMoreBtn.style.display = visible ? "block" : "none";
}

function setLoading(loading) {
  showMoreBtn.disabled = loading;
  if (loading) {
    showMoreBtn.textContent = "Loading…";
  } else {
    showMoreBtn.textContent = "Show more";
  }
}

function appendMessage(text, className = "no-results") {
  const p = document.createElement("p");
  p.className = className;
  p.textContent = text;
  resultsEl.appendChild(p);
}

function renderCard(photo) {
  const card = document.createElement("div");
  card.className = "card";

  const img = document.createElement("img");
  img.src = photo.urls.small;
  img.alt = photo.alt_description || photo.description || "Unsplash image";
  img.loading = "lazy";

  const a = document.createElement("a");
  a.href = photo.links.html;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = photo.alt_description || photo.description || "View on Unsplash";

  card.appendChild(img);
  card.appendChild(a);
  resultsEl.appendChild(card);
}

async function fetchPhotos(query, pageNum) {
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("page", String(pageNum));
  url.searchParams.set("per_page", String(PER_PAGE));
  url.searchParams.set("client_id", ACCESS_KEY);

  const res = await fetch(url, {
    headers: {
      "Accept-Version": "v1",
    },
  });

  if (!res.ok) {
    const info = await res.json().catch(() => ({}));
    const msg = info && info.errors ? info.errors.join(", ") : res.statusText;
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }

  return res.json();
}

async function search(query, loadMore = false) {
  try {
    if (!loadMore) {
      page = 1;
      clearResults();
      setShowMoreVisible(false);
    } else {
      setLoading(true);
    }

    const data = await fetchPhotos(query, page);
    const { results, total_pages } = data;

    if (!results || results.length === 0) {
      if (!loadMore) {
        appendMessage("❌ No results found. Try another keyword!", "no-results");
      }
      setShowMoreVisible(false);
      setLoading(false);
      return;
    }

    results.forEach(renderCard);

    // pagination controls
    if (page < total_pages) {
      setShowMoreVisible(true);
    } else {
      setShowMoreVisible(false);
    }

    page += 1;
    setLoading(false);
  } catch (err) {
    if (!loadMore) clearResults();
    appendMessage(`⚠️ Error: ${err.message}`, "error");
    setShowMoreVisible(false);
    setLoading(false);
  }
}

// 5) Events
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = input.value.trim();
  if (!q) return;
  currentQuery = q;
  search(currentQuery, false);
});

showMoreBtn.addEventListener("click", () => {
  if (!currentQuery) return;
  search(currentQuery, true);
});

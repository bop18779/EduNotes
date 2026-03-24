const apiURL = "https://script.google.com/macros/s/AKfycbyKCnmlRS4HtEA4hCq3QMoxPQONj0Cl0xaGeVwKRQIhxFMjftvowfuPbzwxJoXfgOIT/exec";
let allData = [];
let currentState = { view: 'home', category: '', semester: '' };

async function init() {
    const loader = document.getElementById('loader');
    const display = document.getElementById('dynamic-content');

    try {
        // We add a cache-buster to ensure we get fresh data
        const response = await fetch(apiURL + "?nocache=" + new Date().getTime());
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        allData = await response.json();
        
        if (allData.error) {
            display.innerHTML = `<p style="color:red">Backend Error: ${allData.error}</p>`;
            return;
        }

        loader.classList.add('hidden');
        renderHome();
        console.log("Data Loaded Successfully:", allData);
    } catch (e) {
        console.error("Fetch error:", e);
        loader.innerHTML = `
            <div style="padding:20px; border:2px solid red; border-radius:10px;">
                <h3>⚠️ Connection Error</h3>
                <p>Could not connect to the database.</p>
                <p><small>${e.message}</small></p>
                <button onclick="location.reload()">Try Again</button>
            </div>
        `;
    }
}

function renderHome() {
    currentState = { view: 'home' };
    document.getElementById('backBtn').classList.add('hidden');
    const categories = [...new Set(allData.map(item => item.category))];
    const html = categories.map(cat => `<div class="card" onclick="handleCategoryClick('${cat}')"><h2>${cat}</h2></div>`).join('');
    document.getElementById('dynamic-content').innerHTML = `<div class="grid">${html}</div>`;
}

function handleCategoryClick(cat) {
    if (cat.includes('Undergraduate') || cat.includes('Post-Graduate')) {
        renderSemesters(cat);
    } else {
        renderTopics(cat, 'N/A');
    }
}

function renderSemesters(cat) {
    currentState = { view: 'semesters', category: cat };
    document.getElementById('backBtn').classList.remove('hidden');
    const sems = [...new Set(allData.filter(i => i.category === cat).map(i => i.semester))];
    const html = sems.map(s => `<div class="card" onclick="renderTopics('${cat}', '${s}')"><h3>${s}</h3></div>`).join('');
    document.getElementById('dynamic-content').innerHTML = `<h1>${cat}</h1><div class="grid">${html}</div>`;
}

function renderTopics(cat, sem) {
    currentState = { view: 'topics', category: cat, semester: sem };
    document.getElementById('backBtn').classList.remove('hidden');
    const filtered = allData.filter(i => i.category === cat && i.semester === sem);
    const html = filtered.map((item, index) => `
        <div class="topic-item" onclick="renderDetail('${cat}', '${sem}', ${index})">
            <strong>${item.topic}</strong><span>Read →</span>
        </div>`).join('');
    document.getElementById('dynamic-content').innerHTML = `<h1>${cat} - ${sem}</h1>${html}`;
}

function renderDetail(cat, sem, index) {
    const item = allData.filter(i => i.category === cat && i.semester === sem)[index];
    document.getElementById('dynamic-content').innerHTML = `
        <div class="card" style="text-align:left;">
            <button class="print-btn" onclick="window.print()">🖨️ Save as PDF</button>
            <h1>${item.topic}</h1>
            <p style="line-height:1.8">${item.summary}</p>
            <a href="${item.link}" target="_blank">Download Original File</a>
        </div>`;
}

function searchGlobal() {
    const q = document.getElementById('searchBar').value.toLowerCase();
    if(q.length < 2) return;
    const results = allData.filter(i => i.topic.toLowerCase().includes(q));
    const html = results.map(i => `<div class="topic-item" onclick="renderTopics('${i.category}', '${i.semester}')"><b>${i.topic}</b> (${i.category})</div>`).join('');
    document.getElementById('dynamic-content').innerHTML = `<h2>Search Results</h2>${html}`;
}

function goBack() {
    if (currentState.view === 'detail') renderTopics(currentState.category, currentState.semester);
    else if (currentState.view === 'topics' && currentState.semester !== 'N/A') renderSemesters(currentState.category);
    else renderHome();
}

function toggleFocusMode() {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
}

init();

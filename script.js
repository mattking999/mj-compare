// Declare variables
const flowchart = document.getElementById("flowchart");
const results = document.getElementById("results");
let pharmacies = []; // To hold pharmacy data
let userAnswers = {
    selectedPharmacies: [],
    newPharmacies: [],
    bestPrices: []
};

// Toggle for maintenance mode
let maintenanceMode = false;

// Function to fetch pharmacies from Google Sheets
async function fetchPharmaciesFromGoogleSheet() {
    try {
        const response = await fetch("https://docs.google.com/spreadsheets/d/1CTknNL0PDzy4kdbQ5iClckU-K788G-GnrRZkfLwmsL8/gviz/tq?tqx=out:json");
        const data = await response.text();
        const jsonData = JSON.parse(data.substr(47).slice(0, -2));

        pharmacies = jsonData.table.rows.map(row => {
            const pharmacyName = row.c[0]?.v || "Unknown Pharmacy";
            const rating = parseFloat(row.c[32]?.v) || 4.5; 

            const prices = {
                // Price details
                retailPrice_2_5mg: parsePrice(row.c[1]?.v),
                newCustomerPrice_2_5mg: parsePrice(row.c[3]?.v),
                existingCustomerPrice_2_5mg: parsePrice(row.c[5]?.v),
                websiteUrl: row.c[31]?.v || "",
                rating: row.c[32]?.v || 4.5
            };

            return {
                name: pharmacyName,
                ...prices
            };
        });

        startFlowchart();
    } catch (error) {
        console.error("Error fetching data from Google Sheets:", error);
    }
}

// Helper function to parse prices
function parsePrice(priceValue) {
    if (typeof priceValue === 'string') {
        return parseFloat(priceValue.replace('£', '').trim()) || null;
    }
    if (typeof priceValue === 'number') {
        return priceValue;
    }
    return null;
}

// Function to start the flowchart
function startFlowchart() {
    flowchart.innerHTML = "";
    showMaintenanceBanner();

    const question1 = document.createElement("div");
    question1.innerHTML = `
    <h2>Have you ever bought from a UK-based pharmacy?</h2>
    <button id="yesBtn">Yes</button>
    <button id="noBtn">No</button>
    <br><br>

    <!-- Two adverts side by side -->
    <div style="display: flex; justify-content: center; gap: 20px;">
        <a href="https://sovrn.co/uephbk1" target="_blank">
            <img src="logos/advert-image.png" alt="Advert 1" style="width: 200px;">
        </a>
        <a href="https://bit.ly/439Hixj" target="_blank">
            <img src="logos/advert-image2.png" alt="Advert 2" style="width: 200px;">
        </a>
    </div>
    `;

    flowchart.appendChild(question1);

    document.getElementById("yesBtn").onclick = function () {
        userAnswers.previousPurchase = true;
        recordSelectedPharmacies();
    };

    document.getElementById("noBtn").onclick = function () {
        userAnswers.previousPurchase = false;
        userAnswers.newPharmacies = pharmacies.map(pharmacy => pharmacy.name);
        askDoseSelection();
    };
}

// Function to ask dose selection
function askDoseSelection() {
    flowchart.innerHTML = "";
    const question = document.createElement("div");
    question.innerHTML = `
    <h2>Which dose are you looking to compare?</h2>
    <button class="doseBtn" value="2.5mg" style="background-color: #56585c;">2.5mg</button>
    <button class="doseBtn" value="5mg" style="background-color: #3f2a5a;">5mg</button>
    <button class="doseBtn" value="7.5mg" style="background-color: #337e70;">7.5mg</button>
    <button class="doseBtn" value="10mg" style="background-color: #ba2b7d;">10mg</button>
    <button class="doseBtn" value="12.5mg" style="background-color: #3674ba;">12.5mg</button>
    <button class="doseBtn" value="15mg" style="background-color: #ee5243;">15mg</button>
    <br><br>

    <!-- Two adverts side by side -->
    <div id="advert-container" style="display: flex; justify-content: center; gap: 20px;">
        <a href="https://sovrn.co/0uosrf5" target="_blank">
            <img src="logos/advert-image.png" alt="Advert 1" style="width: 200px;">
        </a>
        <a href="https://bit.ly/439Hixj" target="_blank">
            <img src="logos/advert-image2.png" alt="Advert 2" style="width: 200px;">
        </a>
    </div>
    `;

    flowchart.appendChild(question);

    document.querySelectorAll('.doseBtn').forEach(button => {
        button.onclick = function () {
            const selectedDose = this.value;
            calculateBestPriceForDose(selectedDose);

            // Hide adverts once a button is clicked
            document.getElementById("advert-container").style.display = 'none';
        };
    });
}

// Function to show maintenance banner
function showMaintenanceBanner() {
    if (maintenanceMode) {
        const banner = document.createElement("div");
        banner.innerHTML = "<h3 style='color: red;'>We're currently updating the pricing information. Some data may be incorrect during this time.</h3>";
        flowchart.appendChild(banner);
    }
}

// Function to add version number
function addVersionNumber() {
    const versionDiv = document.createElement("div");
    versionDiv.id = "version-number";
    versionDiv.style.position = "absolute";
    versionDiv.style.top = "10px";
    versionDiv.style.right = "10px";
    versionDiv.style.fontSize = "14px";
    versionDiv.style.fontWeight = "bold";
    versionDiv.textContent = "Version 1.0";
    document.body.appendChild(versionDiv);
}

// Function to create a red disclaimer banner
function createTestingBanner() {
    const banner = document.createElement("div");
    banner.style.position = "fixed";
    banner.style.top = "0";
    banner.style.left = "0";
    banner.style.width = "100%";
    banner.style.backgroundColor = "red";
    banner.style.color = "white";
    banner.style.textAlign = "center";
    banner.style.padding = "10px";
    banner.style.zIndex = "1000";
    banner.innerHTML = "By continuing to use this website, you acknowledge and agree to the disclaimer at the bottom of this page.";

    document.body.appendChild(banner);
}

// Initialize when page loads
window.onload = function() {
    fetchPharmaciesFromGoogleSheet();
    addVersionNumber();
    createTestingBanner();
};

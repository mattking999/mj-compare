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
        const data = await response.text(); // Read response as text
        const jsonData = JSON.parse(data.substr(47).slice(0, -2)); // Extract the JSON data
        pharmacies = jsonData.table.rows.map(row => {
            const pharmacyName = row.c[0]?.v || "Unknown Pharmacy";
            const rating = parseFloat(row.c[32]?.v) || 4.5; // Convert to float
            // console.log(`Pharmacy: ${pharmacyName}, Rating: ${rating}`); // Debug log

            const prices = {
                // 2.5mg
                retailPrice_2_5mg: parsePrice(row.c[1]?.v),
                newCustomerCode_2_5mg: row.c[2]?.v || "",
                newCustomerPrice_2_5mg: parsePrice(row.c[3]?.v),
                existingCustomerCode_2_5mg: row.c[4]?.v || "",
                existingCustomerPrice_2_5mg: parsePrice(row.c[5]?.v),

                // 5mg
                retailPrice_5mg: parsePrice(row.c[6]?.v),
                newCustomerCode_5mg: row.c[7]?.v || "",
                newCustomerPrice_5mg: parsePrice(row.c[8]?.v),
                existingCustomerCode_5mg: row.c[9]?.v || "",
                existingCustomerPrice_5mg: parsePrice(row.c[10]?.v),

                // 7.5mg
                retailPrice_7_5mg: parsePrice(row.c[11]?.v),
                newCustomerCode_7_5mg: row.c[12]?.v || "",
                newCustomerPrice_7_5mg: parsePrice(row.c[13]?.v),
                existingCustomerCode_7_5mg: row.c[14]?.v || "",
                existingCustomerPrice_7_5mg: parsePrice(row.c[15]?.v),

                // 10mg
                retailPrice_10mg: parsePrice(row.c[16]?.v),
                newCustomerCode_10mg: row.c[17]?.v || "",
                newCustomerPrice_10mg: parsePrice(row.c[18]?.v),
                existingCustomerCode_10mg: row.c[19]?.v || "",
                existingCustomerPrice_10mg: parsePrice(row.c[20]?.v),

                // 12.5mg
                retailPrice_12_5mg: parsePrice(row.c[21]?.v),
                newCustomerCode_12_5mg: row.c[22]?.v || "",
                newCustomerPrice_12_5mg: parsePrice(row.c[23]?.v),
                existingCustomerCode_12_5mg: row.c[24]?.v || "",
                existingCustomerPrice_12_5mg: parsePrice(row.c[25]?.v),

                // 15mg
                retailPrice_15mg: parsePrice(row.c[26]?.v),
                newCustomerCode_15mg: row.c[27]?.v || "",
                newCustomerPrice_15mg: parsePrice(row.c[28]?.v),
                existingCustomerCode_15mg: row.c[29]?.v || "",
                existingCustomerPrice_15mg: parsePrice(row.c[30]?.v),

                // Website URL
                websiteUrl: row.c[31]?.v || "",
            
                // **Rating**
                rating: row.c[32]?.v || 4.5 // Assuming column 32 is the new "Rating" column
            };

            return {
                name: pharmacyName,
                ...prices
            };
        });
        //console.log(pharmacies); // Debug log to see all pharmacy data
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

// Function to render star ratings
function renderStars(rating) {
    let starImage = '';

    if (rating >= 4.8 && rating <= 5.0) {
        starImage = '5_star.png';
    } else if (rating >= 4.3 && rating < 4.8) {
        starImage = '4_5_star.png';
    } else if (rating >= 3.8 && rating < 4.3) {
        starImage = '4_star.png';
    } else if (rating >= 3.3 && rating < 3.8) {
        starImage = '3_5_star.png';
    } else if (rating >= 2.8 && rating < 3.3) {
        starImage = '3_star.png';
    } else if (rating >= 2.3 && rating < 2.8) {
        starImage = '2_5_star.png';
    } else if (rating >= 1.8 && rating < 2.3) {
        starImage = '2_star.png';
    } else if (rating >= 1.3 && rating < 1.8) {
        starImage = '1_5_star.png';
    } else if (rating >= 1.0 && rating < 1.3) {
        starImage = '1_star.png';
    } else {
        starImage = '0_star.png';
    }

    return `<img src="logos/${starImage}" alt="${rating} stars" style="width: 100px;">`;
}

// Function to show results
function showResults() {
    results.innerHTML = ""; 
    if (userAnswers.bestPrices.length > 0) {
        let message = "<h2>Best Prices</h2><div style='display: flex; justify-content: space-between;'>"; 
        userAnswers.bestPrices.forEach((pharmacy) => {
            const baseName = pharmacy.name.replace(/\s+/g, '').toLowerCase(); // Base name for logo
            const logoFileNamePng = `${baseName}-logo.png`; // For PNG format
            const logoFileNameJpeg = `${baseName}-logo.jpeg`; // For JPEG format
            const logoPathPng = `logos/${logoFileNamePng}`; // Path for PNG
            const logoPathJpeg = `logos/${logoFileNameJpeg}`; // Path for JPEG

            const rating = pharmacy.rating || 4.5; // Example rating; adjust based on your data source
            // console.log(`Rendering stars for ${pharmacy.name}: ${rating}`);
            const starRating = renderStars(rating); // Get the correct star rating image

            // Create the result box
            message += `<div style="flex: 1; padding: 10px; border: 1px solid black; margin: 10px; max-width: 300px;">
                <img src="${logoPathPng}" alt="${pharmacy.name}" style="max-width: 100px;" 
                    onerror="this.onerror=null; this.src='${logoPathJpeg}'; this.onerror=function(){ this.style.display='none'; this.parentElement.querySelector('.fallback-text').style.display='block'; };">
                <p class="fallback-text" style="display: none;"><strong>${pharmacy.name}</strong></p>
                ${starRating} <!-- Show the appropriate star rating -->
                ${pharmacy.discountCode ? 
                    (pharmacy.price < pharmacy.retailPrice ? 
                        `<p style="text-decoration: line-through; color: red;">Retail Price: £${pharmacy.retailPrice.toFixed(2)}</p>` : 
                        `<p>Retail Price: £${pharmacy.retailPrice.toFixed(2)}</p>`) + 
                    `<p>Discounted Price: £${pharmacy.price.toFixed(2)}</p>` : 
                    `<p>Price: £${pharmacy.price.toFixed(2)}</p>`
                }
                <p><a href="${pharmacy.website}" target="_blank">Visit Pharmacy</a></p>
                ${pharmacy.discountCode ? `<p><strong>Discount Code:</strong> ${pharmacy.discountCode}</p>` : ''}
            </div>`;
        });
        message += "</div>";
        results.innerHTML = message;
    } else {
        results.innerHTML = "<h2>No prices found for the selected options.</h2>";
    }
}

// Function to start the flowchart (unchanged)
function startFlowchart() {
    flowchart.innerHTML = ""; 
    showMaintenanceBanner(); 

    const question1 = document.createElement("div");
    question1.innerHTML = `<h2>Have you ever bought Mounjaro from a UK-based pharmacy?</h2>
        <button id="yesBtn">Yes</button>
        <button id="noBtn">No</button>`;
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

// Function to record selected pharmacies
function recordSelectedPharmacies() {
    flowchart.innerHTML = ""; 
    const question = document.createElement("div");
    question.innerHTML = "<h2>Select the pharmacies you've bought Mounjaro from:</h2>";
    
    pharmacies.forEach(pharmacy => {
        question.innerHTML += `<label>
            <input type="checkbox" name="pharmacy" value="${pharmacy.name}"> ${pharmacy.name}
        </label><br>`;
    });

    const nextButton = document.createElement("button");
    nextButton.innerText = "Next";
    question.appendChild(nextButton);
    flowchart.appendChild(question);

    nextButton.onclick = function () {
        const checkboxes = document.querySelectorAll('input[name="pharmacy"]:checked');
        userAnswers.selectedPharmacies = Array.from(checkboxes).map(checkbox => checkbox.value);
        userAnswers.newPharmacies = pharmacies
            .map(pharmacy => pharmacy.name)
            .filter(name => !userAnswers.selectedPharmacies.includes(name));
        askDoseSelection();
    };
}

// Function to ask the dose selection
function askDoseSelection() {
    flowchart.innerHTML = ""; 
    const question = document.createElement("div");
    question.innerHTML = `<h2>Which dose of Mounjaro are you looking to purchase?</h2>
        <button class="doseBtn" value="2.5mg">2.5mg</button>
        <button class="doseBtn" value="5mg">5mg</button>
        <button class="doseBtn" value="7.5mg">7.5mg</button>
        <button class="doseBtn" value="10mg">10mg</button>
        <button class="doseBtn" value="12.5mg">12.5mg</button>
        <button class="doseBtn" value="15mg">15mg</button>`;
    flowchart.appendChild(question);

    document.querySelectorAll('.doseBtn').forEach(button => {
        button.onclick = function () {
            const selectedDose = this.value;
            calculateBestPriceForDose(selectedDose);
        };
    });
}

// Function to calculate best price for a selected dose
function calculateBestPriceForDose(dose) {
    let priceList = [];

    // New customers: Add prices from new pharmacies
    userAnswers.newPharmacies.forEach(pharmacyName => {
        const pharmacy = pharmacies.find(p => p.name === pharmacyName);
        if (!pharmacy) return;

        let newCustomerPrice = pharmacy[`newCustomerPrice_${dose.replace('.', '_')}`] || pharmacy[`retailPrice_${dose.replace('.', '_')}`];
        if (newCustomerPrice !== null) {
            priceList.push({
                name: pharmacy.name,
                price: newCustomerPrice,
                website: pharmacy.websiteUrl,
                discountCode: pharmacy[`newCustomerCode_${dose.replace('.', '_')}`], // Add discount code for new customers
                retailPrice: pharmacy[`retailPrice_${dose.replace('.', '_')}`], // Add retail price here
                rating: pharmacy.rating
            });
        }
    });

    // Existing customers: Add prices from selected pharmacies
    userAnswers.selectedPharmacies.forEach(pharmacyName => {
        const pharmacy = pharmacies.find(p => p.name === pharmacyName);
        if (!pharmacy) return;

        let existingCustomerPrice = pharmacy[`existingCustomerPrice_${dose.replace('.', '_')}`] || pharmacy[`retailPrice_${dose.replace('.', '_')}`];
        if (existingCustomerPrice !== null) {
            priceList.push({
                name: pharmacy.name,
                price: existingCustomerPrice,
                website: pharmacy.websiteUrl,
                discountCode: pharmacy[`existingCustomerCode_${dose.replace('.', '_')}`], // Add discount code for existing customers
                retailPrice: pharmacy[`retailPrice_${dose.replace('.', '_')}`], // Add retail price here
                rating: pharmacy.rating
            });
        }
    });

    priceList.sort((a, b) => a.price - b.price);
    userAnswers.bestPrices = priceList.slice(0, 3);
    showResults(); // Call showResults without dose parameter
}

// Function to show maintenance banner
function showMaintenanceBanner() {
    if (maintenanceMode) {
        const banner = document.createElement("div");
        banner.innerHTML = "<h3 style='color: red;'>Maintenance Mode: Some features may be unavailable.</h3>";
        flowchart.appendChild(banner);
    }
}

// Add version number to the top right corner
function addVersionNumber() {
    const versionDiv = document.createElement("div");
    versionDiv.id = "version-number";
    versionDiv.style.position = "absolute";
    versionDiv.style.top = "10px";
    versionDiv.style.right = "10px";
    versionDiv.style.fontSize = "14px";
    versionDiv.style.fontWeight = "bold";
    versionDiv.textContent = "Version 0.0.3"; // Change this version number as needed
    document.body.appendChild(versionDiv);
}

window.onload = function() {
    fetchPharmaciesFromGoogleSheet(); // Fetch data from Google Sheets
    addVersionNumber(); // Add the version number when the page loads
};

// =====================================================
// DREAMBOX RATE CALCULATOR
// =====================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbz9grJ1TvwRIB17cOhkWgwRO0Bf8sputsLoH4_xx2t15UE_XCiKxQb0SPKrxhQQHbQQ/exec";


// =====================================================
// DOM ELEMENTS
// =====================================================

const form = document.querySelector("#rateForm");

const fromSelect = document.querySelector("#from");

const toSelect = document.querySelector("#to");

const citySelect = document.querySelector("#city");

const weightInput = document.querySelector("#weight");

const result = document.querySelector("#result");

const price = document.querySelector("#price");

const summary = document.querySelector("#summary");

const reset = document.querySelector("#reset");

const calculateBtn = document.querySelector("#calculateBtn");


// =====================================================
// STORE LOCATION DATA
// =====================================================

// This will contain the information returned
// from Google Sheets through the API.

let locationData = {};


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", loadLocations);


// =====================================================
// LOAD LOCATIONS FROM GOOGLE SHEETS
// =====================================================

async function loadLocations() {

  try {

    fromSelect.disabled = true;

    toSelect.disabled = true;

    citySelect.disabled = true;

    fromSelect.innerHTML =
      '<option value="">Loading locations...</option>';


    const response = await fetch(
      `${API_URL}?action=locations`
    );


    if (!response.ok) {

      throw new Error(
        "Unable to connect to the pricing server."
      );

    }


    const data = await response.json();


    if (!data.success) {

      throw new Error(
        data.message || "Unable to load locations."
      );

    }


    // Save location data

    locationData = data.locations || {};


    // Populate pickup locations

    populatePickupLocations(locationData);


  } catch (error) {

    console.error("Location loading error:", error);

    fromSelect.innerHTML =
      '<option value="">Unable to load locations</option>';

    alert(
      "Unable to load delivery locations. Please refresh the page and try again."
    );

  }

}


// =====================================================
// POPULATE PICKUP LOCATIONS
// =====================================================

function populatePickupLocations(locations) {

  fromSelect.innerHTML =
    '<option value="">Select location</option>';


  Object.keys(locations)
    .sort()
    .forEach(pickup => {

      const option = document.createElement("option");

      option.value = pickup;

      option.textContent = pickup;

      fromSelect.appendChild(option);

    });


  fromSelect.disabled = false;

}


// =====================================================
// PICKUP LOCATION CHANGED
// =====================================================

fromSelect.addEventListener("change", () => {

  const pickup = fromSelect.value;


  // Reset destination

  toSelect.innerHTML =
    '<option value="">Select destination state</option>';

  citySelect.innerHTML =
    '<option value="">Select destination city</option>';


  toSelect.disabled = true;

  citySelect.disabled = true;


  if (!pickup) {

    return;

  }


  const destinations = locationData[pickup];


  if (!destinations) {

    return;

  }


  // Add available states for this pickup location

  Object.keys(destinations)
    .sort()
    .forEach(state => {

      const option = document.createElement("option");

      option.value = state;

      option.textContent = state;

      toSelect.appendChild(option);

    });


  toSelect.disabled = false;

});


// =====================================================
// DESTINATION STATE CHANGED
// =====================================================

toSelect.addEventListener("change", () => {

  const pickup = fromSelect.value;

  const destination = toSelect.value;


  // Reset city

  citySelect.innerHTML =
    '<option value="">Select destination city</option>';

  citySelect.disabled = true;


  if (!pickup || !destination) {

    return;

  }


  const cities =
    locationData[pickup]?.[destination];


  if (!cities || !Array.isArray(cities)) {

    return;

  }


  // Populate cities belonging ONLY
  // to the selected state

  cities
    .sort()
    .forEach(city => {

      const option = document.createElement("option");

      option.value = city;

      option.textContent = city;

      citySelect.appendChild(option);

    });


  citySelect.disabled = false;

});


// =====================================================
// FORM SUBMISSION
// =====================================================

form.addEventListener("submit", async (e) => {

  e.preventDefault();


  const from = fromSelect.value;

  const destination = toSelect.value;

  const city = citySelect.value;

  const weight = Number(weightInput.value);


  // ===================================================
  // VALIDATION
  // ===================================================

  if (!from) {

    alert("Please select your pickup location.");

    return;

  }


  if (!destination) {

    alert("Please select a destination state.");

    return;

  }


  if (!city) {

    alert("Please select a destination city.");

    return;

  }


  if (!weight || weight <= 0) {

    alert("Please enter a valid package weight.");

    return;

  }


  // ===================================================
  // DISABLE BUTTON WHILE LOADING
  // ===================================================

  calculateBtn.disabled = true;

  calculateBtn.innerHTML =
    "Calculating...";


  try {


    // =================================================
    // BUILD API REQUEST
    // =================================================

    const url =
      `${API_URL}` +
      `?action=rate` +
      `&pickup=${encodeURIComponent(from)}` +
      `&destination=${encodeURIComponent(destination)}` +
      `&city=${encodeURIComponent(city)}` +
      `&weight=${encodeURIComponent(weight)}`;


    // =================================================
    // CALL GOOGLE APPS SCRIPT
    // =================================================

    const response = await fetch(url);


    if (!response.ok) {

      throw new Error(
        "Unable to connect to the pricing server."
      );

    }


    const data = await response.json();


    // =================================================
    // CHECK API RESULT
    // =================================================

    if (!data.success) {

      alert(
        data.message ||
        "No delivery rate was found."
      );

      return;

    }


    // =================================================
    // GET PRICE
    // =================================================

    const estimate = Number(data.price);


    if (isNaN(estimate)) {

      throw new Error(
        "The API returned an invalid price."
      );

    }


    // =================================================
    // DISPLAY PRICE
    // =================================================

    price.textContent =
      new Intl.NumberFormat("en-NG", {

        style: "currency",

        currency: "NGN",

        maximumFractionDigits: 0

      }).format(estimate);


    // =================================================
    // DISPLAY SUMMARY
    // =================================================

    summary.textContent =
      `${weight} kg • ${from} → ${destination} → ${city} • ${data.weightBracket}`;


    // =================================================
    // SHOW RESULT
    // =================================================

    result.hidden = false;


    result.scrollIntoView({

      behavior: "smooth",

      block: "center"

    });


  } catch (error) {

    console.error(error);

    alert(
      "Unable to retrieve the delivery rate. Please try again."
    );


  } finally {

    calculateBtn.disabled = false;

    calculateBtn.innerHTML =
      'Calculate rate <span>→</span>';

  }

});


// =====================================================
// RESET
// =====================================================

reset.addEventListener("click", () => {

  result.hidden = true;

  form.reset();


  // Reset destination

  toSelect.innerHTML =
    '<option value="">Select destination state</option>';

  toSelect.disabled = true;


  // Reset city

  citySelect.innerHTML =
    '<option value="">Select destination city</option>';

  citySelect.disabled = true;


  window.scrollTo({

    top:
      document.querySelector(".rate-section").offsetTop - 25,

    behavior: "smooth"

  });

});
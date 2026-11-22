(function () {
  "use strict";

  // Official LTFRB Landmarks and Distance Database (Centro - Alibagu Route)
  // Calibrated per official LTFRB Air-Conditioned Modern PUJ Tariff
  const LTFRB_LANDMARKS = [
    {
      id: 0,
      name: "Rizal Park",
      zone: "Centro Zone",
      distanceKm: 0.00,
      officialFare: { regular: 17.00, discount: 13.50 }
    },
    {
      id: 1,
      name: "Ilagan City Hall",
      zone: "Centro Zone",
      distanceKm: 0.64,
      officialFare: { regular: 17.00, discount: 13.50 }
    },
    {
      id: 2,
      name: "Paguirigan Memorial Park",
      zone: "Centro Zone",
      distanceKm: 0.95,
      officialFare: { regular: 17.00, discount: 13.50 }
    },
    {
      id: 3,
      name: "Casa del Niño Montessori School of Ilagan",
      zone: "Guinatan",
      distanceKm: 1.90,
      officialFare: { regular: 17.00, discount: 13.50 }
    },
    {
      id: 4,
      name: "Brgy. Guinatan Covered Court",
      zone: "Guinatan",
      distanceKm: 2.49,
      officialFare: { regular: 17.00, discount: 13.50 }
    },
    {
      id: 5,
      name: "Puregold Ilagan Isabela",
      zone: "Calamagui 2nd",
      distanceKm: 3.30,
      officialFare: { regular: 17.00, discount: 13.50 }
    },
    {
      id: 6,
      name: "Robinsons Supermarket Ilagan",
      zone: "Calamagui 2nd",
      distanceKm: 3.95,
      officialFare: { regular: 17.00, discount: 13.50 }
    },
    {
      id: 7,
      name: "Isabela Doctor's General Hospital (IDGH)",
      zone: "Baligatan",
      distanceKm: 5.30,
      officialFare: { regular: 20.00, discount: 16.00 }
    },
    {
      id: 8,
      name: "Queen Isabela Park",
      zone: "Alibagu",
      distanceKm: 6.95,
      officialFare: { regular: 24.00, discount: 19.25 }
    },
    {
      id: 9,
      name: "Northstar Mall",
      zone: "Alibagu",
      distanceKm: 8.10,
      officialFare: { regular: 26.75, discount: 21.50 }
    }
  ];

  // Mathematical Parameters from Official LTFRB Modern PUJ (Air-Con) Matrix
  const BASE_DISTANCE_KM = 4.0;
  const BASE_REGULAR_FARE = 17.00;
  const BASE_DISCOUNT_FARE = 13.50;
  const DISCOUNT_FORMULA_BASE = 13.60;
  const PER_KM_REGULAR = 2.40;
  const PER_KM_DISCOUNT = 1.92;

  const originSelect = document.getElementById("origin");
  const destSelect = document.getElementById("destination");
  const passengerRadios = document.querySelectorAll('input[name="passenger-type"]');
  const labelRegular = document.getElementById("label-regular");
  const labelDiscounted = document.getElementById("label-discounted");
  const swapBtn = document.getElementById("swap-btn");
  const navTabs = document.querySelectorAll(".nav-tab");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const advisoryText = document.getElementById("advisory-text");

  // Rounds to the nearest 0.25 (standard LTFRB quarter-peso rounding rule)
  function roundToQuarter(value) {
    return Math.round(value * 4) / 4;
  }

  function getSelectedPassengerType() {
    const checked = document.querySelector('input[name="passenger-type"]:checked');
    return checked ? checked.value : "regular";
  }

  function updatePassengerRadioStyles() {
    const selectedType = getSelectedPassengerType();
    if (selectedType === "discounted") {
      labelDiscounted.classList.add("active");
      labelRegular.classList.remove("active");
    } else {
      labelRegular.classList.add("active");
      labelDiscounted.classList.remove("active");
    }
  }

  function calculateFare(originPoint, destPoint, isDiscounted) {
    // If one end of the trip is Rizal Park (0.00 km mark), match exact official matrix values
    if (originPoint.id === 0 && destPoint.id !== 0) {
      return isDiscounted ? destPoint.officialFare.discount : destPoint.officialFare.regular;
    }
    if (destPoint.id === 0 && originPoint.id !== 0) {
      return isDiscounted ? originPoint.officialFare.discount : originPoint.officialFare.regular;
    }

    // Point-to-Point distance computation: |Origin_km - Dest_km|
    const tripDistance = Math.abs(originPoint.distanceKm - destPoint.distanceKm);

    if (tripDistance <= BASE_DISTANCE_KM) {
      return isDiscounted ? BASE_DISCOUNT_FARE : BASE_REGULAR_FARE;
    }

    const excessKm = tripDistance - BASE_DISTANCE_KM;
    if (isDiscounted) {
      return roundToQuarter(DISCOUNT_FORMULA_BASE + (excessKm * PER_KM_DISCOUNT));
    } else {
      return roundToQuarter(BASE_REGULAR_FARE + (excessKm * PER_KM_REGULAR));
    }
  }

  function computeAndRender() {
    const originIdx = parseInt(originSelect.value, 10);
    const destIdx = parseInt(destSelect.value, 10);
    const passType = getSelectedPassengerType();

    updatePassengerRadioStyles();

    if (isNaN(originIdx) || isNaN(destIdx)) return;

    const originPoint = LTFRB_LANDMARKS[originIdx];
    const destPoint = LTFRB_LANDMARKS[destIdx];
    const isDiscounted = (passType === "discounted");

    const travelDistance = Math.abs(originPoint.distanceKm - destPoint.distanceKm);
    const computedFare = calculateFare(originPoint, destPoint, isDiscounted);

    // Update Output Elements
    document.getElementById("fare-amount").textContent = "₱" + computedFare.toFixed(2);

    const passengerLabel = isDiscounted 
      ? "Student / Senior Citizen / PWD (20% Statutory Discount)" 
      : "Regular Passenger (Standard Fare)";

    // Update Summary Badges
    document.getElementById("badge-point-a").textContent = `${originPoint.zone} (${originPoint.name})`;
    document.getElementById("badge-point-b").textContent = `${destPoint.zone} (${destPoint.name})`;

    // Update Detail Rows
    document.getElementById("detail-point-a").textContent = `${originPoint.zone} – ${originPoint.name} (${originPoint.distanceKm.toFixed(2)} km mark)`;
    document.getElementById("detail-point-b").textContent = `${destPoint.zone} – ${destPoint.name} (${destPoint.distanceKm.toFixed(2)} km mark)`;
    
    let distanceDetail = `${travelDistance.toFixed(2)} km `;
    if (travelDistance === 0) {
      distanceDetail += "(Same Boarding and Alighting Point)";
    } else if (travelDistance <= BASE_DISTANCE_KM) {
      distanceDetail += "(Within 4.0 km Base Fare Zone)";
    } else {
      const excess = travelDistance - BASE_DISTANCE_KM;
      distanceDetail += `(${excess.toFixed(2)} km beyond 4.0 km)`;
    }

    document.getElementById("detail-distance").textContent = distanceDetail;
    document.getElementById("detail-passenger").textContent = passengerLabel;

    // Dynamic RA 10909 Cash Advisory Guidance
    if (advisoryText) {
      const fraction = computedFare % 1;
      const baseFloor = Math.floor(computedFare);
      if (fraction === 0.25) {
        advisoryText.innerHTML = `Legal LTFRB rate is <strong>₱${computedFare.toFixed(2)}</strong>. If no 25¢ coins are available in cash, customary payment rounds down to <strong>₱${baseFloor}.00</strong> under <strong>RA 10909 (No Shortchanging Act)</strong>. Demanding ₱${baseFloor + 1} or more is unlawful.`;
      } else if (fraction === 0.75) {
        advisoryText.innerHTML = `Legal LTFRB rate is <strong>₱${computedFare.toFixed(2)}</strong>. In physical cash without 25¢ coins, customary payment rounds to <strong>₱${baseFloor + 1}.00</strong>. Demanding higher arbitrary fares is unlawful.`;
      } else {
        advisoryText.innerHTML = `Under <strong>Republic Act No. 10909</strong>, exact change is a consumer right. Drivers must not round up fares arbitrarily.`;
      }
    }
  }

  function swapLocations() {
    const currentOrigin = originSelect.value;
    originSelect.value = destSelect.value;
    destSelect.value = currentOrigin;
    computeAndRender();
  }

  function switchTab(targetPanelId) {
    navTabs.forEach(function (tab) {
      const isTarget = tab.getAttribute("aria-controls") === targetPanelId;
      tab.classList.toggle("active", isTarget);
      tab.setAttribute("aria-selected", isTarget ? "true" : "false");
    });

    tabPanels.forEach(function (panel) {
      const isTarget = panel.id === targetPanelId;
      if (isTarget) {
        panel.removeAttribute("hidden");
        panel.classList.add("active");
      } else {
        panel.setAttribute("hidden", "hidden");
        panel.classList.remove("active");
      }
    });
  }

  originSelect.addEventListener("change", computeAndRender);
  destSelect.addEventListener("change", computeAndRender);

  if (swapBtn) {
    swapBtn.addEventListener("click", swapLocations);
  }

  passengerRadios.forEach(function (radio) {
    radio.addEventListener("change", computeAndRender);
  });

  navTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      const targetId = this.getAttribute("aria-controls");
      if (targetId) {
        switchTab(targetId);
      }
    });
  });

  document.getElementById("fare-form").addEventListener("submit", function (e) {
    e.preventDefault();
    computeAndRender();
  });

  document.addEventListener("DOMContentLoaded", computeAndRender);
})();
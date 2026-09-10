(function () {
  "use strict";

  // Official LTFRB Landmarks and Distance Database (Centro - Alibagu Route)
  // Updated per LTFRB Order dated October 03, 2023 (Effective October 08, 2023):
  // Base Fare (First 4 km): ₱15.00 Regular / ₱12.00 Discounted
  // Succeeding km: +₱2.20/km Regular / +₱1.76/km Discounted (Quarter-peso rounded)
  const LTFRB_LANDMARKS = [
    {
      id: 0,
      name: "Rizal Park",
      zone: "Centro",
      distanceKm: 0.00,
      officialFare: { regular: 15.00, discount: 12.00 }
    },
    {
      id: 1,
      name: "Ilagan City Hall",
      zone: "Centro",
      distanceKm: 0.64,
      officialFare: { regular: 15.00, discount: 12.00 }
    },
    {
      id: 2,
      name: "Paguirigan Memorial Park",
      zone: "Centro",
      distanceKm: 0.95,
      officialFare: { regular: 15.00, discount: 12.00 }
    },
    {
      id: 3,
      name: "Casa del Niño Montessori School of Ilagan",
      zone: "Guinatan",
      distanceKm: 1.90,
      officialFare: { regular: 15.00, discount: 12.00 }
    },
    {
      id: 4,
      name: "Brgy. Guinatan Covered Court",
      zone: "Guinatan",
      distanceKm: 2.49,
      officialFare: { regular: 15.00, discount: 12.00 }
    },
    {
      id: 5,
      name: "Puregold Ilagan Isabela",
      zone: "Osmeña",
      distanceKm: 3.30,
      officialFare: { regular: 15.00, discount: 12.00 }
    },
    {
      id: 6,
      name: "Robinsons Supermarket Ilagan",
      zone: "Osmeña",
      distanceKm: 3.95,
      officialFare: { regular: 15.00, discount: 12.00 }
    },
    {
      id: 7,
      name: "Isabela Doctor's General Hospital (IDGH)",
      zone: "Calamagui 1st",
      distanceKm: 5.30,
      officialFare: { regular: 17.75, discount: 14.25 }
    },
    {
      id: 8,
      name: "Hotel Mills and Rain",
      zone: "Calamagui 1st",
      distanceKm: 6.22,
      officialFare: { regular: 20.00, discount: 16.00 }
    },
    {
      id: 9,
      name: "Queen Isabela Park",
      zone: "Calamagui 2nd",
      distanceKm: 6.95,
      officialFare: { regular: 21.50, discount: 17.25 }
    },
    {
      id: 10,
      name: "Philippine Statistics Authority - Isabela Provincial Office",
      zone: "Baligatan",
      distanceKm: 7.31,
      officialFare: { regular: 22.25, discount: 17.75 }
    },
    {
      id: 11,
      name: "Northstar Mall",
      zone: "Alibagu",
      distanceKm: 8.10,
      officialFare: { regular: 24.00, discount: 19.25 }
    }
  ];

  // Mathematical Parameters from Official LTFRB Modern PUJ (Air-Con) Matrix
  const BASE_DISTANCE_KM = 4.0;
  const BASE_REGULAR_FARE = 15.00;
  const BASE_DISCOUNT_FARE = 12.00;
  const PER_KM_REGULAR = 2.20;
  const PER_KM_DISCOUNT = 1.76;

  const originSelect = document.getElementById("origin");
  const destSelect = document.getElementById("destination");
  const passengerRadios = document.querySelectorAll('input[name="passenger-type"]');
  const labelRegular = document.getElementById("label-regular");
  const labelDiscounted = document.getElementById("label-discounted");
  const swapBtn = document.getElementById("swap-btn");

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
      return roundToQuarter(BASE_DISCOUNT_FARE + (excessKm * PER_KM_DISCOUNT));
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
  }

  function swapLocations() {
    const currentOrigin = originSelect.value;
    originSelect.value = destSelect.value;
    destSelect.value = currentOrigin;
    computeAndRender();
  }

  originSelect.addEventListener("change", computeAndRender);
  destSelect.addEventListener("change", computeAndRender);

  if (swapBtn) {
    swapBtn.addEventListener("click", swapLocations);
  }

  passengerRadios.forEach(function (radio) {
    radio.addEventListener("change", computeAndRender);
  });

  document.getElementById("fare-form").addEventListener("submit", function (e) {
    e.preventDefault();
    computeAndRender();
  });

  document.addEventListener("DOMContentLoaded", computeAndRender);
})();
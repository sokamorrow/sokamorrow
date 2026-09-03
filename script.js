(function () {
  "use strict";

  // Designated Travel Zones from the Research Paper (Paradigm, Page 3)
  // Cross-referenced with LTFRB Modernized PUJ Fare Matrix (Case No. 2022-02-0031)
  const DESIGNATED_ZONES = [
    {
      code: "Zone A",
      name: "Centro",
      landmarks: "Rizal Park, Ilagan City Hall, Paguirigan Memorial Park",
      distance: 0.00,
      regularFare: 14.00,
      discountFare: 11.20
    },
    {
      code: "Zone B",
      name: "Guinatan",
      landmarks: "Casa Del Niño Montessori School of Ilagan, Brgy. Guinatan Covered Court",
      distance: 2.49,
      regularFare: 14.00,
      discountFare: 11.20
    },
    {
      code: "Zone C",
      name: "Osmeña",
      landmarks: "Puregold Ilagan Isabela, Robinsons Supermarket Ilagan",
      distance: 3.95,
      regularFare: 14.00,
      discountFare: 11.20
    },
    {
      code: "Zone D",
      name: "Calamagui",
      landmarks: "Isabela Doctor's General Hospital (IDGH), Hotel Mills and Rain",
      distance: 6.22,
      regularFare: 19.00,
      discountFare: 15.00
    },
    {
      code: "Zone E",
      name: "Calamagui (2nd)",
      landmarks: "Queen Isabela Park, Philippine Statistics Authority (PSA)",
      distance: 7.31,
      regularFare: 21.25,
      discountFare: 17.00
    },
    {
      code: "Zone F",
      name: "Baligatan / Alibagu",
      landmarks: "Northstar Mall (Alibagu), Savemore Market City Mall",
      distance: 8.10,
      regularFare: 23.00,
      discountFare: 18.50
    }
  ];

  const BASE_DISTANCE_KM = 4.0;
  const BASE_REGULAR_FARE = 14.00;
  const BASE_DISCOUNT_FARE = 11.20;
  const PER_KM_REGULAR = 2.20;
  const PER_KM_DISCOUNT = 1.76;

  const originSelect = document.getElementById("origin");
  const destSelect = document.getElementById("destination");
  const passTypeSelect = document.getElementById("passenger-type");

  function roundFare(val) {
    return Math.round(val * 4) / 4;
  }

  function computeAndRender() {
    const originIdx = parseInt(originSelect.value, 10);
    const destIdx = parseInt(destSelect.value, 10);
    const passType = passTypeSelect.value;

    if (isNaN(originIdx) || isNaN(destIdx)) return;

    const zoneA = DESIGNATED_ZONES[originIdx];
    const zoneB = DESIGNATED_ZONES[destIdx];

    const travelDistance = Math.abs(zoneB.distance - zoneA.distance);
    const isDiscounted = (passType === "student" || passType === "senior" || passType === "pwd");

    let computedFare = 0;

    if (originIdx === 0 && destIdx !== 0) {
      computedFare = isDiscounted ? zoneB.discountFare : zoneB.regularFare;
    } else if (destIdx === 0 && originIdx !== 0) {
      computedFare = isDiscounted ? zoneA.discountFare : zoneA.regularFare;
    } else {
      if (travelDistance <= BASE_DISTANCE_KM) {
        computedFare = isDiscounted ? BASE_DISCOUNT_FARE : BASE_REGULAR_FARE;
      } else {
        const extraKm = travelDistance - BASE_DISTANCE_KM;
        if (isDiscounted) {
          computedFare = roundFare(BASE_DISCOUNT_FARE + (extraKm * PER_KM_DISCOUNT));
        } else {
          computedFare = roundFare(BASE_REGULAR_FARE + (extraKm * PER_KM_REGULAR));
        }
      }
    }

    document.getElementById("fare-amount").textContent = "₱" + computedFare.toFixed(2);

    let passengerLabel = "Regular";
    if (passType === "student") passengerLabel = "Student (20% Discount)";
    else if (passType === "senior") passengerLabel = "Senior Citizen (20% Discount)";
    else if (passType === "pwd") passengerLabel = "PWD (20% Discount)";

    const zonesCrossed = Math.abs(destIdx - originIdx);
    let zoneMovementText = "";
    if (zonesCrossed === 0) {
      zoneMovementText = `${zoneA.code} ➔ ${zoneB.code} (Same Zone Travel)`;
    } else if (zonesCrossed === 1) {
      zoneMovementText = `${zoneA.code} ➔ ${zoneB.code} (Adjacent Zone - 1 Zone Crossed)`;
    } else {
      zoneMovementText = `${zoneA.code} ➔ ${zoneB.code} (Multi-Zone - ${zonesCrossed} Zones Crossed)`;
    }

    document.getElementById("badge-point-a").textContent = `${zoneA.code}: ${zoneA.name}`;
    document.getElementById("badge-point-b").textContent = `${zoneB.code}: ${zoneB.name}`;

    document.getElementById("detail-zones").textContent = zoneMovementText;
    document.getElementById("detail-distance").textContent = `${travelDistance.toFixed(2)} km (${travelDistance <= BASE_DISTANCE_KM ? "Within Base 4.0 km" : (travelDistance - BASE_DISTANCE_KM).toFixed(2) + " km beyond base"})`;
    document.getElementById("detail-passenger").textContent = passengerLabel;
  }

  originSelect.addEventListener("change", computeAndRender);
  destSelect.addEventListener("change", computeAndRender);
  passTypeSelect.addEventListener("change", computeAndRender);

  document.getElementById("fare-form").addEventListener("submit", function (e) {
    e.preventDefault();
    computeAndRender();
  });

  document.addEventListener("DOMContentLoaded", computeAndRender);
})();
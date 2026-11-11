"use strict";

// ----------------------------------
// 1. TRAIN DETAILS
// ----------------------------------

const trains = [

    {
        number: "12675",
        name: "Kovai Express",
        from: "Chennai",
        to: "Coimbatore",
        departure: "06:10",
        arrival: "13:50",
        duration: 460,
        distance: 495,
        seats: 42
    },

    {
        number: "12673",
        name: "Cheran Express",
        from: "Chennai",
        to: "Coimbatore",
        departure: "22:10",
        arrival: "06:00",
        duration: 470,
        distance: 495,
        seats: 18
    },

    {
        number: "12679",
        name: "Intercity Express",
        from: "Chennai",
        to: "Coimbatore",
        departure: "07:15",
        arrival: "14:25",
        duration: 430,
        distance: 495,
        seats: 31
    },

    {
        number: "12639",
        name: "Brindavan Express",
        from: "Chennai",
        to: "Bengaluru",
        departure: "07:50",
        arrival: "13:00",
        duration: 310,
        distance: 362,
        seats: 35
    },

    {
        number: "12635",
        name: "Vaigai Express",
        from: "Chennai",
        to: "Madurai",
        departure: "13:50",
        arrival: "21:15",
        duration: 445,
        distance: 497,
        seats: 28
    },

    {
        number: "12625",
        name: "Kerala Express",
        from: "Chennai",
        to: "Kochi",
        departure: "11:00",
        arrival: "21:30",
        duration: 630,
        distance: 690,
        seats: 24
    },

    {
        number: "12671",
        name: "Nilgiri Express",
        from: "Chennai",
        to: "Coimbatore",
        departure: "21:05",
        arrival: "05:45",
        duration: 520,
        distance: 495,
        seats: 9
    },

    {
        number: "12615",
        name: "Grand Trunk Express",
        from: "Chennai",
        to: "New Delhi",
        departure: "19:15",
        arrival: "20:10",
        duration: 1495,
        distance: 2180,
        seats: 15
    }

];


// ----------------------------------
// 2. GLOBAL VARIABLES
// ----------------------------------

let searchResults = [];
let selectedTrain = null;
let selectedFare = 0;
let selectedClass = "";
let currentTicket = null;
let alarmTimer = null;


// ----------------------------------
// 3. DISPLAY DATE
// ----------------------------------

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });


// ----------------------------------
// 4. SET MINIMUM JOURNEY DATE
// ----------------------------------

const dateField = document.getElementById("date");

const today = new Date();

const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

dateField.min = todayString;
dateField.value = todayString;


// ----------------------------------
// 5. PAGE NAVIGATION
// ----------------------------------

function openPage(pageName, button) {

    let pages = document.querySelectorAll(".page");

    pages.forEach(function(page) {
        page.classList.remove("active");
    });

    document.getElementById(pageName).classList.add("active");

    let buttons = document.querySelectorAll(".nav-item");

    buttons.forEach(function(item) {
        item.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    } else {
        buttons.forEach(function(item) {
            if (item.getAttribute("onclick").includes(pageName)) {
                item.classList.add("active");
            }
        });
    }

    if (pageName === "bookings") {
        displayBookings();
        renderDashboardCharts();
    }
    if (pageName === "travelTools") {
        populateRatingTrains();
        renderEcoBars();
        renderSwapBoard();
    }

    window.scrollTo(0, 0);
}


// ----------------------------------
// 6. SWAP STATIONS
// ----------------------------------

function swapStations() {

    let source = document.getElementById("from");
    let destination = document.getElementById("to");

    let temporary = source.value;

    source.value = destination.value;
    destination.value = temporary;

}


// ----------------------------------
// 7. CALCULATE FARE
// ----------------------------------

function getFare(distance, travelClass) {

    const rates = {
        SL: 0.55,
        "3A": 1.25,
        "2A": 1.75,
        "1A": 2.65,
        CC: 1.05
    };

    return Math.round(distance * rates[travelClass] + 40);

}


// ----------------------------------
// 8. FORMAT JOURNEY DURATION
// ----------------------------------

function getDuration(minutes) {

    let hours = Math.floor(minutes / 60);
    let remaining = minutes % 60;

    return hours + "h " + remaining + "m";

}


// ----------------------------------
// 9. SEARCH TRAINS
// ----------------------------------

document.getElementById("searchForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        let source = document.getElementById("from")
            .value.trim();

        let destination = document.getElementById("to")
            .value.trim();

        let journeyDate = dateField.value;

        selectedClass = document.getElementById("travelClass").value;

        if (source.toLowerCase() === destination.toLowerCase()) {

            alert("Source and destination cannot be the same.");

            return;
        }

        if (new Date(journeyDate + "T00:00:00") <
            new Date(todayString + "T00:00:00")) {

            alert("Please select a valid journey date.");

            return;
        }

        // FILTER METHOD

        searchResults = trains.filter(function(train) {

            return train.from.toLowerCase() === source.toLowerCase()
                && train.to.toLowerCase() === destination.toLowerCase();

        });

        document.getElementById("results").classList.remove("hidden");

        document.getElementById("searchInfo").textContent =
            "Journey: " + source + " to " + destination +
            " | Date: " + journeyDate +
            " | Class: " + selectedClass;

        displayTrains();

    }
);


// ----------------------------------
// 10. DISPLAY TRAIN TABLE
// ----------------------------------

function displayTrains() {

    let table = document.getElementById("trainTable");

    table.innerHTML = "";

    if (searchResults.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="8">
                    No sample trains found for this route.
                    Try another station combination.
                </td>
            </tr>
        `;

        return;
    }

    searchResults.forEach(function(train) {

        let fare = getFare(train.distance, selectedClass);

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${train.number}</td>
            <td>${train.name}<br><small>★ ${getAverageRating(train.number)}</small></td>
            <td>${train.departure}</td>
            <td>${train.arrival}</td>
            <td>${getDuration(train.duration)}</td>
            <td>${train.seats} seats</td>
            <td>₹${fare}</td>
            <td>
                <button class="table-book"
                    onclick="startBooking('${train.number}')">
                    Book
                </button>
            </td>
        `;

        table.appendChild(row);

    });

}


// ----------------------------------
// 11. OPEN PASSENGER FORM
// ----------------------------------

function startBooking(trainNumber) {

    selectedTrain = trains.find(function(train) {
        return train.number === trainNumber;
    });

    if (!selectedTrain) return;

    selectedFare = getFare(
        selectedTrain.distance,
        selectedClass
    );

    document.getElementById("selectedTrainInfo").innerHTML = `
        <strong>${selectedTrain.name}</strong><br>
        Train Number: ${selectedTrain.number}<br>
        Route: ${selectedTrain.from} to ${selectedTrain.to}<br>
        Departure: ${selectedTrain.departure}<br>
        Arrival: ${selectedTrain.arrival}<br>
        Class: ${selectedClass}<br>
        Fare: ₹${selectedFare}
    `;

    document.getElementById("bookingModal")
        .classList.remove("hidden");

}


// ----------------------------------
// 12. CLOSE BOOKING FORM
// ----------------------------------

function closeModal() {

    document.getElementById("bookingModal")
        .classList.add("hidden");

}


// ----------------------------------
// 13. CONFIRM BOOKING
// ----------------------------------

document.getElementById("passengerForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        if (!selectedTrain) return;

        let passengerName = document.getElementById("passengerName")
            .value.trim();

        let passengerAge = Number(
            document.getElementById("passengerAge").value
        );

        let gender = document.getElementById("gender").value;

        if (!/^[A-Za-z][A-Za-z .'-]*$/.test(passengerName)) {
            alert("Please enter a valid passenger name.");
            return;
        }

        if (!Number.isInteger(passengerAge) ||
            passengerAge < 1 || passengerAge > 120) {
            alert("Please enter a valid age.");
            return;
        }

        if (!gender) {
            alert("Please select gender.");
            return;
        }

        let booking = {

            pnr: String(Date.now()).slice(-10),

            trainNumber: selectedTrain.number,

            trainName: selectedTrain.name,

            source: selectedTrain.from,

            destination: selectedTrain.to,

            departure: selectedTrain.departure,

            arrival: selectedTrain.arrival,

            date: dateField.value,

            passenger: passengerName,

            age: passengerAge,

            gender: gender,
            berth: document.getElementById("bookingBerth").value === "Auto" ? ["Lower", "Middle", "Upper", "Side Lower"][Math.floor(Math.random() * 4)] : document.getElementById("bookingBerth").value,
            cancellationGuard: document.getElementById("cancellationGuard").checked,
            guardFee: document.getElementById("cancellationGuard").checked ? 1 : 0,

            travelClass: selectedClass,

            fare: selectedFare,

            status: "CONFIRMED"

        };

        let bookings = getSavedBookings();

        bookings.push(booking);

        localStorage.setItem(
            "railDeskBookings",
            JSON.stringify(bookings)
        );

        currentTicket = booking;
        closeModal();

        document.getElementById("passengerForm").reset();

        showTicket(booking);

    }
);


// ----------------------------------
// 14. GET SAVED BOOKINGS
// ----------------------------------

function getSavedBookings() {

    return JSON.parse(
        localStorage.getItem("railDeskBookings") || "[]"
    );

}


// ----------------------------------
// 15. SHOW TICKET
// ----------------------------------

function showTicket(booking) {

    currentTicket = booking;
    document.getElementById("ticketDetails").innerHTML = `

        <p><strong>PNR Number:</strong> ${booking.pnr}</p>

        <p><strong>Passenger:</strong> ${booking.passenger}</p>

        <p><strong>Age:</strong> ${booking.age}</p>

        <p><strong>Gender:</strong> ${booking.gender}</p>

        <p><strong>Train:</strong> ${booking.trainName}</p>

        <p><strong>Train Number:</strong> ${booking.trainNumber}</p>

        <p><strong>From:</strong> ${booking.source}</p>

        <p><strong>To:</strong> ${booking.destination}</p>

        <p><strong>Date:</strong> ${booking.date}</p>

        <p><strong>Departure:</strong> ${booking.departure}</p>

        <p><strong>Arrival:</strong> ${booking.arrival}</p>

        <p><strong>Class:</strong> ${booking.travelClass}</p>
        <p><strong>Berth:</strong> ${booking.berth || "Not assigned"}</p>
        <p><strong>Cancellation Guard:</strong> ${booking.cancellationGuard ? "Added (₹1)" : "Not added"}</p>

        <p><strong>Fare:</strong> ₹${booking.fare + (booking.guardFee || 0)}</p>

        <p><strong>Booking Status:</strong> ${booking.status}</p>

        <p><strong>Note:</strong> Demonstration ticket only.</p>

    `;

    document.getElementById("ticketModal")
        .classList.remove("hidden");

}


// ----------------------------------
// 16. CLOSE TICKET
// ----------------------------------

function closeTicket() {

    document.getElementById("ticketModal")
        .classList.add("hidden");

}


// ----------------------------------
// 17. DISPLAY MY BOOKINGS
// ----------------------------------

function displayBookings() {

    let container = document.getElementById("bookingContainer");

    let bookings = getSavedBookings();

    container.innerHTML = "";
    const countEl = document.getElementById("bookingCount");
    const spendEl = document.getElementById("bookingSpend");
    const nextEl = document.getElementById("nextJourney");
    if (countEl) countEl.textContent = bookings.length;
    if (spendEl) spendEl.textContent = "₹" + bookings.reduce((sum, b) => sum + Number(b.fare || 0) + Number(b.guardFee || 0), 0).toLocaleString("en-IN");
    if (nextEl) {
        const upcoming = bookings.filter(b => b.date && new Date(b.date + "T00:00:00") >= new Date(new Date().toDateString())).sort((a,b) => a.date.localeCompare(b.date))[0];
        nextEl.textContent = upcoming ? new Date(upcoming.date + "T00:00:00").toLocaleDateString("en-IN", {day:"2-digit", month:"short"}) : "Not scheduled";
    }

    if (bookings.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                No bookings found.<br>
                Search for a train to save your first journey.
            </div>
        `;

        return;
    }

    bookings.forEach(function(booking) {

        let card = document.createElement("div");

        card.className = "booking-card";

        card.innerHTML = `

            <h3>${booking.trainName} (${booking.trainNumber})</h3>

            <p>
                PNR: ${booking.pnr}<br>
                Passenger: ${booking.passenger}<br>
                Route: ${booking.source} to ${booking.destination}<br>
                Journey Date: ${booking.date}<br>
                Class: ${booking.travelClass}<br>
                Fare: ₹${booking.fare + (booking.guardFee || 0)}<br>
                Berth: ${booking.berth || "Not assigned"}<br>
                Cancellation Guard: ${booking.cancellationGuard ? "Yes" : "No"}<br>
                Status: ${booking.status}<br>
                Berth: ${booking.berth || "Not assigned"}
            </p>
            <button onclick="shareJourney('${booking.pnr}')">Share journey</button>

            <button onclick="viewSavedTicket('${booking.pnr}')">
                View Ticket
            </button>

            <button onclick="removeBooking('${booking.pnr}')">
                Cancel Saved Record
            </button>

        `;

        container.appendChild(card);

    });

}


// ----------------------------------
// 18. VIEW SAVED TICKET
// ----------------------------------

function viewSavedTicket(pnr) {

    let booking = getSavedBookings().find(function(item) {
        return item.pnr === pnr;
    });

    if (booking) {
        showTicket(booking);
    }

}


// ----------------------------------
// 19. REMOVE BOOKING
// ----------------------------------

function removeBooking(pnr) {

    let confirmDelete = confirm(
        "Do you want to remove this saved booking?"
    );

    if (!confirmDelete) return;

    let updatedBookings = getSavedBookings().filter(
        function(booking) {
            return booking.pnr !== pnr;
        }
    );

    localStorage.setItem(
        "railDeskBookings",
        JSON.stringify(updatedBookings)
    );

    displayBookings();

}


// ----------------------------------
// 20. PNR ENQUIRY
// ----------------------------------

function checkPNR() {

    let number = document.getElementById("pnrNumber")
        .value.trim();

    let result = document.getElementById("pnrDetails");

    if (!/^\d{10}$/.test(number)) {

        alert("Enter a valid 10 digit PNR number.");

        return;
    }

    // First check locally saved bookings

    let bookings = getSavedBookings();

    let booking = bookings.find(function(item) {
        return item.pnr === number;
    });

    if (booking) {

        result.innerHTML = `

            <div class="booking-card">

                <h3>Reservation Found</h3>

                <p>
                    Passenger: ${booking.passenger}<br>
                    Train: ${booking.trainName}<br>
                    Route: ${booking.source} to ${booking.destination}<br>
                    Date: ${booking.date}<br>
                    Class: ${booking.travelClass}<br>
                    Status: ${booking.status}
                </p>

            </div>

        `;

        return;
    }

    // Sample result for other numbers

    const statuses = [
        "CONFIRMED",
        "RAC",
        "WAITING LIST"
    ];

    let status = statuses[Number(number.charAt(9)) % 3];

    result.innerHTML = `

        <div class="booking-card">

            <h3>Sample PNR Result</h3>

            <p>
                PNR Number: ${number}<br>
                Reservation Status: ${status}<br>
                Information: Demonstration data only.
            </p>

        </div>

    `;

}

// ================================================================
// 21. SMART TRAVEL, SOCIAL, ON-JOURNEY AND TRUST FEATURES
// All records are local demonstration data stored in this browser.
// ================================================================

function readStore(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch (error) { return fallback; }
}
function writeStore(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

// Class advisor: simple if/else recommendation.
function recommendClass() {
    const budget = document.getElementById("advisorBudget").value;
    const comfort = document.getElementById("advisorComfort").value;
    const time = document.getElementById("advisorTime").value;
    let choice = "3A";
    let reason = "A balance between comfort and cost.";
    if (budget === "low" || (budget === "medium" && comfort === "basic")) {
        choice = "SL"; reason = "A budget-friendly option; suitable when basic comfort is enough.";
    } else if (budget === "high" || comfort === "high" || (time === "night" && comfort === "normal")) {
        choice = "2A"; reason = "More comfort and space, especially useful for overnight travel.";
    }
    document.getElementById("classAdvice").innerHTML = `<strong>Recommended class: ${choice}</strong><br>${reason}`;
}

function planLeaveHome() {
    const distance = Number(document.getElementById("homeDistance").value);
    const departure = document.getElementById("homeDeparture").value;
    const travel = Number(document.getElementById("homeTravel").value);
    const buffer = Number(document.getElementById("homeBuffer").value);
    if (!departure || distance < 0 || travel < 0 || buffer < 0 || !Number.isFinite(distance + travel + buffer)) {
        document.getElementById("leaveResult").textContent = "Enter valid distance, departure, travel time and buffer."; return;
    }
    const [hours, minutes] = departure.split(":").map(Number);
    const leave = new Date(); leave.setHours(hours, minutes, 0, 0);
    leave.setMinutes(leave.getMinutes() - travel - buffer);
    document.getElementById("leaveResult").innerHTML = `<strong>Leave home by ${leave.toLocaleTimeString("en-IN", {hour:"2-digit", minute:"2-digit"})}</strong><br>${distance} km journey + ${travel} min travel + ${buffer} min station buffer.`;
}

function calculateTripBudget() {
    const fare = Math.max(0, Number(document.getElementById("budgetFare").value) || 0);
    const food = Math.max(0, Number(document.getElementById("budgetFood").value) || 0);
    const local = Math.max(0, Number(document.getElementById("budgetLocal").value) || 0);
    const total = fare + food + local;
    document.getElementById("budgetResult").innerHTML = `<strong>Total estimated trip cost: ₹${total.toLocaleString("en-IN")}</strong><br>Fare ₹${fare} + food ₹${food} + local transport ₹${local}`;
    const max = Math.max(total, 1);
    document.getElementById("budgetBar").style.width = (total ? 100 : 0) + "%";
    document.getElementById("budgetBar").title = `₹${total}`;
}

function renderFriendNameFields() {
    const count = Number(document.getElementById("friendCount").value);
    const root = document.getElementById("friendNameFields");
    root.innerHTML = "";
    for (let i = 1; i <= count; i++) {
        const group = document.createElement("div");
        group.className = "form-group";
        const label = document.createElement("label");
        label.textContent = `Friend ${i} name`;
        const input = document.createElement("input");
        input.type = "text"; input.id = `friendName${i}`; input.placeholder = `Friend ${i}`;
        group.append(label, input); root.appendChild(group);
    }
}
function splitGroupFare() {
    const total = Math.max(0, Number(document.getElementById("groupFare").value) || 0);
    const friendCount = Number(document.getElementById("friendCount").value);
    const people = 1 + friendCount;
    const share = total / people;
    const names = ["You"];
    for (let i = 1; i <= friendCount; i++) {
        const name = document.getElementById(`friendName${i}`).value.trim();
        names.push(name || `Friend ${i}`);
    }
    document.getElementById("splitResult").innerHTML = `<strong>${people} passengers · Total group fare ₹${total.toLocaleString("en-IN")}</strong><br>` + names.map(name => `${escapeHtml(name)}: ₹${share.toLocaleString("en-IN", {maximumFractionDigits: 2})}`).join("<br>");
}

function showBuddyNeighbours() {
    const tag = document.getElementById("buddyTag").value;
    const seats = [
        {seat:"B1-21", tag:"Quiet"}, {seat:"B1-22", tag:"Student"},
        {seat:"B1-23", tag:"Family"}, {seat:"B1-24", tag:"Quiet"},
        {seat:"B1-25", tag:"Student"}
    ];
    document.getElementById("buddyResult").innerHTML = `<p>Green seats match your <strong>${tag}</strong> tag.</p>` + seats.map(s => `<span class="buddy-seat ${s.tag === tag ? "compatible" : ""}">${s.seat}<br>${s.tag}</span>`).join("");
}

const stationGuides = {
    "Chennai": {facilities:["Cloak room", "Waiting room", "Food court"], tip:"Check the electronic display for platform changes and allow extra time for a large station."},
    "Coimbatore": {facilities:["Cloak room", "Waiting room", "Food stalls"], tip:"Confirm the platform on the station display before boarding."},
    "Bengaluru": {facilities:["Waiting room", "Food court", "Prepaid transport"], tip:"Plan city transfers in advance during peak traffic."},
    "Madurai": {facilities:["Waiting room", "Food stalls", "Cloak room"], tip:"Keep your platform number handy and follow station announcements."},
    "Salem": {facilities:["Waiting room", "Food stalls"], tip:"Check coach position indicators before the train arrives."},
    "Mumbai": {facilities:["Waiting room", "Food court", "Cloak room"], tip:"Allow extra time to navigate busy platforms."},
    "New Delhi": {facilities:["Waiting room", "Food court", "Cloak room", "Prepaid transport"], tip:"Verify the station terminal and platform; Delhi has multiple major rail terminals."},
    "Hyderabad": {facilities:["Waiting room", "Food court", "Cloak room"], tip:"Check station announcements for platform updates."},
    "Kochi": {facilities:["Waiting room", "Food stalls", "Prepaid transport"], tip:"Arrange onward local transport before arrival."},
    "Tiruchirappalli": {facilities:["Waiting room", "Food stalls", "Cloak room"], tip:"Use the coach position display to locate your compartment."}
};
function showStationGuide() {
    const name = document.getElementById("guideStation").value;
    const guide = stationGuides[name];
    document.getElementById("stationGuideResult").innerHTML = `<strong>${name}</strong><br>Facilities: ${guide.facilities.join(", ")}<br>Platform tip: ${guide.tip}<br><small>Sample guide; verify facilities locally.</small>`;
}

function generatePackingList() {
    const destination = document.getElementById("packDestination").value.trim() || "your destination";
    const days = Math.max(1, Math.min(60, Number(document.getElementById("packDays").value) || 1));
    const travelClass = document.getElementById("packClass").value;
    const items = ["Ticket / PNR details", "Photo ID", `${days} day(s) of clothes`, "Toiletries", "Phone and charger", "Water bottle", "Medicines / essentials"];
    if (days >= 3) items.push("Extra pair of footwear", "Laundry bag");
    if (["SL", "3A", "2A", "1A"].includes(travelClass)) items.push("Light blanket or shawl", "Eye mask / earplugs");
    document.getElementById("packingResult").innerHTML = `<strong>Packing for ${destination} · ${days} day(s) · ${travelClass}</strong>` + items.map((item,i) => `<label><input type="checkbox">${item}</label>`).join("");
}

function startArrivalAlarm() {
    stopArrivalAlarm();
    const value = document.getElementById("alarmDateTime").value;
    const target = new Date(value).getTime();
    if (!value || !Number.isFinite(target) || target <= Date.now()) {
        document.getElementById("alarmResult").textContent = "Choose a future wake-up time."; return;
    }
    const tick = () => {
        const remaining = target - Date.now();
        if (remaining <= 0) {
            document.getElementById("alarmResult").textContent = "Wake up! Your arrival time is approaching.";
            alert("RailDesk arrival alarm: Wake up! Your arrival time is approaching.");
            alarmTimer = null; return;
        }
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        document.getElementById("alarmResult").textContent = `Alarm set · ${h}h ${m}m ${s}s remaining`;
        alarmTimer = setTimeout(tick, 1000);
    };
    tick();
}
function stopArrivalAlarm() {
    if (alarmTimer) clearTimeout(alarmTimer);
    alarmTimer = null;
    const result = document.getElementById("alarmResult");
    if (result) result.textContent = "Alarm stopped.";
}

function getRatings() { return readStore("railDeskRatings", {}); }
function getAverageRating(trainNumber) {
    const values = getRatings()[trainNumber] || [];
    if (!values.length) return "New";
    return (values.reduce((a,b) => a + b, 0) / values.length).toFixed(1) + "/5";
}
function populateRatingTrains() {
    const select = document.getElementById("ratingTrain");
    if (!select) return;
    select.innerHTML = trains.map(t => `<option value="${t.number}">${t.name} (${t.number})</option>`).join("");
}
function saveJourneyRating() {
    const number = document.getElementById("ratingTrain").value;
    const rating = Number(document.getElementById("journeyRating").value);
    const ratings = getRatings();
    ratings[number] = ratings[number] || [];
    ratings[number].push(rating);
    writeStore("railDeskRatings", ratings);
    document.getElementById("ratingResult").textContent = `Thank you! Average rating for ${number}: ${getAverageRating(number)}.`;
    if (document.getElementById("results") && !document.getElementById("results").classList.contains("hidden")) displayTrains();
}

function getSwapOffers() { return readStore("railDeskSwapOffers", []); }
function postSwapOffer() {
    const pnr = document.getElementById("swapPnr").value.trim();
    const details = document.getElementById("swapDetails").value.trim();
    if (!/^\d{10}$/.test(pnr) || !details) { alert("Enter a 10-digit PNR and offer details."); return; }
    const offers = getSwapOffers();
    offers.push({id: "SW" + Date.now().toString().slice(-6), pnr, details, status:"Open"});
    writeStore("railDeskSwapOffers", offers);
    document.getElementById("swapPnr").value = ""; document.getElementById("swapDetails").value = "";
    renderSwapBoard();
}
function acceptSwapOffer(id) {
    const offers = getSwapOffers().map(o => o.id === id ? {...o, status:"Accepted"} : o);
    writeStore("railDeskSwapOffers", offers); renderSwapBoard();
}
function renderSwapBoard() {
    const board = document.getElementById("swapBoard"); if (!board) return;
    const offers = getSwapOffers();
    board.innerHTML = offers.length ? offers.map(o => `<div class="swap-offer"><strong>${o.id}</strong> · PNR ${o.pnr}<br>${escapeHtml(o.details)}<br>Status: ${o.status}${o.status === "Open" ? ` <button class="secondary-btn" onclick="acceptSwapOffer('${o.id}')">Accept offer</button>` : ""}</div>`).join("") : "No swap offers yet.";
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

function shareJourney(pnr) {
    const booking = getSavedBookings().find(b => b.pnr === pnr);
    if (!booking) return;
    const text = `RailDesk journey\nTrain: ${booking.trainName} (${booking.trainNumber})\nPNR: ${booking.pnr}\nBerth: ${booking.berth || "Not assigned"}\nRoute: ${booking.source} to ${booking.destination}\nArrival: ${booking.arrival} on ${booking.date}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => alert("Journey details copied. You can share them with family."))
            .catch(() => window.prompt("Copy your journey details:", text));
    } else window.prompt("Copy your journey details:", text);
}
function shareCurrentJourney() { if (currentTicket) shareJourney(currentTicket.pnr); }

function submitComplaint() {
    const pnr = document.getElementById("complaintPnr").value.trim();
    const complaint = document.getElementById("complaintText").value.trim();
    if (!/^\d{10}$/.test(pnr) || complaint.length < 5) { alert("Enter a valid 10-digit PNR and a complaint of at least 5 characters."); return; }
    const complaints = readStore("railDeskComplaints", []);
    const id = "CMP" + Date.now().toString().slice(-7);
    complaints.push({id, pnr, complaint, status:"Submitted"});
    writeStore("railDeskComplaints", complaints);
    document.getElementById("complaintResult").innerHTML = `<strong>Complaint submitted.</strong><br>Complaint ID: ${id}<br>Status: Submitted (demo)`;
    document.getElementById("complaintText").value = "";
}

function renderEcoBars() {
    const root = document.getElementById("ecoBars"); if (!root) return;
    const emissions = [{name:"Train", value:14},{name:"Bus",value:27},{name:"Car",value: passengerCarEmission()},{name:"Flight",value:150}];
    const max = Math.max(...emissions.map(e => e.value));
    root.innerHTML = emissions.map(e => `<div class="eco-row ${e.name.toLowerCase()}"><strong>${e.name}</strong><div class="eco-track"><div class="eco-fill" data-width="${e.value / max * 100}%"></div></div><span>${e.value} kg</span></div>`).join("");
    requestAnimationFrame(() => root.querySelectorAll(".eco-fill").forEach(el => el.style.width = el.dataset.width));
}
function passengerCarEmission() { return 90; }

function renderDashboardCharts() {
    const bookings = getSavedBookings();
    const spend = document.getElementById("spendingChart");
    const eco = document.getElementById("bookingEcoChart");
    if (!spend || !eco) return;
    if (!bookings.length) {
        spend.innerHTML = "<p class='small-note'>Book a sample journey to see spending data.</p>";
        eco.innerHTML = "<p class='small-note'>Book a sample journey to see your estimated train emissions.</p>";
        return;
    }
    const rows = bookings.map((b,i) => ({label: b.trainName, value: b.fare + (b.guardFee || 0)}));
    const maxSpend = Math.max(...rows.map(r => r.value), 1);
    spend.innerHTML = rows.map(r => `<div class="chart-bar-row"><span>${escapeHtml(r.label)}</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width:${r.value/maxSpend*100}%"></div></div><strong>₹${r.value}</strong></div>`).join("") + `<p><strong>Total: ₹${rows.reduce((s,r)=>s+r.value,0)}</strong></p>`;
    const trainEmissions = bookings.length * 14;
    const alternatives = [{label:"Train",value:trainEmissions},{label:"Bus",value:bookings.length*27},{label:"Car",value:bookings.length*90},{label:"Flight",value:bookings.length*150}];
    const maxEco = Math.max(...alternatives.map(r=>r.value),1);
    eco.innerHTML = alternatives.map(r => `<div class="chart-bar-row"><span>${r.label}</span><div class="chart-bar-track"><div class="chart-bar-fill" style="width:${r.value/maxEco*100}%"></div></div><strong>${r.value} kg</strong></div>`).join("");
}

// Peak-season date warnings: illustrative dates for the selected year.
function checkPeakSeason() {
    const field = document.getElementById("date");
    const warning = document.getElementById("peakSeasonWarning");
    if (!field || !warning || !field.value) return;
    const date = new Date(field.value + "T00:00:00");
    const month = date.getMonth(), day = date.getDate();
    const isDiwaliWindow = month === 9 || (month === 10 && day <= 5); // Oct / early Nov window
    const isPongalWindow = month === 0 && day >= 12 && day <= 17;
    if (isDiwaliWindow || isPongalWindow) {
        warning.textContent = `High demand: ${isPongalWindow ? "Pongal" : "Diwali"} travel period. Book early; this is a sample seasonal warning.`;
        warning.classList.add("high-demand");
    } else {
        warning.textContent = "No major festival-demand window flagged for this date in the demo calendar.";
        warning.classList.remove("high-demand");
    }
}
dateField.addEventListener("change", checkPeakSeason);
checkPeakSeason();

// English/Tamil labels are held in a simple object. The switch updates key navigation labels.
const languageLabels = {
    en: {home:"Home", searchTab:"Train Search", destinations:"Destinations", guide:"Journey Guide", bookings:"My Bookings", pnr:"PNR Enquiry", tools:"Unique Features", help:"Help", search:"Search Trains"},
    ta: {home:"முகப்பு", searchTab:"ரயில் தேடல்", destinations:"இடங்கள்", guide:"பயண வழிகாட்டி", bookings:"எனது முன்பதிவுகள்", pnr:"PNR விசாரணை", tools:"சிறப்பு அம்சங்கள்", help:"உதவி", search:"ரயில்களைத் தேடு"}
};
function applyLanguage(language) {
    const labels = languageLabels[language] || languageLabels.en;
    const nav = document.querySelectorAll(".nav-item");
    const values = [labels.home, labels.searchTab, labels.destinations, labels.guide, labels.bookings, labels.pnr, labels.tools, labels.help];
    nav.forEach((item, index) => { if (values[index]) item.textContent = values[index]; });
    const searchButton = document.querySelector('#searchForm button[type="submit"]');
    if (searchButton) searchButton.textContent = labels.search;
}
const languageSelect = document.getElementById("languageSelect");
if (languageSelect) languageSelect.addEventListener("change", () => applyLanguage(languageSelect.value));

// Keep the date strip and rating selector ready on first load.
populateRatingTrains();
renderEcoBars();
document.getElementById("friendCount").addEventListener("change", renderFriendNameFields);
renderFriendNameFields();

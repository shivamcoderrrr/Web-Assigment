const movieDatabase = {
    'matrix': {
        name: 'The Matrix Resurgence',
        price: 10,
        poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
        trailer: 'trailer.mp4'
    },
    'stellar': {
        name: 'Stellar Journey',
        price: 12,
        poster: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=400&q=80',
        trailer: 'trailer.mp4'
    },
    'mind': {
        name: 'Mind Heist',
        price: 15,
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
        trailer: 'trailer.mp4'
    }
};

const categoryPricing = {
    'standard': 0,
    'premium': 5,
    'vip': 10
};

let currentDiscount = 0;

window.onload = function() {
    const welcomeMsg = document.getElementById('welcome-message');
    welcomeMsg.textContent = "Welcome, cinephile! Select your perfect screening.";

    const title = document.getElementById('main-title');
    setTimeout(() => {
        title.classList.add('title-glow');
    }, 1000);

    startBannerRotation();
    restoreBookingData();
    calculateAndRenderSummary();
};

const movieSelect = document.getElementById('movie-select');
const seatCategory = document.getElementById('seat-category');
const seatCountInput = document.getElementById('seat-count');
const surpriseBtn = document.getElementById('surprise-btn');
const summaryCard = document.getElementById('summary-card');

const radioLabels = document.getElementsByClassName('radio-label');

movieSelect.addEventListener('change', updateMediaAndSummary);
seatCategory.addEventListener('change', calculateAndRenderSummary);
seatCountInput.addEventListener('input', calculateAndRenderSummary);

const timingRadios = document.getElementsByName('timing');

timingRadios.forEach(radio => {
    radio.addEventListener('change', calculateAndRenderSummary);
});

for (let i = 0; i < radioLabels.length; i++) {
    radioLabels[i].addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.02)';
    });

    radioLabels[i].addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
    });
}

function updateMediaAndSummary() {
    const selectedMovie = movieSelect.value;

    if (selectedMovie && movieDatabase[selectedMovie]) {
        document.getElementById('movie-poster').src = movieDatabase[selectedMovie].poster;

        const trailerVideo = document.getElementById('movie-trailer');
        trailerVideo.src = movieDatabase[selectedMovie].trailer;
        trailerVideo.load();

        document.getElementById('summary-movie').textContent = movieDatabase[selectedMovie].name;
    } else {
        document.getElementById('summary-movie').textContent = "Not Selected";
    }

    calculateAndRenderSummary();
}

function calculateAndRenderSummary() {
    const selectedMovie = movieSelect.value;
    const category = seatCategory.value;

    let selectedTiming = "Not Selected";
    const timings = document.getElementsByName('timing');

    for (let i = 0; i < timings.length; i++) {
        if (timings[i].checked) {
            selectedTiming = timings[i].value;
            break;
        }
    }

    const seats = parseInt(seatCountInput.value) || 0;

    document.getElementById('summary-timing').textContent = selectedTiming;

    const categoryDisplay = seatCategory.options[seatCategory.selectedIndex].text.split('(')[0].trim();
    document.getElementById('summary-category').textContent = categoryDisplay;
    document.getElementById('summary-seats').textContent = seats;

    let baseCost = 0;

    if (selectedMovie && movieDatabase[selectedMovie]) {
        baseCost = movieDatabase[selectedMovie].price;
    }

    let surcharge = categoryPricing[category] || 0;

    let subtotal = (baseCost + surcharge) * seats;
    let finalTotal = subtotal;

    if (currentDiscount > 0 && subtotal > 0) {
        const discountVal = subtotal * (currentDiscount / 100);
        finalTotal = subtotal - discountVal;

        document.getElementById('discount-row').classList.remove('hidden');
        document.getElementById('discount-amount').textContent = `-$${discountVal.toFixed(2)} (${currentDiscount}%)`;
    } else {
        document.getElementById('discount-row').classList.add('hidden');
    }

    const costDisplay = `$${finalTotal.toFixed(2)}`;
    document.getElementById('summary-cost').textContent = costDisplay;

    if (seats > 0 && selectedMovie) {
        summaryCard.classList.add('glow-active');

        setTimeout(() => summaryCard.classList.remove('glow-active'), 500);

        saveBookingData(selectedMovie, selectedTiming, category, seats, costDisplay);
    }
}

surpriseBtn.onclick = function() {
    if (!movieSelect.value || !seatCountInput.value) {
        alert("Please select a movie and seats first!");
        return;
    }

    const randomMultiplier = Math.floor(Math.random() * 5) + 1;
    currentDiscount = randomMultiplier * 5;

    alert(`🎉 Awesome! You unlocked a ${currentDiscount}% surprise discount!`);

    surpriseBtn.disabled = true;
    surpriseBtn.innerHTML = "Offer Applied ✓";
    surpriseBtn.style.background = "var(--success)";

    calculateAndRenderSummary();
};

function startBannerRotation() {
    const bannerTexts = [
        "🍿 Limited Seats Available! Book Now! 🍿",
        "🎉 Students get extra popcorn on Night Shows! 🎉",
        "✨ Don't miss out on VIP Balcony comfort! ✨"
    ];

    let index = 0;

    const bannerContainer = document.getElementById('rotating-banner').querySelector('span');

    setInterval(() => {
        index = (index + 1) % bannerTexts.length;

        bannerContainer.classList.remove('flash-text');

        void bannerContainer.offsetWidth;

        bannerContainer.textContent = bannerTexts[index];
        bannerContainer.classList.add('flash-text');
    }, 4000);
}

function saveBookingData(movie, timing, category, seats, totalCost) {
    const bookingDetails = {
        movie: movie,
        timing: timing,
        category: category,
        seats: seats,
        totalCost: totalCost,
        timestamp: new Date().getTime()
    };

    localStorage.setItem('campusMovieBooking', JSON.stringify(bookingDetails));
}

function restoreBookingData() {
    const savedDataStr = localStorage.getItem('campusMovieBooking');

    if (savedDataStr) {
        try {
            const savedData = JSON.parse(savedDataStr);

            if (savedData.movie) {
                movieSelect.value = savedData.movie;
                updateMediaAndSummary();
            }

            if (savedData.category) {
                seatCategory.value = savedData.category;
            }

            if (savedData.seats) {
                seatCountInput.value = savedData.seats;
            }

            if (savedData.timing) {
                const timings = document.getElementsByName('timing');

                for (let i = 0; i < timings.length; i++) {
                    if (timings[i].value === savedData.timing) {
                        timings[i].checked = true;
                        break;
                    }
                }
            }

            console.log("Restored previous session data.");
        } catch (e) {
            console.error("Failed to parse saved booking data.");
        }
    }
}
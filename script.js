const movieDatabase = {
    'matrix': {
        name: 'Dhurandhar',
        price: 10,
        poster: 'https://i.ytimg.com/vi/7IBDa53IsvI/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCWgveOPjD0hJAX-UxHGCYkSqq4pw',
        trailer: 'vidssave.com Aari Aari (Lyrical) _ Dhurandhar The Revenge _ Ranveer Singh _ Shashwat,Bombay Rockers _ Aditya Dhar 480P.mp4'
    },
    'stellar': {
        name: 'Bhoot Bangla',
        price: 12,
        poster: 'https://images.financialexpressdigital.com/2026/04/bhooth-bangla-box-office.jpg?w=1200',
        trailer: 'trailer.mp4'
    },
    'mind': {
        name: 'Jolly LLB 3',
        price: 15,
        poster: 'https://assets-in.bmscdn.com/discovery-catalog/events/et00450799-nsqhuynlsr-landscape.jpg',
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

    const trailerVideo = document.getElementById('movie-trailer');
    trailerVideo.muted = true;
    trailerVideo.play().catch(() => {
        // Autoplay can still be blocked on a few browsers/settings.
    });
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
        trailerVideo.muted = true;
        trailerVideo.play().catch(() => {
            // Keep UI responsive even if autoplay is blocked.
        });

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
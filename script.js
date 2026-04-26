// Movie Database for Dynamic Media and Pricing
const movieDatabase = {
    'matrix': {
        name: 'The Matrix Resurgence',
        price: 10,
        poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
        trailer: 'https://www.w3schools.com/html/mov_bbb.mp4' // Using generic trailer as placeholder
    },
    'stellar': {
        name: 'Stellar Journey',
        price: 12,
        poster: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=400&q=80',
        trailer: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    'mind': {
        name: 'Mind Heist',
        price: 15,
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
        trailer: 'https://www.w3schools.com/html/mov_bbb.mp4'
    }
};

const categoryPricing = {
    'standard': 0,
    'premium': 5,
    'vip': 10
};

// Global State
let currentDiscount = 0;

// [b] Page Load Event and Initialization
window.onload = function() {
    // Show welcome message
    const welcomeMsg = document.getElementById('welcome-message');
    welcomeMsg.textContent = "Welcome, cinephile! Select your perfect screening.";
    
    // Animate heading
    const title = document.getElementById('main-title');
    setTimeout(() => {
        title.classList.add('title-glow');
    }, 1000);

    // [g] Time-based feature: rotating banner
    startBannerRotation();

    // [j] Load LocalStorage
    restoreBookingData();

    // Re-calculate to sync UI
    calculateAndRenderSummary();
};

// [f] DOM Methods Implementation
// Using getElementById
const movieSelect = document.getElementById('movie-select');
const seatCategory = document.getElementById('seat-category');
const seatCountInput = document.getElementById('seat-count');
const surpriseBtn = document.getElementById('surprise-btn');
const summaryCard = document.getElementById('summary-card');

// Using getElementsByClassName (reads all radio labels to add hover effects)
const radioLabels = document.getElementsByClassName('radio-label');

// Event Listeners (Change)
movieSelect.addEventListener('change', updateMediaAndSummary);
seatCategory.addEventListener('change', calculateAndRenderSummary);
seatCountInput.addEventListener('input', calculateAndRenderSummary);

// Event Listeners (Radio buttons - byName)
const timingRadios = document.getElementsByName('timing'); // using getElementsByName specifically req `f`
timingRadios.forEach(radio => {
    radio.addEventListener('change', calculateAndRenderSummary);
});

// Event Listeners (Hover / mouseover) using getElementsByClassName collections
for (let i = 0; i < radioLabels.length; i++) {
    radioLabels[i].addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.02)';
    });
    radioLabels[i].addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
    });
}

// [e, i] Dynamically update Summary Panel & Media
function updateMediaAndSummary() {
    const selectedMovie = movieSelect.value;
    
    if (selectedMovie && movieDatabase[selectedMovie]) {
        // [i] Update Image and Video
        document.getElementById('movie-poster').src = movieDatabase[selectedMovie].poster;
        const videoElement = document.getElementById('movie-trailer');
        
        // Reset and play video if changed
        videoElement.src = movieDatabase[selectedMovie].trailer;
        videoElement.load();
        
        // Update summary text
        document.getElementById('summary-movie').textContent = movieDatabase[selectedMovie].name;
    } else {
        document.getElementById('summary-movie').textContent = "Not Selected";
    }

    calculateAndRenderSummary();
}

function calculateAndRenderSummary() {
    // Read input values
    const selectedMovie = movieSelect.value;
    const category = seatCategory.value;
    
    // Read Timing
    let selectedTiming = "Not Selected";
    const timings = document.getElementsByName('timing');
    for (let i = 0; i < timings.length; i++) {
        if (timings[i].checked) {
            selectedTiming = timings[i].value;
            break;
        }
    }

    // Read Seats with fallback to 0
    const seats = parseInt(seatCountInput.value) || 0;

    // Update Text Fields
    document.getElementById('summary-timing').textContent = selectedTiming;
    
    const categoryDisplay = seatCategory.options[seatCategory.selectedIndex].text.split('(')[0].trim();
    document.getElementById('summary-category').textContent = categoryDisplay;
    document.getElementById('summary-seats').textContent = seats;

    // Calculate cost
    let baseCost = 0;
    if (selectedMovie && movieDatabase[selectedMovie]) {
        baseCost = movieDatabase[selectedMovie].price;
    }
    
    let surcharge = categoryPricing[category] || 0;
    
    let subtotal = (baseCost + surcharge) * seats;
    let finalTotal = subtotal;

    // Apply Discount
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

    // Pulse effect on sumary change
    if(seats > 0 && selectedMovie) {
        summaryCard.classList.add('glow-active');
        setTimeout(() => summaryCard.classList.remove('glow-active'), 500);
        
        // [j] Save to LocalStorage real-time
        saveBookingData(selectedMovie, selectedTiming, category, seats, costDisplay);
    }
}

// [h] Math.random() Feature
surpriseBtn.onclick = function() {
    if(!movieSelect.value || !seatCountInput.value) {
        alert("Please select a movie and seats first!");
        return;
    }
    
    // Generate random discount between 5% and 25% (multiples of 5)
    // Math.floor(Math.random() * 5) yields 0-4. Add 1 -> 1-5. Multiply by 5 -> 5-25%
    const randomMultiplier = Math.floor(Math.random() * 5) + 1; 
    currentDiscount = randomMultiplier * 5; 
    
    alert(`🎉 Awesome! You unlocked a ${currentDiscount}% surprise discount!`);
    
    // Lock button after usage
    surpriseBtn.disabled = true;
    surpriseBtn.innerHTML = "Offer Applied ✓";
    surpriseBtn.style.background = "var(--success)";
    
    calculateAndRenderSummary();
};

// [g] setInternal rotation logic
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
        
        // Trigger reflow to restart animation
        void bannerContainer.offsetWidth; 
        
        bannerContainer.textContent = bannerTexts[index];
        bannerContainer.classList.add('flash-text');
    }, 4000); // 4 seconds interval
}

// [j] LocalStorage Implementation
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
            
            // Restore form values
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

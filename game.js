// Game state variables
let timeLeft = 100;
let questionTimer;
let totalScore = 0;
let userName = window.name;
let currentQuestion = 0;
let currentCity = '';
let questionStartTime;
const maxTimePerQuestion = 15;
const maxScorePerQuestion = 1000;
let lives = 3;
let mainTimer;

// Questions array
const questions = [
    { image: '1.jpeg', clue: 'Topkapı Sarayı, Osmanlı İmparatorları\'nın yaşadığı yer hangi ilimizdedir?', answer: 'İstanbul' },
    { image: '2.jpeg', clue: 'Türkiye Cumhuriyeti\'nin kurucusu Mustafa Kemal Atatürk\'ün mezarı Anıtkabir hangi ilimizdedir?', answer: 'Ankara' },
    { image: '3.jpeg', clue: 'Artemis Tapınağı\'na ev sahipliği yapan Efes Antik Kenti hangi ilimizdedir?', answer: 'İzmir' },
    { image: '4.jpeg', clue: 'Beyaz traverten teraslarıyla ünlü bu doğa harikası, sıcak su kaynaklarıyla tanınan hangi şehirde yer alıyor?', answer: 'Denizli' },
    { image: '5.jpeg', clue: 'Dünyanın en eski tapınak kompleksi olarak bilinen Göbeklitepe hangi şehirde bulunuyor?', answer: 'Şanlıurfa' },
    { image: '6.jpeg', clue: 'Peri Bacaları ve yeraltı şehirleriyle ünlü Kapadokya balon turlarıyla bilinen bölge hangi şehirde yer alır?', answer: 'Nevşehir' },
    { image: '7.jpeg', clue: 'Sazova bilim kültür ve sanat parkı hangi ilimizdedir?', answer: 'Eskişehir' },
    { image: '8.jpeg', clue: 'Aspendos Tiyatrosu hangi tarihi kente aittir?', answer: 'Antalya' },
    { image: '9.jpeg', clue: 'UNESCO Dünya Mirası Listesi\'nde yer alan ve Osmanlı dönemine ait geleneksel evleriyle ünlü Safranbolu hangi ilimizdedir?', answer: 'Karabük' },
    { image: '10.jpeg', clue: 'Kayaların içinde inşa edilmiş olan Sumela manastır, Karadeniz bölgesinde hangi şehirde yer alır?', answer: 'Trabzon' }
];

// Basic timer function
function countdown() {
    if (timeLeft >= 0) {
        document.getElementById('timer').innerText = timeLeft;
        timeLeft--;
        mainTimer = setTimeout(countdown, 1000);
    } else {
        clearTimeout(mainTimer);
        showMainTimeUpNotification();
    }
}

// Game initialization
function startGame() {
    totalScore = 0;
    currentQuestion = 0;
    lives = 3;
    timeLeft = 100;
    updateLivesDisplay();
    loadQuestion();
    countdown();
}

// Add this new function to update lives display
function updateLivesDisplay() {
    const livesElement = document.getElementById('lives-display');
    livesElement.textContent = '❤️'.repeat(lives);
}

// Question loading
function loadQuestion() {
    if (currentQuestion >= questions.length) {
        endGame();
        return;
    }
    
    const question = questions[currentQuestion];
    currentCity = question.answer;
    
    document.getElementById('clue-image').src = question.image;
    document.getElementById('clue-text').innerText = `İpucu: ${question.clue}`;
    document.querySelector('.popup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
    
    questionStartTime = Date.now();
    startQuestionTimer(maxTimePerQuestion);
}

// Timer functions
function startQuestionTimer(seconds) {
    let timeLeft = seconds;
    document.getElementById('question-timer').innerText = timeLeft;
    
    clearInterval(questionTimer);
    questionTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('question-timer').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(questionTimer);
            showTimeUpNotification();
        }
    }, 1000);
}

// Map setup
var map = L.map('map', {
    center: [39.0, 35.0],
    zoom: 7,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    touchZoom: false,
    attributionControl: false,
    maxBounds: [[36, 25], [42, 45]],
    maxBoundsViscosity: 1.0
});

// Map interactions
$.getJSON('https://raw.githubusercontent.com/cihadturhan/tr-geojson/master/geo/tr-cities-utf8.json', function(data) {
    function style(feature) {
        return {
            color: "#000",
            weight: 1,
            fillColor: "#F5F7D1",
            fillOpacity: 0.8
        };
    }

    function checkAnswer(clickedCity) {
        clearInterval(questionTimer);
        
        if (clickedCity === currentCity) {
            const timeElapsed = (Date.now() - questionStartTime) / 1000;
            const pointsEarned = calculateTimeBasedScore(timeElapsed);
            totalScore += pointsEarned;
            
            // Update both score displays
            const scoreElements = document.querySelectorAll('#score');
            scoreElements.forEach(element => {
                element.textContent = totalScore;
            });
            
            currentQuestion++;
            
            // Check if this was the last question
            if (currentQuestion >= questions.length) {
                showFinalScore();
            } else {
                showNotification(`Doğru! ${pointsEarned} puan kazandınız.`, true);
            }
        } else {
            lives--;
            updateLivesDisplay();
            
            if (lives <= 0) {
                showGameOver();
            } else {
                showNotification(`Yanlış cevap! ${lives} hakkınız kaldı. Tekrar deneyiniz.`, false, true);
            }
        }
    }

    var geojsonLayer = L.geoJson(data, {
        style: style,
        onEachFeature: function (feature, layer) {
            var cityName = feature.properties.name;
            
            layer.on({
                mouseover: function(e) {
                    e.target.setStyle({ fillColor: "#ff0000", fillOpacity: 0.8 });
                },
                mouseout: function(e) {
                    geojsonLayer.resetStyle(e.target);
                },
                click: function(e) {
                    checkAnswer(cityName);
                }
            });

            // Add city labels
            var centroid = turf.centroid(feature).geometry.coordinates;
            var label = L.divIcon({
                className: 'city-label',
                html: cityName,
                iconSize: null
            });
            L.marker([centroid[1], centroid[0]], { icon: label, interactive: false }).addTo(map);
        }
    }).addTo(map);
});

// Utility functions
function calculateTimeBasedScore(timeElapsed) {
    if (timeElapsed >= maxTimePerQuestion) return 0;
    const score = Math.floor(maxScorePerQuestion * (1 - (timeElapsed / maxTimePerQuestion)));
    return Math.max(0, score);
}

function showNotification(message, isSuccess, showRetry = false) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const nextButton = notification.querySelector('.next-button');
    const retryButton = notification.querySelector('.retry-button');
    
    notificationText.innerHTML = message;
    notification.className = 'notification' + (isSuccess ? ' success' : '');
    
    // Only show buttons if not game over or final score
    if (!message.includes('Oyun Bitti') && !message.includes('Tebrikler')) {
        if (isSuccess) {
            nextButton.style.display = 'block';
            retryButton.style.display = 'none';
        } else {
            nextButton.style.display = 'none';
            retryButton.style.display = lives > 0 ? 'block' : 'none';
        }
    } else {
        nextButton.style.display = 'none';
        retryButton.style.display = 'none';
    }
    
    notification.style.display = 'block';
}

function nextQuestion() {
    document.getElementById('notification').style.display = 'none';
    
    if (currentQuestion >= questions.length) {
        endGame();
    } else {
        loadQuestion();
    }
}

function retryQuestion() {
    document.getElementById('notification').style.display = 'none';
    // Reset timer and start again
    questionStartTime = Date.now();
    startQuestionTimer(maxTimePerQuestion);
}

async function endGame() {
    const finalScore = `
        <div class="final-score">
            <h2>Oyun Bitti!</h2>
            <p>Toplam Puan: ${totalScore}</p>
            <p>Doğru Sayısı: ${currentQuestion}/10</p>
            <button onclick="window.location.href='index.html'">Ana Menüye Dön</button>
        </div>
    `;
    showNotification(finalScore, true);

    const name = userName;
    if (!name) {
        alert("İsim bulunamadı!");
        return;
    }

    try {
        // Puanı ve ismi API'ye gönder
        const response = await fetch("http://localhost:5000/addUserPoint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, score: totalScore })
        });

        const data = await response.json();
        if (data.error) {
            alert("Hata: " + data.error);
        } else {
            console.log("Puan başarıyla kaydedildi:", data);
        }
    } catch (error) {
        console.error("İstek hatası:", error);
        alert("Sunucuya bağlanılamadı!");
    }
}


// Add this new function for game over
async function showGameOver() {
    const gameOverMessage = `
        <div class="final-score">
            <h2>Oyun Bitti!</h2>
            <p>Haklarınız tükendi!</p>
            <p>Toplam Puan: ${totalScore}</p>
            <p>Doğru Sayısı: ${currentQuestion}/10</p>
            <button onclick="window.location.href='index.html'">Ana Menüye Dön</button>
        </div>
    `;
    showNotification(gameOverMessage, false);
    const name = userName;
    console.log(name);
    if (!name) {
        alert("İsim bulunamadı!");
        return;
    }
var body = JSON.stringify({ name: name, score: totalScore })
console.log(body)
    try {
        // Puanı ve ismi API'ye gönder
        const response = await fetch("http://localhost:5051/addUserPoint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            crossDomain: true,
            body: body
        });
    } catch (error) {
        console.error("İstek hatası:", error);
    }
}

// Add this new function for final score
async function showFinalScore() {
    const finalScore = `
        <div class="final-score">
            <h2>Tebrikler! Tüm Soruları Tamamladınız!</h2>
            <p>Toplam Puan: ${totalScore}</p>
            <p>Doğru Sayısı: ${currentQuestion}/10</p>
            <p>Kalan Canlar: ${lives}</p>
            <button onclick="window.location.href='index.html'">Ana Menüye Dön</button>
        </div>
    `;
    showNotification(finalScore, true);
    const name = userName;
    console.log(name);
    if (!name) {
        alert("İsim bulunamadı!");
        return;
    }
var body = JSON.stringify({ name: name, score: totalScore })
console.log(body)
    try {
        // Puanı ve ismi API'ye gönder
        const response = await fetch("http://localhost:5051/addUserPoint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            crossDomain: true,
            body: body
        });
    } catch (error) {
        console.error("İstek hatası:", error);
    }
}

// Add this new function for main time up notification
function showMainTimeUpNotification() {
    clearInterval(questionTimer);
    const gameOverMessage = `
        <div class="final-score">
            <h2>Süre Doldu - Oyun Bitti!</h2>
            <p>100 saniyelik süreniz doldu!</p>
            <p>Toplam Puan: ${totalScore}</p>
            <p>Doğru Sayısı: ${currentQuestion}/10</p>
            <button onclick="window.location.href='index.html'">Ana Menüye Dön</button>
        </div>
    `;
    document.querySelector('.popup').style.display = 'none';
    document.getElementById('time-up-notification').style.display = 'none';
    showNotification(gameOverMessage, false);
}

// Add this new function for time up notification
function showTimeUpNotification() {
    clearInterval(questionTimer);
    const timeUpNotification = document.getElementById('time-up-notification');
    timeUpNotification.style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
    document.querySelector('.popup').style.display = 'none';
    
    lives--;
    updateLivesDisplay();
    
    if (lives <= 0) {
        showGameOver();
        return;
    }
}

// Add this new function for retrying time up question
function retryTimeUpQuestion() {
    document.getElementById('time-up-notification').style.display = 'none';
    document.querySelector('.overlay').style.display = 'block';
    document.querySelector('.popup').style.display = 'block';
    questionStartTime = Date.now();
    startQuestionTimer(maxTimePerQuestion);
}

// Add this new function for closing time up notification
function closeTimeUpNotification() {
    document.getElementById('time-up-notification').style.display = 'none';
    document.querySelector('.overlay').style.display = 'none';
    currentQuestion++;
    
    if (currentQuestion >= questions.length) {
        showFinalScore();
    } else {
        loadQuestion();
    }
}

// Event listeners
document.getElementById('show-map-button').addEventListener('click', function() {
    document.querySelector('.popup').style.display = 'none';
    document.querySelector('.overlay').style.display = 'none';
    questionStartTime = Date.now();
});

// Initialize game when page loads
window.onload = startGame;
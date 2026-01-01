const stories = [
    {
        title: "Le Chat Noir",
        img: "images/chat.png",
        category: "A1",
        french: "Le chat noir dort sur la chaise. Il est petit et mignon. Le chat aime le lait. Chaque jour, il joue dans le jardin.",
        english: "The black cat sleeps on the chair. It is small and cute. The cat likes milk. Every day, it plays in the garden.",
        words: {
            "Le": "The","chat": "cat","noir": "black","dort": "sleeps",
            "sur": "on","la": "the","chaise": "chair","Il": "It/He",
            "est": "is","petit": "small","et": "and","mignon": "cute",
            "aime": "likes/loves","le": "the","lait": "milk","Chaque": "Each/Every",
            "jour": "day","il": "it/he","joue": "plays","dans": "in",
            "jardin": "garden"
        }
    },
    {
        title: "Le Petit Déjeuner",
        img: "images/dog.webp",
        category: "A1",
        french: "Je mange du pain avec du beurre. Ma mère boit du café. Mon père lit le journal. Nous sommes heureux ensemble.",
        english: "I eat bread with butter. My mother drinks coffee. My father reads the newspaper. We are happy together.",
        words: {
            "Je": "I","mange": "eat","du": "some","pain": "bread",
            "avec": "with","beurre": "butter","Ma": "My","mère": "mother",
            "boit": "drinks","café": "coffee","Mon": "My","père": "father",
            "lit": "reads","le": "the","journal": "newspaper","Nous": "We",
            "sommes": "are","heureux": "happy","ensemble": "together"
        }
    },
    {
        title: "Au Parc",
        category: "B1",
        french: "Les enfants jouent au parc. Le soleil brille dans le ciel bleu. Les oiseaux chantent dans les arbres. C'est une belle journée.",
        english: "The children play in the park. The sun shines in the blue sky. The birds sing in the trees. It's a beautiful day.",
        words: {
            "Les": "The","enfants": "children","jouent": "play","au": "at/in the",
            "parc": "park","Le": "The","soleil": "sun","brille": "shines",
            "dans": "in","le": "the","ciel": "sky","bleu": "blue",
            "oiseaux": "birds","chantent": "sing","les": "the","arbres": "trees",
            "C'est": "It is","une": "a","belle": "beautiful","journée": "day"
        }
    },
];


// Reference to the container
const storyButtonsContainer = document.getElementById('storyButtons');

// Function to generate story buttons dynamically
function generateStoryButtons() {
    storyButtonsContainer.innerHTML = ''; // Clear existing buttons if any

    stories.forEach((story, index) => {
        const btn = document.createElement('div');
        btn.className = 'story-btn';
        if(index === 0) btn.classList.add('active'); // first story active

        btn.onclick = () => loadStory(index, btn);

        btn.innerHTML = `
            <img src="${story.img || 'images/chat.png'}" alt="${story.title}">
            <span>${story.title}</span>
        `;
        storyButtonsContainer.appendChild(btn);
    });
}

// Call this once to render buttons
generateStoryButtons();

// Search box filtering
const searchInput = document.getElementById('storySearch');
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.story-btn').forEach(btn => {
        const title = btn.querySelector('span').textContent.toLowerCase();
        btn.style.display = title.includes(query) ? 'flex' : 'none';
    });
});

function filterStories() {
    const categoryValue = filterCategory.value.toLowerCase();
    const searchQuery = searchInput.value.toLowerCase();

    document.querySelectorAll('.story-btn').forEach((btn, index) => {
        const title = btn.querySelector('span').textContent.toLowerCase();
        const story = stories[index];

        const matchesCategory = categoryValue ? (story.category || '').toLowerCase() === categoryValue : true;
        const matchesSearch = title.includes(searchQuery);

        btn.style.display = (matchesCategory && matchesSearch) ? 'flex' : 'none';
    });

    // If no story is visible after filtering, show default placeholder
        const anyVisible = Array.from(document.querySelectorAll('.story-btn'))
                                .some(btn => btn.style.display !== 'none');

        if (!anyVisible) {
            document.getElementById('storyTitle').textContent = "Select your story";
            document.getElementById('storyContent').innerHTML = "<p>Please choose a story from above to start learning French.</p>";
            document.getElementById('englishTranslation').textContent = "The English translation will appear here once you select a story.";
        }

}
filterCategory.addEventListener('change', filterStories);
searchInput.addEventListener('input', filterStories);




let currentStoryIndex = 0;
let currentSentenceIndex = 0;
let sentences = [];
let speechSynthesisInstance = window.speechSynthesis;
let currentUtterance = null;

function clearAllHighlights() {
    document.querySelectorAll('.french-word').forEach(w => {
        w.classList.remove('highlight');
        w.style.backgroundColor = '';
    });
}

function loadStory(index, button) {
    currentStoryIndex = index;
    currentSentenceIndex = 0;
    const story = stories[index];
    sentences = story.french.split('. ').map(s => s.trim()).filter(s => s.length > 0);

    // Show English translation box when a story is loaded
    document.querySelector('.english-translation').style.display = 'block';

    // Show the play/prev/next controls
    document.querySelector('.controls').style.display = 'flex'; // 'flex' because controls use flexbox


    // Active button
    document.querySelectorAll('.story-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    document.getElementById('storyTitle').textContent = story.title;
    document.getElementById('englishTranslation').textContent = story.english;

    const sentenceHTML = sentences.map((sentence, sIndex) => {
        const words = sentence.split(' ');
        const wordHTML = words.map(word => {
            const cleanWord = word.replace(/[.,!?]/g, '');
            const punctuation = word.match(/[.,!?]/g) ? word.match(/[.,!?]/g)[0] : '';
            if (story.words[cleanWord]) {
                return `<span class="french-word" data-word="${cleanWord}" data-sentence="${sIndex}">${cleanWord}<span class="tooltip">${story.words[cleanWord]}</span></span>${punctuation}`;
            } else {
                return word + punctuation;
            }
        }).join(' ');
        return `<span class="sentence" data-index="${sIndex}">${wordHTML}</span>`;
    }).join('. ');

    document.getElementById('storyContent').innerHTML = sentenceHTML;

    attachWordHoverSound();
    attachSentenceClickPlay();
    attachWordClickPlay();
    updateNavigationButtons();
}


function playSentence(startWordIndex = 0) {
    if (speechSynthesisInstance.speaking) speechSynthesisInstance.cancel();
    clearAllHighlights();

    const sentence = sentences[currentSentenceIndex];
    currentUtterance = new SpeechSynthesisUtterance(sentence);

    const voices = speechSynthesisInstance.getVoices();
    const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
    if (frenchVoice) currentUtterance.voice = frenchVoice;

    currentUtterance.rate = parseFloat(document.getElementById('speed').value);
    currentUtterance.pitch = 1;

    const sentenceElement = document.querySelectorAll('.sentence')[currentSentenceIndex];
    const sentenceWords = Array.from(sentenceElement.querySelectorAll('.french-word'));
    const wordList = sentence.split(' ').map(w => w.replace(/[.,!?]/g, ''));

    let wordIndex = startWordIndex;
    let highlightIndex = startWordIndex;

    currentUtterance.onboundary = function(event) {
        if (event.name === 'word') {
            sentenceWords.forEach(w => {
                w.classList.remove('highlight');
                w.style.backgroundColor = '';
            });

            if (wordIndex < wordList.length) {
                for (let i = highlightIndex; i < sentenceWords.length; i++) {
                    if (sentenceWords[i].dataset.word === wordList[wordIndex]) {
                        sentenceWords[i].classList.add('highlight');
                        sentenceWords[i].style.backgroundColor = '#66ccff';
                        highlightIndex = i + 1;
                        break;
                    }
                }
                wordIndex++;
            }
        }
    };

    currentUtterance.onend = function() {
        clearAllHighlights();
    };

    speechSynthesisInstance.speak(currentUtterance);
}

function nextSentence() {
    if (currentSentenceIndex < sentences.length - 1) {
        currentSentenceIndex++;
        playSentence();
        updateNavigationButtons();
    }
}

function prevSentence() {
    if (currentSentenceIndex > 0) {
        currentSentenceIndex--;
        playSentence();
        updateNavigationButtons();
    }
}

function updateNavigationButtons() {
    document.getElementById('prevBtn').disabled = currentSentenceIndex === 0;
    document.getElementById('nextBtn').disabled = currentSentenceIndex === sentences.length - 1;
}

document.getElementById('speed').addEventListener('input', function() {
    document.getElementById('speedValue').textContent = this.value + 'x';
});

if (speechSynthesisInstance.onvoiceschanged !== undefined) {
    speechSynthesisInstance.onvoiceschanged = function() {
        speechSynthesisInstance.getVoices();
    };
}

function attachWordHoverSound() {
    let hoverUtterance = null;
    document.querySelectorAll('.french-word').forEach(wordEl => {
        wordEl.addEventListener('mouseenter', () => {
            if (hoverUtterance && speechSynthesisInstance.speaking) speechSynthesisInstance.cancel();
            const wordText = wordEl.dataset.word;
            hoverUtterance = new SpeechSynthesisUtterance(wordText);
            const voices = speechSynthesisInstance.getVoices();
            const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
            if (frenchVoice) hoverUtterance.voice = frenchVoice;
            hoverUtterance.rate = 1; hoverUtterance.pitch = 1;
            speechSynthesisInstance.speak(hoverUtterance);
        });
        wordEl.addEventListener('mouseleave', () => {
            if (hoverUtterance && speechSynthesisInstance.speaking) speechSynthesisInstance.cancel();
        });
    });
}

function attachSentenceClickPlay() {
    document.querySelectorAll('.sentence').forEach((sentenceEl, sIndex) => {
        sentenceEl.addEventListener('click', () => {
            currentSentenceIndex = sIndex;
            playSentence();
            updateNavigationButtons();
        });
    });
}

function attachWordClickPlay() {
    document.querySelectorAll('.french-word').forEach((wordEl) => {
        wordEl.addEventListener('click', () => {
            const sIndex = parseInt(wordEl.dataset.sentence);
            const sentenceElement = document.querySelectorAll('.sentence')[sIndex];
            const sentenceWords = Array.from(sentenceElement.querySelectorAll('.french-word'));
            const wordIndex = sentenceWords.indexOf(wordEl);

            currentSentenceIndex = sIndex;
            playSentence(wordIndex);
            updateNavigationButtons();
        });
    });
}

// Initialize
// Initialize first story
// loadStory(0, storyButtonsContainer.querySelector('.story-btn'));


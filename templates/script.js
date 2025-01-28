// Database of inventions with their approximate invention dates
const inventionsDB = {
    'mobile phone': 1973,
    'telephone': 1876,
    'steam engine': 1712,
    'wheel': -3500,
    'internet': 1969,
    'television': 1927,
    'computer': 1936,
    'printing press': 1440,
    'electricity': 1752,
    'automobile': 1886,
    'airplane': 1903,
    'radio': 1895,
    'penicillin': 1928,
    'light bulb': 1879,
};

const API_KEY = 'YOUR_GEMINI_API_KEY'; // You'll need to replace this with your actual API key

async function getInventionDate(item) {
    const prompt = `When was the ${item} invented? Please respond with just the year (use negative numbers for BCE). If you're not certain, respond with 'unknown'.`;
    
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        const data = await response.json();
        const year = parseInt(data.candidates[0].content.parts[0].text);
        
        if (isNaN(year) || data.candidates[0].content.parts[0].text.toLowerCase() === 'unknown') {
            return null;
        }
        
        return year;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function addItem() {
    const input = document.getElementById('itemInput');
    const item = input.value.toLowerCase().trim();

    if (!item) {
        alert('Please enter an item');
        return;
    }

    // Show loading state
    const button = document.querySelector('button');
    const originalText = button.textContent;
    button.textContent = 'Loading...';
    button.disabled = true;

    const year = await getInventionDate(item);

    if (year === null) {
        alert('Sorry, we couldn\'t find reliable information for this item');
    } else {
        createTimelineItem(item, year);
    }

    // Reset button state
    button.textContent = originalText;
    button.disabled = false;
    input.value = '';
}

function createTimelineItem(item, year) {
    const timeline = document.getElementById('timeline');
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';

    const timelineContent = document.createElement('div');
    timelineContent.className = 'timeline-content';

    const dateElement = document.createElement('div');
    dateElement.className = 'timeline-date';
    dateElement.textContent = year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;

    const titleElement = document.createElement('div');
    titleElement.textContent = item.charAt(0).toUpperCase() + item.slice(1);

    timelineContent.appendChild(dateElement);
    timelineContent.appendChild(titleElement);
    timelineItem.appendChild(timelineContent);
    timeline.appendChild(timelineItem);

    // Sort timeline items by date
    sortTimelineItems();
}

function sortTimelineItems() {
    const timeline = document.getElementById('timeline');
    const items = Array.from(timeline.children);
    
    items.sort((a, b) => {
        const dateA = parseInt(a.querySelector('.timeline-date').textContent);
        const dateB = parseInt(b.querySelector('.timeline-date').textContent);
        return dateA - dateB;
    });

    // Clear timeline and append sorted items
    timeline.innerHTML = '';
    items.forEach(item => timeline.appendChild(item));
} 
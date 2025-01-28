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

// Add these constants at the top of the file
const SCALE_FACTOR = 0.1;  // pixels per year
const MIN_GAP = 50;       // minimum pixels between items

async function getInventionDate(item) {
    try {
        const response = await fetch('/api/invention-date', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ item })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch invention date');
        }

        const data = await response.json();
        return data.year;
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

    // Sort timeline items
    sortTimelineItems();
}

function sortTimelineItems() {
    const timeline = document.getElementById('timeline');
    const items = Array.from(timeline.children);
    
    items.sort((a, b) => {
        const textA = a.querySelector('.timeline-date').textContent;
        const textB = b.querySelector('.timeline-date').textContent;
        
        // Extract year and era (BCE/CE)
        const [yearA, eraA] = textA.split(' ');
        const [yearB, eraB] = textB.split(' ');
        
        // Convert to comparable numbers
        const valueA = eraA === 'BCE' ? -parseInt(yearA) : parseInt(yearA);
        const valueB = eraB === 'BCE' ? -parseInt(yearB) : parseInt(yearB);
        
        return valueA - valueB;
    });

    // Clear timeline and append sorted items
    timeline.innerHTML = '';
    items.forEach(item => timeline.appendChild(item));
}

function updateTimelineScale() {
    const timeline = document.getElementById('timeline');
    const items = Array.from(timeline.querySelectorAll('.timeline-item'));  // Only get timeline items
    
    // First, sort the items
    items.sort((a, b) => {
        const yearA = parseInt(a.dataset.year);
        const yearB = parseInt(b.dataset.year);
        return yearA - yearB;
    });

    // Find the range of years
    const minYear = parseInt(items[0].dataset.year);
    const maxYear = parseInt(items[items.length - 1].dataset.year);
    const yearRange = maxYear - minYear;

    // Calculate timeline height
    const timelineHeight = Math.max(yearRange * SCALE_FACTOR, items.length * MIN_GAP);
    timeline.style.height = `${timelineHeight}px`;

    // Remove old scale markers
    const oldMarkers = timeline.querySelectorAll('.timeline-scale');
    oldMarkers.forEach(marker => marker.remove());

    // Add scale markers every 1000 years or appropriate interval
    const interval = calculateScaleInterval(yearRange);
    for (let year = minYear; year <= maxYear; year += interval) {
        const marker = createScaleMarker(year, minYear, timelineHeight, maxYear);
        timeline.appendChild(marker);
    }

    // Position items
    items.forEach(item => {
        const year = parseInt(item.dataset.year);
        const position = ((year - minYear) / yearRange) * timelineHeight;
        item.style.top = `${position}px`;
        timeline.appendChild(item);  // Move item to maintain proper order
    });
}

function calculateScaleInterval(yearRange) {
    if (yearRange > 10000) return 2000;
    if (yearRange > 5000) return 1000;
    if (yearRange > 2000) return 500;
    if (yearRange > 1000) return 200;
    if (yearRange > 500) return 100;
    return 50;
}

function createScaleMarker(year, minYear, timelineHeight, maxYear) {
    const marker = document.createElement('div');
    marker.className = 'timeline-scale';
    marker.textContent = year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
    
    const position = ((year - minYear) / (maxYear - minYear)) * timelineHeight;
    marker.style.top = `${position}px`;
    
    return marker;
} 
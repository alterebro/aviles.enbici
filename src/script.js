// Init mapa
const map = L.map('map', {
    minZoom: 12,
    maxZoom: 18,
}).setView([43.556089, -5.920556], 14);

// Base Layer OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

function updateMap(locations) {

    if (window.markers) { window.markers.forEach(marker => marker.remove()); }

    window.markers = locations.map(location => {
        const busy = location.bikes + location.ebikes;
        const available = location.locks - busy;
        const modalList = [
            { term: 'Anclajes libres', val: available },
            { term: 'Anclajes ocupados', val: busy },
            { term: 'Bicis normales', val: location.bikes },
            { term: 'Bicis eléctricas', val: location.ebikes },
        ]
        const popupContent = `<strong>${location.name}</strong><br />` + modalList.map(el => `${el.term}: ${el.val}`).join('<br />');

        return L.marker([location.lat, location.lng])
            .addTo(map)
            .bindPopup(popupContent);
    });

    // Set view to show all markers
    const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
    const boundsPad = bounds.pad(0.25);

    map.fitBounds(boundsPad);
    map.setMaxBounds(boundsPad);
}

async function getRealTimeData() {
   
    try {

        // const response = await fetch('https://enbici.aviles.es/Prodws/global/mapa');
        // const text = await response.text();
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://enbici.aviles.es/Prodws/global/mapa')}`);
        const text = await response.text();

        const contents = JSON.parse(text).contents;

        const parser = new DOMParser();
        // const doc = parser.parseFromString(text, 'text/html');
        const doc = parser.parseFromString(contents, 'text/html');

        const markers = Array.from(doc.querySelectorAll('.sidebarR-row1, .sidebarR-row2'));
        const elements = markers.map((marker, id) => {
            const name = marker.querySelector('div:nth-child(1)').textContent.trim();
            const locks = parseInt(marker.querySelector('div:nth-child(2)').textContent.trim(), 10);
            const bikes = parseInt(marker.querySelector('div:nth-child(3)').textContent.trim(), 10);
            const ebikes = parseInt(marker.querySelector('div:nth-child(4)').textContent.trim(), 10);
            return { id, name, locks, bikes, ebikes };
        });

        const coordinates = [];
        const scriptElements = doc.querySelectorAll('script');
    
            scriptElements.forEach(script => {
                const scriptContent = script.textContent;

                if (scriptContent.includes('new google.maps.Marker')) {

                    // Search lat lng occurrences within script
                    const markerMatches = scriptContent.matchAll(/new google\.maps\.Marker\(\{[^}]+lat:\s*([\d.]+),\s*lng:\s*([\d.-]+)/g);
                    
                    for (const match of markerMatches) {
                        const lat = parseFloat(match[1]);
                        const lng = parseFloat(match[2]);
                        coordinates.push({ lat, lng });
                    }

                }
            });

        if (elements.length !== coordinates.length) {
            console.error('Elements and coords unmatch...');
            showStatus(true, `<p style="color:#c00">Error Cargando Datos<br>Recarga la página.</p>`);
            return;
        }
    
        const locations = elements.map((marker, index) => ({
            ...marker,
            lat: coordinates[index].lat,
            lng: coordinates[index].lng,
        }));

        return locations;

    } catch (error) {
        console.error('Error getting real time data:', error);
        showStatus(true, `<p style="color:#c00">Error Cargando Datos<br>Recarga la página.</p>`);
        return [];
    }
}

const showStatus = function(show, msg) {
    if (show) {
        document.querySelector('#message').innerHTML = msg;
        document.querySelector('#status').style.display = 'grid';
    } else {
        document.querySelector('#status').style.display = 'none';
        document.querySelector('#message').innerHTML = '';
    }
}

const getLocations = function() {
    console.log('Getting data...');
    showStatus(true, `<p>Cargando Datos...</p>`);
    getRealTimeData().then(locations => {
        console.log('Locations Updated:', locations);
        updateMap(locations);
        showStatus(false);
    });        
}

getLocations();
// Default Locations
const locations = [
    {
        id: 0, name: "01 - CDA  Quirinal",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.5558, lng: -5.93422
    },
    {
        id: 1, name: "02 - Las Meanas",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.55666, lng: -5.9256
    },
    {
        id: 2, name: "03 - Los Canapés",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.54636, lng: -5.9157
    },
    {
        id: 3, name: "04 - La Toba",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.54566, lng: -5.89987
    },
    {
        id: 4, name: "05 - Villalegre",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.53772, lng: -5.90362
    },
    {
        id: 5, name: "06 - Oficina de Turismo",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.556089, lng: -5.920556
    },
    {
        id: 6, name: "07 - EOI IES nº5",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.560407, lng: -5.933887
    },
    {
        id: 7, name: "08 - Parking Avda. Gijón",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.551769, lng: -5.914237
    },
    {
        id: 8, name: "09 - PEPA",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.559548, lng: -5.909888
    },
    {
        id: 9, name: "10 - LA LUZ",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.538959, lng: -5.90838
    },
    {
        id: 10, name: "11 - Estación Central",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.561217, lng: -5.923021
    },
    {
        id: 11, name: "12 - La Carriona",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.541638, lng: -5.938934
    },
    {
        id: 12, name: "13 - La Magdalena",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.551086, lng: -5.929057
    },
    {
        id: 13, name: "14 - Llaranes - FEVE",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.553833, lng: -5.897278
    },
    {
        id: 14, name: "15 - HUSA",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.552111, lng: -5.936722
    },
    {
        id: 15, name: "16 - La Rocica - RENFE",
        locks: 0, bikes: 0, ebikes: 0,
        lat: 43.547028, lng: -5.905556
    }
];

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Init mapa
const map = L.map('map', {
    minZoom: 12,
    maxZoom: 18
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
    map.fitBounds(bounds);
    map.setMaxBounds(bounds);
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
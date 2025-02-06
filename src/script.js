const locations = [
    {
        name: "01 - CDA Quirinal",
        lat: 43.5558,
        lng: -5.93422,
        locks: 7,
        bikes: 0,
        ebikes: 3
    },
    {
        name: "02 - Las Meanas",
        lat: 43.55666,
        lng: -5.9256,
        locks: 18,
        bikes: 0,
        ebikes: 2
    },
    {
        name: "03 - Los Canapés",
        lat: 43.54636,
        lng: -5.9157,
        locks: 13,
        bikes: 0,
        ebikes: 2
    },
    {
        name: "04 - La Toba",
        lat: 43.54566,
        lng: -5.89987,
        locks: 5,
        bikes: 0,
        ebikes: 5
    },
    {
        name: "05 - Villalegre",
        lat: 43.53772,
        lng: -5.90362,
        locks: 8,
        bikes: 0,
        ebikes: 2
    },
    {
        name: "06 - Oficina de Turismo",
        lat: 43.556089,
        lng: -5.920556,
        locks: 12,
        bikes: 0,
        ebikes: 3
    },
    {
        name: "07 - EOI IES nº5",
        lat: 43.560407,
        lng: -5.933887,
        locks: 7,
        bikes: 0,
        ebikes: 3
    },
    {
        name: "08 - Parking Avda. Gijón",
        lat: 43.551769,
        lng: -5.914237,
        locks: 7,
        bikes: 0,
        ebikes: 3
    },
    {
        name: "09 - PEPA",
        lat: 43.559548,
        lng: -5.909888,
        locks: 19,
        bikes: 0,
        ebikes: 1
    },
    {
        name: "10 - LA LUZ",
        lat: 43.538959,
        lng: -5.90838,
        locks: 8,
        bikes: 0,
        ebikes: 2
    },
    {
        name: "11 - Estación Central",
        lat: 43.561217,
        lng: -5.923021,
        locks: 7,
        bikes: 0,
        ebikes: 3
    },
    {
        name: "12 - La Carriona",
        lat: 43.541638,
        lng: -5.938934,
        locks: 8,
        bikes: 0,
        ebikes: 2
    },
    {
        name: "13 - La Magdalena",
        lat: 43.551086,
        lng: -5.929057,
        locks: 7,
        bikes: 0,
        ebikes: 3
    },
    {
        name: "14 - Llaranes - FEVE",
        lat: 43.553833,
        lng: -5.897278,
        locks: 10,
        bikes: 0,
        ebikes: 5
    },
    {
        name: "15 - HUSA",
        lat: 43.552111,
        lng: -5.936722,
        locks: 8,
        bikes: 0,
        ebikes: 2
    },
    {
        name: "16 - La Rocica - RENFE",
        lat: 43.547028,
        lng: -5.905556,
        locks: 15,
        bikes: 0,
        ebikes: 0
    }
];




    // Init mapa
    // const map = L.map('map').setView([43.5558, -5.93422], 14);
    const map = L.map('map').setView([43.5556629, -5.9411305], 13);

    // Base Layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.tileLayer.provider('Stadia.OSMBright').addTo(map);


    /*
    // add markers w/popups
    locations.forEach(location => {
        const ocupados = location.regular + location.electric;
        const libres = location.locks - ocupados;
        
        const popupContent = `
            <b>${location.name}</b><br>
            Anclajes libres: ${libres}<br>
            Anclajes ocupados: ${ocupados}<br>
            Bicis normales: ${location.regular}<br>
            Bicis eléctricas: ${location.electric}
        `;

        L.marker([location.lat, location.lng])
            .addTo(map)
            .bindPopup(popupContent);
    });

    // Set view to show all markers
    const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
    map.fitBounds(bounds);
    */



function updateMap(locations) {


    if (window.markers) {
        window.markers.forEach(marker => marker.remove());
    }

    window.markers = locations.map(location => {
        const busy = location.bikes + location.ebikes;
        const available = location.locks - busy;

        const popupContent = `
            <b>${location.name}</b><br>
            Anclajes libres: ${available}<br>
            Anclajes ocupados: ${busy}<br>
            Bicis normales: ${location.bikes}<br>
            Bicis eléctricas: ${location.ebikes}
        `;

        return L.marker([location.lat, location.lng])
            .addTo(map)
            .bindPopup(popupContent);
    });

    // Set view to show all markers
    const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
    map.fitBounds(bounds);
}


updateMap(locations);



// https://enbici.aviles.es/Prodws/global/mapa

// fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://enbici.aviles.es/Prodws/global/mapa')}`)
//     .then(response => {
//         if (response.ok) return response.json()
//         throw new Error('Network response was not ok.')
//     })
//     .then(data => console.log(data.contents));

async function getRealTimeData() {
    try {

        // const response = await fetch('https://enbici.aviles.es/Prodws/global/mapa');
        // const text = await response.text();
        
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://enbici.aviles.es/Prodws/global/mapa')}`);
        const text = await response.text();

        const http_code = JSON.parse(text).status.http_code; // 200
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

        // console.log( 'elems: ', elements )
        // console.log( 'coords: ', coordinates )

        if (elements.length !== coordinates.length) {
            console.error('Elems and coords unmatch...');
            return;
        }
    
        const locations = elements.map((marker, index) => ({
            ...marker,
            lat: coordinates[index].lat,
            lng: coordinates[index].lng,
        }));


        // console.log('Realtime data:', locations);
        return locations;

    } catch (error) {
        console.error('Error getting real time data:', error);
        return [];
    }
}


getRealTimeData().then(locations => {
    console.log('Locations Updated:', locations);
    updateMap(locations);
});    

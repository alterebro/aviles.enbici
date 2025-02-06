const e=L.map("map").setView([43.5556629,-5.9411305],13);function t(t){window.markers&&window.markers.forEach(e=>e.remove()),window.markers=t.map(t=>{let a=t.bikes+t.ebikes,l=t.locks-a,n=`
            <b>${t.name}</b><br>
            Anclajes libres: ${l}<br>
            Anclajes ocupados: ${a}<br>
            Bicis normales: ${t.bikes}<br>
            Bicis el\xe9ctricas: ${t.ebikes}
        `;return L.marker([t.lat,t.lng]).addTo(e).bindPopup(n)});let a=L.latLngBounds(t.map(e=>[e.lat,e.lng]));e.fitBounds(a)}L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(e),L.tileLayer.provider("Stadia.OSMBright").addTo(e),t([{name:"01 - CDA Quirinal",lat:43.5558,lng:-5.93422,locks:7,bikes:0,ebikes:3},{name:"02 - Las Meanas",lat:43.55666,lng:-5.9256,locks:18,bikes:0,ebikes:2},{name:"03 - Los Canapés",lat:43.54636,lng:-5.9157,locks:13,bikes:0,ebikes:2},{name:"04 - La Toba",lat:43.54566,lng:-5.89987,locks:5,bikes:0,ebikes:5},{name:"05 - Villalegre",lat:43.53772,lng:-5.90362,locks:8,bikes:0,ebikes:2},{name:"06 - Oficina de Turismo",lat:43.556089,lng:-5.920556,locks:12,bikes:0,ebikes:3},{name:"07 - EOI IES nº5",lat:43.560407,lng:-5.933887,locks:7,bikes:0,ebikes:3},{name:"08 - Parking Avda. Gijón",lat:43.551769,lng:-5.914237,locks:7,bikes:0,ebikes:3},{name:"09 - PEPA",lat:43.559548,lng:-5.909888,locks:19,bikes:0,ebikes:1},{name:"10 - LA LUZ",lat:43.538959,lng:-5.90838,locks:8,bikes:0,ebikes:2},{name:"11 - Estación Central",lat:43.561217,lng:-5.923021,locks:7,bikes:0,ebikes:3},{name:"12 - La Carriona",lat:43.541638,lng:-5.938934,locks:8,bikes:0,ebikes:2},{name:"13 - La Magdalena",lat:43.551086,lng:-5.929057,locks:7,bikes:0,ebikes:3},{name:"14 - Llaranes - FEVE",lat:43.553833,lng:-5.897278,locks:10,bikes:0,ebikes:5},{name:"15 - HUSA",lat:43.552111,lng:-5.936722,locks:8,bikes:0,ebikes:2},{name:"16 - La Rocica - RENFE",lat:43.547028,lng:-5.905556,locks:15,bikes:0,ebikes:0}]),(async function(){try{let e=await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent("https://enbici.aviles.es/Prodws/global/mapa")}`),t=await e.text();JSON.parse(t).status.http_code;let a=JSON.parse(t).contents,l=new DOMParser().parseFromString(a,"text/html"),n=Array.from(l.querySelectorAll(".sidebarR-row1, .sidebarR-row2")).map((e,t)=>{let a=e.querySelector("div:nth-child(1)").textContent.trim(),l=parseInt(e.querySelector("div:nth-child(2)").textContent.trim(),10),n=parseInt(e.querySelector("div:nth-child(3)").textContent.trim(),10),s=parseInt(e.querySelector("div:nth-child(4)").textContent.trim(),10);return{id:t,name:a,locks:l,bikes:n,ebikes:s}}),s=[];if(l.querySelectorAll("script").forEach(e=>{let t=e.textContent;if(t.includes("new google.maps.Marker"))for(let e of t.matchAll(/new google\.maps\.Marker\(\{[^}]+lat:\s*([\d.]+),\s*lng:\s*([\d.-]+)/g)){let t=parseFloat(e[1]),a=parseFloat(e[2]);s.push({lat:t,lng:a})}}),n.length!==s.length){console.error("Elems and coords unmatch...");return}return n.map((e,t)=>({...e,lat:s[t].lat,lng:s[t].lng}))}catch(e){return console.error("Error getting real time data:",e),[]}})().then(e=>{console.log("Locations Updated:",e),t(e)});
/* Wetterstationen Euregio Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true
}).setView([ibk.lat, ibk.lng], 11);

// thematische Layer
let themaLayer = {
    stations: L.featureGroup()
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "Relief avalanche.report": L.tileLayer(
        "https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
        attribution: `© <a href="https://lawinen.report">CC BY avalanche.report</a>`,
        maxZoom: 12
    }).addTo(map),
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery")
}, {
    "Wetterstationen": themaLayer.stations.addTo(map)
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// Wetterstationen bearbeiten
async function showStations(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/icons.png",
                    iconSize: [32, 37],
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            let pointInTime = new Date(prop.date);
            console.log(pointInTime);
            let sealevel = feature.geometry.coordinates
            layer.bindPopup(`
                <h4>${prop.name} ${sealevel[2]} m ü. NN</h4>
                <ul>
                <li> Luftfeuchtigkeit in °C: ${prop.LT || "keine Angabe"}
                <li> Relative Luftfeuchtigkeit in %: ${prop.RH || "keine Angabe"}
                <li> Windgeschwindigkeit in km/h: ${prop.WG || "keine Angabe"}
                <li> Schneehöhe in cm: ${prop.HS || "keine Angabe"} </li>
                </ul>
                <span>${pointInTime.toLocaleString()}</span>
            `);
            //console.log(feature.properties, prop.NAME);
        }
    }).addTo(themaLayer.stations)
}
showStations("https://static.avalanche.report/weather_stations/stations.geojson");

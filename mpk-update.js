// logs two dicts of bus and tramway positions every queryInterval miliseconds

const request = require('request');
const { Vehicle, VehiclePosition } = require('./models/');
const queryInterval = 10000;

const logUpToNLastPositions = 5;
const deg2rad = 0.01745329252;
var lastPositions = { };
var lastSpeeds = { };

function haversine(lon1, lat1, lon2, lat2) {
    /*
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    */
    // convert decimal degrees to radians
    lon1 *= deg2rad; lat1 *= deg2rad; lon2 *= deg2rad; lat2 *= deg2rad;
    // haversine formula 
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
    let c = 2 * Math.asin(Math.sqrt(a));
    // Radius of earth in kilometers is 6371
    let km = 6371 * c;
    return km
}

async function requestPositions(formData) {
    const result = await new Promise((resolve, reject) => {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1'
        };
        request.post({
            url: 'http://mpk.wroc.pl/position.php',
            formData: formData,
            headers: headers
        }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                reject(err);
            }
            resolve(body);
        });
    });
    return result;
};

function onPositionsLoaded(positions) {
    for(let i = 0; i < positions.length; i++) {
        let position = positions[i];
        let vehicleType = position.type.charAt(0).toUpperCase() + position.type.substr(1);
        Vehicle.findCreateFind({where: {name: position.name, model: position.k}, defaults: {
            name: position.name,
            model: positions.k,
            vehicleType: vehicleType
        }}).spread((vehicle, created) => {
            // log position
            if(!lastPositions[vehicle.id])
                lastPositions[vehicle.id] = [];
            lastPositions[vehicle.id].push({lat: position.x, lon: position.y, posDate: new Date()});
            if(lastPositions[vehicle.id] > logUpToNLastPositions)
                lastPositions[vehicle.id].shift();

            VehiclePosition.create({
                x: position.x,
                y: position.y,
                posDate: new Date()
            }).then(p => {
                vehicle.addPosition(p).catch((err) => console.error(err));
            }, (err) => console.error(err));
        });
    }
}

module.exports = {
    updatePositions: async function () {
        const busLines = {
            'busList[bus][]': [
                100, 101, 103, 104, 105, 107, 109, 110, 113, 114, 115, 116, 118,
                119, 120, 122, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 136, 140, 141, 142, 144, 145, 146,
                147, 149, 240, 241, 243, 245, 246, 247, 249, 250, 251, 253, 255, 257, 259, 'a', 'c', 'd', 'k', 'n']
        };

        const tramwayLines = {
            'busList[tram][]': [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14,
                15, 17, 20, 23, 24, 31, 32, 33, '0l', '0p'
            ]
        };

        setInterval(() => {
            requestPositions(busLines)
                .then((body) => {
                    onPositionsLoaded(JSON.parse(body));
                    shouldRefreshAPIAnswer = true;
                })
                .catch((e) => console.warn("Request rejected: " + e));
            requestPositions(tramwayLines)
                .then((body) => {
                    onPositionsLoaded(JSON.parse(body));
                    shouldRefreshAPIAnswer = true;
                })
                .catch((e) => console.warn("Request rejected: " + e));
        }, queryInterval);
    },

    getSpeed: function(vehicleId) {
        if(lastPositions[vehicleId] !== undefined && lastPositions[vehicleId].length > 1) {
            let travelKm = 0;
            let travelHours = 0;
            for(let i = 1; i < lastPositions[vehicleId].length; i++) {
                let pos = lastPositions[vehicleId][i];
                let prevPos = lastPositions[vehicleId][i - 1];
                travelHours += (pos.posDate - prevPos.posDate) / 1000.0 / 60.0 / 60.0;
                travelKm += haversine(pos.lon, pos.lat, prevPos.lon, prevPos.lat);
            }
            return travelKm / travelHours;
        } else {
            return 0;
        }
    }
};
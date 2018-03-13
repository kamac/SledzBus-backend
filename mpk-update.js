const queryInterval = 10000;

async function requestPositions(formData) {
    const result = await new Promise((resolve, reject) => {
        const request = require('request');
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
}

function updatePositions() {
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
        requestPositions(busLines).then((body) => { console.log(body)}).catch((e) => {console.log("Request rejected: " + e)});
        requestPositions(tramwayLines).then((body) => { console.log(body)}).catch((e) => {console.log("Request rejected: " + e)});
    }, queryInterval);
}

updatePositions();
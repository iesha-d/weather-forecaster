

function getPicture() {
    // read contents of lat, long
    // convert to numbers
    // do the fetch
    // put results into output

    let lat = document.getElementById("lat").value;
    let long = document.getElementById("long").value;
    let URL1 = 'https://api.weather.gov/points/' + lat + ',' + long;
    let P = fetch(URL1);

    let P2 = P.then(res => res.json()).then(json => {
        let URL2 = json.properties.forecast;
        console.log("Forecast URL: " + URL2);
        let P3 = fetch(URL2);
    
        let P4 = P3.then(res => res.json()).then(json => {
            console.log(json);

            let output = document.getElementById("output");
            while (output.firstChild) {
                output.removeChild(output.lastChild);
            }

            document.getElementById("output").innerHTML = json.properties.periods[0].detailedForecast;
            drawTemp(json);
        });
    });
    
}

const TEMP_GRADIENT = [
    { temp: -10, r: 149, g: 137, b: 211 },
    { temp: 10, r: 130, g: 177, b: 188 },
    { temp: 25, r: 107, g: 184, b: 188 },
    { temp: 30, r: 95, g: 143, b: 195 }, 
    { temp: 40, r: 91, g: 170, b: 83 },  
    { temp: 70, r: 215, g: 175, b: 7 },
    { temp: 77, r: 242, g: 143, b: 8 },
    { temp: 85, r: 227, g: 89, b: 21 },
    { temp: 100, r: 143, g: 45, b: 11 },
];

function getTempFromGradient(t, grad) {
    if (t <= grad[0].temp) {
        return `rgb(${grad[0].r},${grad[0].g},${grad[0].b})`;
    } else if (t >= grad[grad.length - 1].temp) {
        const last = grad.length - 1;
        return `rgb(${grad[last].r},${grad[last].g},${grad[last].b})`;
    }

    let lower = 0;
    while (lower < grad.length - 1 && grad[lower + 1].temp < t) {
        lower++;
    }

    let mRed = (grad[lower + 1].r - grad[lower].r) / (grad[lower + 1].temp - grad[lower].temp);
    let mGreen = (grad[lower + 1].g - grad[lower].g) / (grad[lower + 1].temp - grad[lower].temp);
    let mBlue = (grad[lower + 1].b - grad[lower].b) / (grad[lower + 1].temp - grad[lower].temp);

    let bRed = grad[lower].r - mRed * grad[lower].temp;
    let bGreen = grad[lower].g - mGreen * grad[lower].temp;
    let bBlue = grad[lower].b - mBlue * grad[lower].temp;

    let r = mRed * t + bRed;
    let g = mGreen * t + bGreen;
    let b = mBlue * t + bBlue;

    return `rgb(${r},${g},${b})`;
}

function drawTemp(json) {
    const canvas = document.getElementById('temperatures');
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgb(230, 230, 255)';
        ctx.fillRect(0, 0, 455, 225);
        ctx.fillStyle = 'rgb(0,0,0)';

        let max = 0;
        let min = 100;

        for (let n = 0; n <= 13; n++) {
            if (json.properties.periods[n].temperature > max) {
                max = json.properties.periods[n].temperature;
            }
            if (json.properties.periods[n].temperature < min) {
                min = json.properties.periods[n].temperature;
            }
        }

        let grd = ctx.createLinearGradient(4, 0, 451, 0);
        for (let i = 0; i <= 13; i++) {
            let temp = json.properties.periods[i].temperature;
            console.log(getTempFromGradient(temp, TEMP_GRADIENT));
            grd.addColorStop((i + 0.5)/14, getTempFromGradient(temp, TEMP_GRADIENT));

        }
        
        ctx.fillStyle = "rgb(0,0,0)";
        
        for (let i = 0; i <= 13; i++) {
            let temp = json.properties.periods[i].temperature;
            let slope = (-205 + 20) / (max - min);
            let b = 20 - slope * max;
            let y = slope * temp + b;

            ctx.fillRect(i * 32 + 7 + 2, y + 2, 25, 225 - y);

            ctx.font = 'bold 14px sans-serif';
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 2;
            
            console.log(temp);
        }

        ctx.fillStyle = grd;
        
        for (let i = 0; i <= 13; i++) {
            let temp = json.properties.periods[i].temperature;
            let slope = (-205 + 20) / (max - min);

            let b = 20 - slope * max;

            let y = slope * temp + b;

            ctx.fillRect(i * 32 + 7, y, 25, 225 - y);

            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(temp, i * 32 + 7 + 5.25, y - 5);
            
            console.log(temp);
        }
    }

}

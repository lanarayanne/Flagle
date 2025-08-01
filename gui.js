let xhrTodayCountry = new XMLHttpRequest();
xhrTodayCountry.responseType = "json";
let todayCountry;

xhrTodayCountry.onload = () => {
    todayCountry = xhrTodayCountry.response[0];
    init();
}

xhrTodayCountry.open("get", `https://restcountries.com/v3.1/alpha/usa`);
xhrTodayCountry.send();

function init() {

    let attempts = 0;
    showAttempts();

    function showAttempts() {
        let attemptsMsg = document.querySelector("#attemptMsg");
        let firstMsg = document.querySelector("#firstMsg");

        if (attempts == 0){
            firstMsg.textContent = "Escolha um país para revelar a primeira parte da bandeira";
        } else {
            firstMsg.textContent = "";
        }


        if (attempts <= 6) {
            attemptsMsg.textContent = "Tentativa " + attempts + "/6";
        } else {
            attemptsMsg.textContent = "";
        }
        attempts++;
    }

    let send = document.querySelector('input[type="button"]');
    send.onclick = () => {
        let selectElement = document.querySelector("select");
        let countryValue = selectElement.value;

        let xhrCountry = new XMLHttpRequest();
        xhrCountry.responseType = "json";

        xhrCountry.open("get", `https://restcountries.com/v3.1/alpha/${countryValue}`);

        xhrCountry.onload = () => {
            const country = xhrCountry.response[0];

            let tbody = document.querySelector("tbody");
            let tr = tbody.insertRow();
            let name = tr.insertCell();
            name.textContent = country.name.common;
            let distance = tr.insertCell();
            let distanceValue = calcDistancia(country);
            let formattedDistance = distanceValue.toFixed(2);
            distance.textContent = formattedDistance + "Km";

            let direction = tr.insertCell();
            showIcon(direction, country);

            let percent = tr.insertCell();
            let percentValue = calcPercent(distanceValue)
            percent.textContent = percentValue.toFixed(0) + "%";

            let position = calcPosition();
            if (typeof (position) === "number") {
                showFlag(position);
            };


            showAttempts();
            gameWin(country.name.common);
        }

        xhrCountry.send();

    }

    function calcDirection(country) {
        const [lat1, lon1] = todayCountry.latlng;
        const [lat2, lon2] = country.latlng;
        const margem = 0.50;

        let latDiff = lat2 - lat1;
        let lonDiff = lon2 - lon1;

        let vert = '';
        let horiz = '';

        if (latDiff > margem) {
            vert = 'norte';
        } else if (latDiff < -margem) {
            vert = 'sul';
        }

        if (lonDiff > margem) {
            horiz = 'leste';
        } else if (lonDiff < -margem) {
            horiz = 'oeste';
        }

        if (vert && horiz) {
            return vert + horiz;
        }
        if (vert) {
            return vert;
        }
        if (horiz) {
            return horiz;
        }

    }

    const directionsMap = {
        norte: "north",
        sul: "south",
        leste: "east",
        oeste: "west",
        norteleste: "north_east",
        norteoeste: "north_west",
        suloeste: "south_west",
        sulleste: "south_east"
    };

    function showIcon(place, country) {
        let position = calcDirection(country);
        let span = document.createElement('span');
        span.className = "material-symbols-outlined";

        span.textContent = directionsMap[position] || "help"

        place.appendChild(span);

    }


    function calcDistancia(country) {
        const [lat1, lon1] = todayCountry.latlng;
        const [lat2, lon2] = country.latlng;
        const R = 6371;

        const lat1Rad = lat1 * (Math.PI / 180);
        const lon1Rad = lon1 * (Math.PI / 180);
        const lat2Rad = lat2 * (Math.PI / 180);
        const lon2Rad = lon2 * (Math.PI / 180);

        const dLat = lat2Rad - lat1Rad;
        const dLon = lon2Rad - lon1Rad;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distancia = R * c;

        return distancia;
    }

    function calcPercent(distancia) {
        const largestDistance = 20004;
        return (distancia * 100 / largestDistance);

    }



    let posiblePositions = [];

    function calcPosition() {
        if (posiblePositions.length >= 6) {
            return endOfGame();
        }

        let random = Math.floor(Math.random() * 6);
        if (posiblePositions.find(x => x === random) !== undefined) {
            return calcPosition();
        } else {
            posiblePositions.push(random);
            return random;
        }
    }


    function changeMessage(message) {
        let finalMsg = document.querySelector("#finalMsg");
        finalMsg.textContent = message;

    }

    function disableSend() {
        let send = document.querySelector('input[type="button"]');
        send.disabled = true;
    }


    function endOfGame() {
        changeMessage("Não foi dessa vez");
        disableSend();
    }

    function gameWin(countryName) {
        if (countryName === todayCountry.name.common) {
            changeMessage("Parabens");
            disableSend();
        }

    }

    function showFlag(position) {
        let containers = document.querySelectorAll('div[class="imgspace"]');
        // const position = calcPosition();
        const col = position % 3;
        const row = Math.floor(position / 3);
        const flagURL = todayCountry.flags.svg;
        const div = containers[position];
        div.style.backgroundColor = "white";


        const tileWidth = 200;
        const tileHeight = 200;


        div.style.backgroundImage = `url(${flagURL})`;
        div.style.backgroundSize = `${3 * tileWidth}px ${2 * tileHeight}px`; // 300px x 200px
        div.style.backgroundPosition = `-${col * tileWidth}px -${row * tileHeight}px`;
        div.style.backgroundRepeat = "no-repeat";
        div.style.width = `${tileWidth}px`;
        div.style.height = `${tileHeight}px`;
    }

    let xhrFlag = new XMLHttpRequest();
    xhrFlag.responseType = "json";

    let selectCountry = document.querySelector("select");

    let xhrAllCountries = new XMLHttpRequest();
    xhrAllCountries.responseType = "json";

    xhrAllCountries.open("get", `https://restcountries.com/v3.1/all?fields=name,cioc`);

    xhrAllCountries.onload = () => {
        console.log(xhrAllCountries.status)
        let countriesList = xhrAllCountries.response;

        countriesList.sort((a, b) => {
            let countryA = a.name.common.toUpperCase();
            let countryB = b.name.common.toUpperCase();
            if (countryA < countryB) {
                return -1;
            }
            if (countryA > countryB) {
                return 1;
            }
            return 0;
        });

        countriesList.forEach(country => {
            let option = document.createElement('option');
            option.textContent = country.name.common;
            option.value = country.cioc;
            selectCountry.appendChild(option);
        });

    }

    xhrAllCountries.send();
}

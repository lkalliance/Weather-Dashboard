// GLOBAL DECLARATIONS

dayjs.extend(window.dayjs_plugin_utc);

const forecastAPIstart = "http://api.openweathermap.org/data/2.5/weather?";
const latlonAPIstart = "http://api.openweathermap.org/geo/1.0/direct?";
const APIlimit = "&limit=5";
const APIkey = "&appid=7897ccda0965301a098fbfd75fe1b4aa";
const jSearchBtn = $("#search-button");         // search button
const jCityInput = $("#city-input");            // input field for city search
const jSearchList = $("#previous-searches");    // ul container for cities searched


// for testing
const jAPIreturn = $("#api-return");

let citystate = "q=Minneapolis";

let latlon = "test";

fetch((latlonAPIstart + citystate + APIlimit + APIkey))
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        latlon = "lat=" + data[0].lat + "&lon=" + data[0].lon;
        fetch((forecastAPIstart + latlon + "&units=imperial" + APIlimit + APIkey))
            .then(function(response) {
                return(response.json());
            })
            .then(function(data) {
                let dt = dayjs(data.dt*1000).format("ddd, MMM DD, h:mm A");
                console.log(dt);
                console.log(data);
            })
    })    

    


// ---- FUNCTION EXPRESSIONS ----

// ---- END FUNCTION EXPRESSIONS ----





// ---- FUNCTION DECLARATIONS ----

// ---- END FUNCTION DECLARATIONS ----
// GLOBAL DECLARATIONS

dayjs.extend(window.dayjs_plugin_utc);

const forecastAPIstart = "http://api.openweathermap.org/data/2.5/weather?";
const latlonAPIstart = "http://api.openweathermap.org/geo/1.0/direct?";
const APIlimit = "&limit=5";
const APIkey = "&appid=7897ccda0965301a098fbfd75fe1b4aa";
const jSearchBtn = $("#search-button");         // search button
const jCityInput = $("#city-input");            // input field for city search
const jSearchList = $("#previous-searches");    // ul container for cities searched
const jWhereWhen = $("#city-and-date");         // h3 with city name and date
const jCurrent = $("#current");                 // container for current conditions



// for testing
const jAPIreturn = $("#api-return");

let citystate;

let latlon = "test";

jSearchBtn.on("click", function() {
    if(jCityInput.val() == "") return;
    else {
        jWhereWhen.empty();
        console.log(jWhereWhen.text());
        jCurrent.empty();
        getData(("q=" + jCityInput.val()));
    }
})

function getData(where) {
    fetch((latlonAPIstart + where + APIlimit + APIkey))
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
            console.log(data);
            let dt = dayjs(data.dt*1000).format("ddd, MMM DD, h:mm A");
            let jNewSpan = $("<span>");
            jNewSpan.text((" (" + dt + ")"))
            jWhereWhen.text(data.name);
            console.log(jWhereWhen.text());
            jWhereWhen.append(jNewSpan);

            let jTempNow = $("<p>");
            jCurrent.append(jTempNow);
            jTempNow.text("Temp: " + data.main.temp + "°F");

            let jWindNow = $("<p>");
            jCurrent.append(jWindNow);
            jWindNow.text("Wind: " + data.wind.speed + " MPH");

            let jHumNow = $("<p>");
            jCurrent.append(jHumNow);
            jHumNow.text("Humidity: " + data.main.humidity + "%");
        })
    })    
}
    
    


// ---- FUNCTION EXPRESSIONS ----

// ---- END FUNCTION EXPRESSIONS ----





// ---- FUNCTION DECLARATIONS ----

// ---- END FUNCTION DECLARATIONS ----
dayjs.extend(window.dayjs_plugin_utc);

// GLOBAL DECLARATIONS

// Pieces of API calls for reference
const todayAPIstart = "https://api.openweathermap.org/data/2.5/weather?";
const forecastAPIstart = "https://api.openweathermap.org/data/2.5/forecast?";
const latlonAPIstart = "https://api.openweathermap.org/geo/1.0/direct?q=";
const APIlimit = "&limit=5";
const APIunits = "&units=imperial";
const APIkey = "&appid=7897ccda0965301a098fbfd75fe1b4aa";

// Various containers
const jSearchBtn = $("#search-button");         // search button
const jCityInput = $("#city-input");            // input field for city search
const jSearchList = $("#previous-searches");    // ul container for cities searched
const jWhereWhen = $("#city-and-date");         // h3 with city name and date
const jCurrent = $("#current");                 // container for current conditions
const jForecast = $("#five-day");               // container for forecast cards
const jTempNow = $("#temp-now");                // container for current temp
const jWindNow = $("#wind-now");                // container for current wind speed
const jHumidityNow = $("#humidity-now");        // container for current humidity




// ---- INITIALIZATION ----

// put listeners on the search button and on a "return" keypress
jSearchBtn.on("click", function(e) {
    e.preventDefault();
    searchSetup();
});
jCityInput.on("keyup", function(e) {
    e.preventDefault();
    if(e.keyCode == 13) searchSetup();
})



// ---- FUNCTION DECLARATIONS ----


function searchSetup() {
    // This function validates and then submits the input field

    let testVal = jCityInput.val();
    // check against a potential list of conditions where validation fails
    let noGood = (
        testVal == "" ||
        testVal.trim() == ""
    )
    // if validated, send the contents on to the search...
    if (!noGood) searchStart(testVal);
    // ...and if not then return
    return false;
}


function searchStart(city) {
    // This function queries the API for latitude and longitude
    // parameter "city" is the city to search on

    let latlonString;
    // construct the query out of saved pieces
    let query=latlonAPIstart + city + APIlimit + APIkey;
    fetch(query)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            // parameter "data" is the returned array

            // if nothing is returned, leave
            if(data.length==0) return;
            // if something is returned, construct string out of first one
            latlonString = "lat=" + data[0].lat + "&lon=" + data[0].lon;
            // clear out the existing forecast cards
            jForecast.empty();
            // kick off both queries
            getToday(latlonString);
            getForecast(latlonString);
            // clear the input field
            jCityInput.val("");
        })
        .catch(function(err) {
            console.log(err);
        })
}


function getToday(latlon) {
    // This function gets today's forecast and constructs that section
    // parameter "latlon" is the latitude and longitude query string

    let query = todayAPIstart + latlon + APIunits + APIkey;
    fetch(query)
        .then(function(response) {
            return(response.json());
        })
        .then(function(data) {
            // parameter "data" is the returned object
            
            // construct the day and time string
            let dDateTime = dayjs((data.dt + data.timezone)*1000).utc().format("ddd, MMM DD, h:mm A");
        
            // is the sun up?
            let daytime = (data.dt > data.sys.sunrise) && (data.dt < data.sys.sunset);

            // set the correct style for the main headline
            setConditions(daytime, data.weather[0].id);
            
            // put the city name into the headline
            jWhereWhen.text(data.name);
            // create the time indicator and attach it
            let jNewSpan = $("<span>");
            jNewSpan.text((" (" + dDateTime + ")"))
            jWhereWhen.append(jNewSpan);
            // fill in the temp, wind and humidity
            jTempNow.text("Temp: " + data.main.temp + "°F");
            jWindNow.text("Wind: " + data.wind.speed + " MPH");
            jHumidityNow.text("Humidity: " + data.main.humidity + "%");
            // now add the icon
            let imgURL = "http://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
            let jIcon = $("<img>");
            jIcon.attr("src", imgURL);
            jWhereWhen.append(jIcon);
        })
}


function getForecast(latlon) {
    // This function gets the 5-day forecast and constructs that section
    // parameter "latlon" is the latitude and longitude query string

    let query = forecastAPIstart + latlon + APIunits + APIkey;
    fetch(query)
        .then(function(response) {
            return(response.json());
        })
        .then(function(data) {
            // parameter "data" is the returned object
                
            // we need to figure out the highs and lows for each day
            let dayData = {};
            // first create an empty object
            for (let i=0; i<5; i++) {
                // creating an object with an index of a date string
                dayData[dayjs().add(i, 'day').format('M/D/YYYY')] = {
                    hightemp: 0,
                    lowtemp: 999,
                    highwind: 0,
                    highhumidity: 0
                };
            }
            // now we iterate over everything
            let index, item, record = {};
            for(let i=0; i<data.list.length; i++) {
                // "item" is the next object in the data
                item = data.list[i];
                if(dayData[dayjs(item.dt*1000).format('M/D/YYYY')]) {
                    // if an object of this date index exists on our tracker...
                    // "record" is this date's object
                    record = dayData[dayjs(item.dt*1000).format('M/D/YYYY')];
                    // compare each value to the "item" value and update if called for
                    record.hightemp = Math.max(record.hightemp, item.main.temp_max);
                    record.lowtemp = Math.min(record.lowtemp, item.main.temp_min);
                    record.highwind = Math.max(record.highwind, item.wind.speed);
                    record.highhumidity = Math.max(record.highhumidity, item.main.humidity);
                }
            }

            let jCard, jDay, jConditions, jTemp, jWind, jHumidity;
            // now turn our data into an array, and iterate, creating forecast cards
            Object.entries(dayData).forEach(function(thisDay) {
                // parameter "thisDay" is the object with this day's data

                // create the main card and append it
                jCard = $("<div>");
                jCard.addClass("card p-0 me-1 col");
                jForecast.append(jCard);
                // create the title with the date and append it
                jDay = $("<h4>");
                jDay.text(thisDay[0]);
                jDay.addClass("card-header fs-6 fw-bold text-white bg-secondary");
                jCard.append(jDay);
                // create the ul to hold the various conditions and append it
                jConditions = $("<ul>");
                jConditions.addClass("list-group list-group-flush");
                jCard.append(jConditions);
                // create the temperature range and append it
                jTemp = $("<li>");
                jTemp.addClass("list-group-item");
                jTemp.text("Temp: " + Math.round(thisDay[1].lowtemp) + " - " + Math.round(thisDay[1].hightemp) + "°F");
                jConditions.append(jTemp);
                // create the high windspeed and append it
                jWind = $("<li>");
                jWind.addClass("list-group-item");
                jWind.text("Wind: " + Math.round(thisDay[1].highwind) + " MPH");
                jConditions.append(jWind);
                // create the high humidity and apped it
                jHumidity = $("<li>");
                jHumidity.addClass("list-group-item");
                jHumidity.text("Humidity: " + thisDay[1].highhumidity + "%");
                jConditions.append(jHumidity);
            });

        })
}


function setConditions(daytime, code) {
    // This function applies a class to the main card header
    // parameter "daytime" is a boolean: is it daytime?
    // parameter "code" is the weather code returned by OpenWeatnerMaps

    let conditions;
    // start with a check of nighttime or daytime and default to overcast
    conditions = daytime?"overcast":"nighttime";
    // if it's daytime and the codes are right, switch to sunny
    if ( daytime && (code >= 800) && (code <= 802) ) conditions = "sunny";

    // now toggle the right classes
    jWhereWhen.toggleClass("nighttime", (conditions == "nighttime"));
    jWhereWhen.toggleClass("sunny", (conditions == "sunny"));
    jWhereWhen.toggleClass("overcast", (conditions == "overcast"));
}


// ---- END FUNCTION DECLARATIONS ----
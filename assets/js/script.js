dayjs.extend(window.dayjs_plugin_utc);

// GLOBAL DECLARATIONS

// Pieces of API calls for reference
const onecallAPIstart = "https://api.openweathermap.org/data/3.0/onecall?";
const latlonAPIstart = "https://api.openweathermap.org/geo/1.0/direct?q=";
const APIlimit = "&limit=5";
const APIunits = "&units=imperial";
const APIexclude = "&exclude=minutely,hourly,alerts";
const APIkey = "&appid=7897ccda0965301a098fbfd75fe1b4aa";

// Various DOM elements
const jSearchBtn = $("#search-button");             // search button
const jSearchClrBtn = $("#clear-saved-searches");   // clear saved searches button
const jCityInput = $("#city-input");                // input field for city search
const jSearchList = $("#previous-searches");        // ul container for cities searched
const jWhereWhen = $("#city-and-date");             // h3 with city name and date
const jCurrent = $("#current");                     // container for current conditions
const jForecast = $("#five-day");                   // container for forecast cards
const jTempNow = $("#temp-now");                    // container for current temp
const jWindNow = $("#wind-now");                    // container for current wind speed
const jHumidityNow = $("#humidity-now");            // container for current humidity




// ---- INITIALIZATION ----

initialize();




// ---- FUNCTION DECLARATIONS ----


function initialize() {
    // This function does all some page setup tasks

    // add some listeners

    jSearchBtn.on("click", function(e) {
        // this listener is on the search button
        e.preventDefault();
        searchSetup();
    });
    jCityInput.on("keyup", function(e) {
        // this listener is for pressing return in the search
        e.preventDefault();
        if(e.keyCode == 13) searchSetup();
    });
    jSearchList.on("click", "a", function(e) {
        // this listener is for clicking a saved search
        e.preventDefault();
        let latlon = e.target.dataset.sendto;
        let city = e.target.textContent;
        let country = e.target.dataset.co;
        // empty the forecast cards
        jForecast.empty();
        // skip the search setup and go right to the data call
        getOneCall(latlon, city, country);
    });
    jSearchClrBtn.on("click", function(e) {
        // this listener is on the clear saved button
        e.preventDefault();
        clearSavedSearches();
    });

    drawSavedSearches();
}


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
            console.log(data);
            // make sure first letter is capitalized
            let cityCap = capitalize(city);
            // if US, add the state abbreviation
            if ( data[0].country == "US" && states[data[0].state.replace(/\s/g,"").toLowerCase()] ) {
                cityCap += ", ";
                cityCap += states[data[0].state.replace(/\s/g,"").toLowerCase()];
            }
            else if ( countries[data[0].country] ) {
                cityCap += ", ";
                cityCap += countries[data[0].country];
            }
            // if something is returned, construct string out of first one
            latlonString = "lat=" + data[0].lat + "&lon=" + data[0].lon;
            // clear out the existing forecast cards
            jForecast.empty();
            // query the weather data
            getOneCall(latlonString, cityCap, data[0].country);
            // clear the input field
            jCityInput.val("");
            // save the search
            saveSearch(cityCap,latlonString, data[0].country);
        })
        .catch(function(err) {
            console.log(err);
        })
}


function getOneCall(latlon, name, country) {
    // This function makes the main data call for the weather
    // parameter "latlon" is the latitude and longitude query strong
    // parameter "name" is the name of the city
    // parameter "country" is the two-letter country code

    let query = onecallAPIstart + latlon + APIunits + APIexclude + APIkey;
    // do the fetch
    fetch(query)
        .then(function(response) {
            return(response.json());
        })
        .then(function(data) {
            // parameter "data" is the returned object
            drawToday(data.current, data.timezone_offset, name, country);
            drawForecast(data.daily, data.timezone_offset);
        })
        .catch(function(err) {
            console.log(err);
        })
}


function drawToday(current, offset, city, country) {
    // This function renders the current weather conditions
    // parameter "current" is the current weather object
    // parameter "offset" is the time zone offset
    // parameter "city" is the city name
    // parameter "country" is the country code

    // construct the day and time string
    let dDateTime = dayjs((current.dt + offset)*1000).utc().format("ddd, MMM DD, h:mm A");
    // is the sun up?
    let daytime = (current.dt > current.sunrise) && (current.dt < current.sunset);
    // set the correct style for the main headline
    setConditions(daytime, current.weather[0].id, jWhereWhen);
    // put the city name into the headline
    jWhereWhen.text(city);
    // create the time indicator and attach it
    let jNewSpan = $("<span>");
    jNewSpan.text((" (" + dDateTime + ")"))
    jWhereWhen.append(jNewSpan);
    // fill in the temp, wind and humidity
    jTempNow.text("Temp: " + current.temp + "°F");
    jWindNow.text("Wind: " + current.wind_speed + " MPH");
    jHumidityNow.text("Humidity: " + current.humidity + "%");
    // now add the icon
    let imgURL = "https://openweathermap.org/img/wn/" + current.weather[0].icon + ".png";
    let jIcon = $("<img>");
    jIcon.attr("src", imgURL);
    jWhereWhen.append(jIcon);
}


function drawForecast(daily, offset) {
    // This function renders the 5-day forecast
    // parameter "daily" is the daily weather array
    // parameter "offset" is the time zone offset
    
    // First empty the container
    jForecast.empty();

    let thisDay, jCard, jDay, jConditions, jTemp, jWind, jHumidity, jIcon, imgURL;
    // iterate over the array, creating forecast cards
    for (let i = 0; i < 5; i++ ) {
        // variable "thisDay" is the object with this day's data
        thisDay = daily[i]
        dDate = dayjs((thisDay.dt + offset)*1000).utc().format("ddd, MMM DD");
        // create the main card and append it
        jCard = $("<div>");
        jCard.addClass("card p-0 me-1 col");
        jForecast.append(jCard);
        // create the title with the date and append it
        jDay = $("<h4>");
        jDay.text(dDate);
        jDay.addClass("card-header fs-6 fw-bold");
        setConditions(true, thisDay.weather[0].id, jDay);
        jCard.append(jDay);
        // create the ul to hold the various conditions and append it
        jConditions = $("<ul>");
        jConditions.addClass("list-group list-group-flush");
        jCard.append(jConditions);
        // create the temperature range and append it
        jTemp = $("<li>");
        jTemp.addClass("list-group-item pe-5");
        jTemp.text("Temp: " + Math.round(thisDay.temp.min) + " - " + Math.round(thisDay.temp.max) + "°F");
        jConditions.append(jTemp);
        // create the high windspeed and append it
        jWind = $("<li>");
        jWind.addClass("list-group-item");
        jWind.text("Wind: " + Math.round(thisDay.wind_speed) + " MPH");
        jConditions.append(jWind);
        // create the high humidity and append it
        jHumidity = $("<li>");
        jHumidity.addClass("list-group-item");
        jHumidity.text("Humidity: " + thisDay.humidity + "%");
        jConditions.append(jHumidity);
        // create an icon and append it
        imgURL = "https://openweathermap.org/img/wn/" + thisDay.weather[0].icon + ".png";
        jIcon = $("<img>");
        jIcon.attr("src", imgURL);
        jTemp.append(jIcon);
       
    }
}


function drawSavedSearches() {
    // This function renders the saved search buttons

    // clear out the area just in case
    jSearchList.empty();
    // grab the stored data
    let rawSaved = localStorage.getItem("savedWeather");
    let savedArray = [], jNextLink;
    if (rawSaved) {
        // if there is any data, parse it
        savedArray = JSON.parse(rawSaved);
        // iterate over the array, create the buttons
        for ( let i = 0; i < savedArray.length; i++ ) {
            jNextLink = $("<a>");
            jNextLink.attr("href", "#");
            // save the lat/lon search string as an attribute
            jNextLink.attr("data-sendto", savedArray[i].location);
            jNextLink.attr("data-co", savedArray[i].country);
            jNextLink.text(savedArray[i].city);
            jNextLink.addClass("list-group-item");
            jSearchList.append(jNextLink);
        }
    }
}


function clearSavedSearches() {
    // This function erases all the saved searches

    // first clear the existing area
    jSearchList.empty();
    // now empty the local storage
    localStorage.setItem("savedWeather", "");
}


function setConditions(daytime, code, container) {
    // This function applies a class to the main card header
    // parameter "daytime" is a boolean: is it daytime?
    // parameter "code" is the weather code returned by OpenWeatnerMaps
    // parameter "container" is where the style is being applied

    let conditions;
    // start with a check of nighttime or daytime and default to overcast
    conditions = daytime?"overcast":"nighttime";
    // if it's daytime and the codes are right, switch to sunny
    if ( daytime && (code >= 800) && (code <= 802) ) conditions = "sunny";

    // now toggle the right classes
    container.toggleClass("nighttime", (conditions == "nighttime"));
    container.toggleClass("sunny", (conditions == "sunny"));
    container.toggleClass("overcast", (conditions == "overcast"));
}


function saveSearch(term, coordinates, co) {
    // This function saves a search
    // parameter "term" is the text that was entered
    // parameter "coordinates" is the latitude and longitude string

    // first extract the already-saved searches
    let searchArray = []
    let savedSearches = localStorage.getItem("savedWeather");
    if (savedSearches) searchArray = JSON.parse(savedSearches);

    // if this search has already been saved, amscray
    if (alreadySaved(term, searchArray)) return;

    // first we append the button
    let jNewSearch = $("<a>");
    jNewSearch.addClass("list-group-item");
    jNewSearch.text(term);
    jNewSearch.attr("data-sendto", ("&" + coordinates));
    jNewSearch.attr("data-co", co);
    jSearchList.prepend(jNewSearch);

    // now let's save to local storage
    // now push a new object on, and re-save
    searchArray.unshift({ city: term, location: ("&" + coordinates), country: co });
    localStorage.setItem("savedWeather", JSON.stringify(searchArray));

    function alreadySaved(lookFor, lookIn) {
        // This utility returns whether the search has been saved before
        // parameter "lookFor" is what we're looking for
        // parameter "lookIn" is where we're looking

        for ( let i = 0; i < lookIn.length; i++ ) {
            // so is THIS one it?
            if ( lookIn[i].city == lookFor ) return true;
        }

        // we didn't find it
        return false;
    }
}


function capitalize(str) {
    // This function capitalizes the first letter of each word

    // split the string into words
    let pieces = str.toLowerCase().split(" ");
    // now iterate and capitalize the first letter of each
    for ( let i = 0; i < pieces.length; i++ ) {
        // only cap word if it's either the first word or not on the no-cap list
        if ( i == 0 || !noCap[pieces[i]] ) pieces[i] = ( pieces[i].charAt(0).toUpperCase() + pieces[i].substring(1));
    }
    return pieces.join(" ");
}

// ---- END FUNCTION DECLARATIONS ----
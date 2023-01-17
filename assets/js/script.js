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
const jForecast = $("#five-day");               // container for forecast cards
const jTempNow = $("#temp-now");
const jWindNow = $("#wind-now");
const jHumidityNow = $("#humidity-now");



// for testing
const jAPIreturn = $("#api-return");

let citystate;

let latlon = "test";

jSearchBtn.on("click", function() {
    if(jCityInput.val() == "") return;
    else {
    //    console.log(jWhereWhen.text());
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
     //   console.log(data);
        fetch((forecastAPIstart + latlon + "&units=imperial" + APIlimit + APIkey))
        .then(function(response) {
            return(response.json());
        })
        .then(function(data) {
            console.log(data);
            
            let dt = dayjs((data.dt + data.timezone)*1000).utc().format("ddd, MMM DD, h:mm A");
            let dtrise = dayjs((data.sys.sunrise + data.timezone)*1000).utc().format("ddd MMM D YYYY h:mm A");
            let dtset = dayjs((data.sys.sunset + data.timezone)*1000).utc().format("ddd MMM D YYYY h:mm A");

            console.log("It is now " + dt + " local time");
            console.log("Sunrise is " + dtrise);
            console.log("Sunset is " + dtset);
            let daytime = (data.dt > data.sys.sunrise) && (data.dt < data.sys.sunset);
            console.log("It is currently " + (daytime?"daytime":"nighttime"));

            let background = "overcast";
            if (!daytime) background = "nighttime";
            else if ( data.weather[0].id >= 800 && data.weather[0].id <= 802 ) background = "sunny";

            console.log(background);
            console.log(data.weather[0].id);

            jWhereWhen.toggleClass("nighttime", (background=="nighttime"));
            jWhereWhen.toggleClass("sunny", (background=="sunny"));
            jWhereWhen.toggleClass("overcast", (background=="overcast"));

            let jNewSpan = $("<span>");
            jNewSpan.text((" (" + dt + ")"))
            jWhereWhen.text(data.name);
            jWhereWhen.append(jNewSpan);

            jTempNow.text("Temp: " + data.main.temp + "°F");
            jWindNow.text("Wind: " + data.wind.speed + " MPH");
            jHumidityNow.text("Humidity: " + data.main.humidity + "%");

            let imgURL = "http://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
            let icon = $("<img>");
            icon.attr("src", imgURL);
            jWhereWhen.append(icon);
        })
        return latlon;
    })
    .then(function(latlon) {
        fetch("http://api.openweathermap.org/data/2.5/forecast?"+latlon+"&units=imperial"+APIkey)
            .then(function(response) {
                return(response.json());
            })
            .then(function(data) {
                
                let dayData = {};

             //   console.log(data);
                
                for (let i=0; i<5; i++) {
                    dayData[dayjs().add(i, 'day').format('M/D/YYYY')] = {
                        hightemp: 0,
                        lowtemp: 999,
                        highwind: 0,
                        highhumidity: 0
                    };
                }
            
                let index, item, record = {};
                for(let i=0; i<data.list.length; i++) {
                    item = data.list[i];
                    if(dayData[dayjs(item.dt*1000).format('M/D/YYYY')]) {
                        record = dayData[dayjs(item.dt*1000).format('M/D/YYYY')];
                        record.hightemp = Math.max(record.hightemp, item.main.temp_max);
                        record.lowtemp = Math.min(record.lowtemp, item.main.temp_min);
                        record.highwind = Math.max(record.highwind, item.wind.speed);
                        record.highhumidity = Math.max(record.highhumidity, item.main.humidity);
                    }
                }

                jForecast.empty();
                let card, day, conditions, temp, wind, humidity;

                Object.entries(dayData).forEach(function(thisDay) {
                    card = $("<div>");
                    card.addClass("card p-0 me-1 col");
                    jForecast.append(card);
                    day = $("<h4>");
                    day.text(thisDay[0]);
                    day.addClass("card-header fs-6 fw-bold text-white bg-secondary");
                    card.append(day);

                    conditions = $("<ul>");
                    conditions.addClass("list-group list-group-flush");
                    card.append(conditions);

                    temp = $("<li>");
                    temp.addClass("list-group-item");
                    temp.text("Temp: " + Math.round(thisDay[1].lowtemp) + " - " + Math.round(thisDay[1].hightemp) + "°F");
                    conditions.append(temp);

                    wind = $("<li>");
                    wind.addClass("list-group-item");
                    wind.text("Wind: " + Math.round(thisDay[1].highwind) + " MPH");
                    conditions.append(wind);

                    humidity = $("<li>");
                    humidity.addClass("list-group-item");
                    humidity.text("Humidity: " + thisDay[1].highhumidity + "%");
                    conditions.append(humidity);
                });

                })
            })
        }
   
    
    


// ---- FUNCTION EXPRESSIONS ----

// ---- END FUNCTION EXPRESSIONS ----





// ---- FUNCTION DECLARATIONS ----

// ---- END FUNCTION DECLARATIONS ----
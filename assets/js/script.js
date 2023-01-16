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



// for testing
const jAPIreturn = $("#api-return");

let citystate;

let latlon = "test";

jSearchBtn.on("click", function() {
    if(jCityInput.val() == "") return;
    else {
        jWhereWhen.empty();
    //    console.log(jWhereWhen.text());
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
     //   console.log(data);
        fetch((forecastAPIstart + latlon + "&units=imperial" + APIlimit + APIkey))
        .then(function(response) {
            return(response.json());
        })
        .then(function(data) {
         //   console.log(data);
            let dt = dayjs(data.dt*1000).format("ddd, MMM DD, h:mm A");
            let jNewSpan = $("<span>");
            jNewSpan.text((" (" + dt + ")"))
            jWhereWhen.text(data.name);
      //      console.log(jWhereWhen.text());
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

            let imgURL = "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
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
                    card.addClass("card col-2");
                    jForecast.append(card);
                    day = $("<h3>");
                    day.text(thisDay[0]);
                    day.addClass("card-header");
                    card.append(day);

                    temp = $("<p>");
                    temp.addClass("card-body");
                    temp.text("Temp: " + thisDay[1].lowtemp + " - " + thisDay[1].hightemp + "°F");
                    card.append(temp);

                    wind = $("<p>");
                    wind.addClass("card-body");
                    wind.text("Wind: " + thisDay[1].highwind + " MPH");
                    card.append(wind);

                    humidity = $("<p>");
                    humidity.addClass("card-body");
                    humidity.text("Humidity: " + thisDay[1].highhumidity + "%");
                    card.append(humidity);
                });

                })
            })
        }
   
    
    


// ---- FUNCTION EXPRESSIONS ----

// ---- END FUNCTION EXPRESSIONS ----





// ---- FUNCTION DECLARATIONS ----

// ---- END FUNCTION DECLARATIONS ----
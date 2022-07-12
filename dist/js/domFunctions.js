//per la funzione setPlaceHolderText
// Qui guarderemo alla larghezza della finestra e in base a questo 

// definiamo il placeholder text. Si puo fare anche con CSS. Laghezza minore 400 = quel testo. Altrimenti, l'altro.
export const setPlaceholderText = () => {
  const input = document.getElementById("searchBar__text");
  window.innerWidth < 400
    ? (input.placeholder = "City, State, Country")
    : (input.placeholder = "City, State, Country, or Zip Code");
};

// Per creare funzione che anima lo spinner quando clicco sul pulsante di geolocalizzazione
export const addSpinner = (element) => {
  animateButton(element);
  setTimeout(animateButton, 1000, element);
};

// dichiaro una helper function. Non chiaro 2:07:00
// ho rimosso riga     element.nextElementSibling.classList.toggle("block"); altrimenti non andava
const animateButton = (element) => {
  element.classList.toggle("none");
  element.nextElementSibling.classList.toggle("block");
  element.nextElementSibling.classList.toggle("none");
};

//   richiamo la funzione displayError in main, queste sono helper functions
export const displayError = (headerMsg, srMsg) => {
  updateWeatherLocationHeader(headerMsg);
  updateScreenReaderConfirmation(srMsg);
};

  //   richiamo la funzione displayApiError in main, e sotto le helper functions
export const displayApiError = (statusCode) => {
  const properMsg = toProperCase(statusCode.message);
  updateWeatherLocationHeader(properMsg);
  updateScreenReaderConfirmation(`${properMsg}. Please try again.`);
};

  //proper case = ogni parola inizia con la maiuscola
  //words è un array di parole
const toProperCase = (text) => {
  const words = text.split(" ");
  const properWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return properWords.join(" ");
};


// creo i messaggi che devono uscire nel caso si verifichi questo errore
const updateWeatherLocationHeader = (message) => {
  const h1 = document.getElementById("currentForecast__location");
  // significa che non trova lat e lon se l'index è -1. Se non -1 invece esiste.
  //questo perche potrebbe essere un nome di città dove non sono visualizzati lat e lon
  //quindi formatto questo solo se lat e lon esistono nel messaggio che è passato come un parametro.
  if (message.indexOf("Lat:") !== -1 && message.indexOf("Long:") !== -1) {
    //una volta confermato che esistono, definisco un parametro che mi divide ogni spazio nel messaggio che abbiamo ricevuto come parametro
    //e questo split method crea un array 
    const msgArray = message.split(" ");
    
    //Questo è per rimuovere alcune cifre decimali di lat e lon, che sono troppe.
    //qui abbiamo il message array che chiama the higher order function map che crea un nuovo array,
    //e prenderà ogni messaggio/elemento fintanto chè è definito. Cosi si crea un nuovo array, in return.
    const mapArray = msgArray.map((msg) => {
      return msg.replace(":", ": "); //rimpiazzeremo la colonna che viene dopo lat e lon, con una colonna e uno spazio. questo è per formattare
      //cioè, dopo lat e lon ci sono i : e uno spazio
    });

    //accorcio le coordinate. Cerchiamo il simbolo - , se non esiste (cioè -1), facciamo slice da 0 a 10. Questi SLICE tengono conto 
    // anche di tutti gli altri cartteri, come : , spazio, etc.
    //se invece c'è, togliamo  un extra carattere
    const lat =
      mapArray[0].indexOf("-") === -1
        ? mapArray[0].slice(0, 10)
        : mapArray[0].slice(0, 11);

    //qui è 11 e 12 perche "long"(4) ha un carattere in piu di "lat" (3)
    const lon =
      mapArray[1].indexOf("-") === -1
        ? mapArray[1].slice(0, 11)
        : mapArray[1].slice(0, 12);
      //• è un carattere speciale, bullet. Funge da divisorio nnella schermata Lat...• Lon...
      //quando lat e lon sono state formattate, le assegno all'h1
      h1.textContent = `${lat} • ${lon}`;
    } else {
      h1.textContent = message;
    }
  };


export const updateScreenReaderConfirmation = (message) => {
  document.getElementById("confirmation").textContent = message;
};

 /* la prima cosa che faremo in questa funzione è chiamare una 
helper function che aiuta a fade il display */
export const updateDisplay = (weatherJson, locationObj) => {
  fadeDisplay(); //1 nascondiamo l'area
  clearDisplay(); // 2 la puliamo
  const weatherClass = getWeatherClass(weatherJson.current.weather[0].icon);
  // 0 fa riferimento a prima posizione. Se apro l'api su firefox, è il percorso che segue, current-weather-0-icon(2d)
  setBGImage(weatherClass); //5- imposto lo sfondo in base alla condizione
  const screenReaderWeather = buildScreenReaderWeather( //la definisco tramite una helper function  buildScreenReaderWeather
  weatherJson,
  locationObj
);

updateScreenReaderConfirmation(screenReaderWeather);
updateWeatherLocationHeader(locationObj.getName()); //quando ho ottenut il nome della località, aggiorno l'header con la location
  //current conditions
  const ccArray = createCurrentConditionsDivs(
    weatherJson,
    locationObj.getUnit()
  );
  displayCurrentConditions(ccArray);
  displaySixDayForecast(weatherJson);
  setFocusOnSearch();
  fadeDisplay(); // 6- la faccio riapparire
};


//cioè: all'inizio della funzione esso nasconderà queste zone meteo con zero-vis( per nascondere le Current Conditions)
//mentre otteniamo i nuovi dati. Alla fine della funzione, richiamo 
//di nuovo fadeDisplay, ma per mostrare con fade-in.
const fadeDisplay = () => {
  const cc = document.getElementById("currentForecast");
  cc.classList.toggle("zero-vis");
  cc.classList.toggle("fade-in");

  //facciamo lo stesso per prevision 6 giorni
  const sixDay = document.getElementById("dailyForecast");
  sixDay.classList.toggle("zero-vis");
  sixDay.classList.toggle("fade-in");
};

const clearDisplay = () => {
  //si riferisce all'area o il div all'interno del currentForecast__conditions che ha il dynamic data
  const currentConditions = document.getElementById("currentForecast__conditions");  
  deleteContents(currentConditions); //cancello tutto quello nel div
  const sixDayForecast = document.getElementById("dailyForecast__contents");
  deleteContents(sixDayForecast); //cancello tutto quello nel div dei 6 giorni
};


const deleteContents = (parentElement) => {
  let child = parentElement.lastElementChild;
  //fin quando ci sara un altro elemento, child sarà sempre uguale 
  //all'ultimo elemento presente nel container che è stato alimentato o al parente
  // e continuerà ad eliminare gli elementi nel parente fino a quando non ci saranno piu elementi
  while (child) {
    parentElement.removeChild(child);
    child = parentElement.lastElementChild;
    }
};

const getWeatherClass = (icon) => {
  const firstTwoChars = icon.slice(0, 2);//prendiamo i primi due caratteri e l'ultimo
  const lastChar = icon.slice(2);
  const weatherLookup = { // usiamo un object lookup
    //queste sono informazioni tradottre dalla documentazione dell'api
    "09": "snow",
    10: "rain",
    11: "rain",
    13: "snow",
    50: "fog"
  };
  let weatherClass;
  if (weatherLookup[firstTwoChars]) {
  // passiamo i primi due caratteri e vediamo con cosa fanno match
  weatherClass = weatherLookup[firstTwoChars];
      } else if (lastChar === "d") {
  // d sta per day
    weatherClass == "clouds"; //perche non abbiamo trovato gli scenari, snow..rain..fog. QUindi usiamo clouds come backgruound di base per il giorno
  } else {
    weatherClass = "night";
    }
    return weatherClass;
  };

  const setBGImage = (weatherClass) => {
    document.documentElement.classList.add(weatherClass);
    document.documentElement.classList.forEach((img) => {
      if (img !== weatherClass) document.documentElement.classList.remove(img);
    });
  };
       //vogliamo che l'immagine sia applicata all'elemento html
       //se fa match con la classe meteo che abbiamo determinato.
       //nota: nel file scss abbiamo il partial che ha diversi nomi del meteo: rain,snow etc,
       //e queste sono le classi che sono aggiunte al root element e rimangono solo se 
       //uno dei nomi match la classe meteo


const buildScreenReaderWeather = (weatherJson, locationObj) => {
  const location = locationObj.getName();
  const unit = locationObj.getUnit();
  const tempUnit = unit === "imperial" ? "Fahrenheit" : "Celsius"; // if statement ternario
  return `${weatherJson.current.weather[0].description} and ${Math.round(
    Number(weatherJson.current.temp)
  )}°${tempUnit} in ${location}`;
};
  //description, es: cloudy
  //Number(weatherJson.current.temp): otteniamo il numero della temperatura


const setFocusOnSearch = () => {
  document.getElementById("searchBar__text").focus();
};

//andiamo a capire quale tipo di temperatura utilizzeremo
const createCurrentConditionsDivs = (weatherObj, unit) => {
  const tempUnit = unit === "imperial" ? "F" : "C";
  const windUnit = unit === "imperial" ? "mph" : "m/s";
  //per icon usiamo helper function
  const icon = createMainImgDiv(
    weatherObj.current.weather[0].icon,
    weatherObj.current.weather[0].description
  );

//inizio a creare i divs che si riferiscono alle funzioni dopo questa. Avrò tutti questi dati dall'api
  const temp = createElem(
    "div",
    "temp",
    `${Math.round(Number(weatherObj.current.temp))}°`,
    tempUnit
  );

  const properDesc = toProperCase(weatherObj.current.weather[0].description);
  const desc = createElem("div", "desc", properDesc);
  const feels = createElem(
    "div",
    "feels",
    `Feels Like ${Math.round(Number(weatherObj.current.feels_like))}°`
  );

  const maxTemp = createElem(
    "div",
    "maxtemp",
    `High ${Math.round(Number(weatherObj.daily[0].temp.max))}°`
  );
  const minTemp = createElem(
    "div",
    "mintemp",
    `Low ${Math.round(Number(weatherObj.daily[0].temp.min))}°`
  );
  const humidity = createElem(
    "div",
    "humidity",
    `Humidity ${weatherObj.current.humidity}%`
  );
  const wind = createElem(
    "div",
    "wind",
    `Wind ${Math.round(Number(weatherObj.current.wind_speed))} ${windUnit}`
  );
  return [icon, temp, desc, feels, maxTemp, minTemp, humidity, wind];
};

//creo funzione div per l'immagine princpale
const createMainImgDiv = (icon, altText) => {
  const iconDiv = createElem("div", "icon");
  iconDiv.id = "icon";
  const faIcon = translateIconToFontAwesome(icon);
  faIcon.ariaHidden = true;
  faIcon.title = altText;
  iconDiv.appendChild(faIcon);
  return iconDiv;
};

//riceverà diversi parametri /* divText= tetsto div*/
const createElem = (elemType, divClassName, divText, unit) => {
  const div = document.createElement(elemType);
  div.className = divClassName;
  if (divText) {
    div.textContent = divText;
  }
  if (divClassName === "temp") {
    const unitDiv = document.createElement("div");
    unitDiv.className = "unit";
    unitDiv.textContent = unit;
    div.appendChild(unitDiv); // we will append that unit div do to the temp, that's only if there's temperature
  }
  return div;
};

  //questa funzione (chiamata sopra), traduce le icone che sono suggerite da open weather api, tramite due caratteri 01..etc,
  // in icone simili da font awesome. 
  //4:00 per esempio: il sole sopra High, Low, uso un fontawesome, per match the font everywhere.
  //stiamo traducento i primi due caratteri che l'api openweather ci da per le loro icone 
  //e le traduco in icone fontawesome, perche a volte i colori e le icone dell'api sono diverse tra loro.

  const translateIconToFontAwesome = (icon) => {
    const i = document.createElement("i");
    const firstTwoChars = icon.slice(0, 2);
    const lastChar = icon.slice(2);
    switch (firstTwoChars) {
      case "01":
        if (lastChar === "d") {
          i.classList.add("far", "fa-sun");
        } else {
          i.classList.add("far", "fa-moon");
        }
        break;
      case "02":
        if (lastChar === "d") {
          i.classList.add("fas", "fa-cloud-sun");
        } else {
          i.classList.add("fas", "fa-cloud-moon");
        }
        break;
      case "03":
        i.classList.add("fas", "fa-cloud");
        break;
      case "04":
        i.classList.add("fas", "fa-cloud-meatball");
        break;
      case "09":
        i.classList.add("fas", "fa-cloud-rain");
        break;
      case "10":
        if (lastChar === "d") {
          i.classList.add("fas", "fa-cloud-sun-rain");
        } else {
          i.classList.add("fas", "fa-cloud-moon-rain");
        }
        break;
      case "11":
        i.classList.add("fas", "fa-poo-storm");
        break;
      case "13":
        i.classList.add("far", "fa-snowflake");
        break;
      case "50":
        i.classList.add("fas", "fa-smog");
        break;
      default:
        i.classList.add("far", "fa-question-circle");
    }
    return i;
  };

  const displayCurrentConditions = (currentConditionsArray) => {
    const ccContainer = document.getElementById("currentForecast__conditions");
    currentConditionsArray.forEach((cc) => {
      ccContainer.appendChild(cc);
    });
  };

//definisco il meteo di 6 giorni, verrà chiamato per ogni giorno 
  const displaySixDayForecast = (weatherJson) => {
    for (let i = 1; i <= 6; i++) {
      //df array = daily forecast
      //ci passiamo "i" dal loop for, in base al giorno che serve. 0 è il giorno attuale 
      const dfArray = createDailyForecastDivs(weatherJson.daily[i]);
      displayDailyForecast(dfArray);
    }
  };

// per visualizzare displaySixDayForecast
  const createDailyForecastDivs = (dayWeather) => {
    //getDayAbbreviation è una helper function. dayWeather è il parametro . 
    //DT è DA DEFINIRE,, CHIEDERE SU STACKOVER
    const dayAbbreviationText = getDayAbbreviation(dayWeather.dt);
    
    const dayAbbreviation = createElem(
      "p",
      "dayAbbreviation",
      dayAbbreviationText
    );

    //createDailyForecastIcon è una helper function
    const dayIcon = createDailyForecastIcon(
      dayWeather.weather[0].icon,
      dayWeather.weather[0].description
    );

    //massima e minima temperatura dei 6 giorni della settimana
    const dayHigh = createElem(
      "p",
      "dayHigh",
      `${Math.round(Number(dayWeather.temp.max))}°`
    );
    const dayLow = createElem(
      "p",
      "dayLow",
      `${Math.round(Number(dayWeather.temp.min))}°`
    );
    //ritorniamo un array con tutti questi elemnti
    return [dayAbbreviation, dayIcon, dayHigh, dayLow];
  };
  
  //per le abbreviazione di Sat, Sun, Mon, della settimana.
  const getDayAbbreviation = (data) => {
    const dateObj = new Date(data * 1000); //qui riceviamo i dati dall'api. 1000 è per una data accurata
    const utcString = dateObj.toUTCString();//oUTCString() method converts a date to a string
    return utcString.slice(0, 3).toUpperCase();
  };
  
  const createDailyForecastIcon = (icon, altText) => {
    const img = document.createElement("img");
    //verifichiamo la larghezza della pagina e decidiamo
    //in base alla dimensione delle icone che richiediamo dall'api
    //perche openweather api fornisce piu icone di diversa misura
    if (window.innerWidth < 768 || window.innerHeight < 1025) {
      img.src = `https://openweathermap.org/img/wn/${icon}.png`;
    } else { //se non corrisponde a questi < , allora, c'è questa icona piu grande
      img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    }
    img.alt = altText;
    return img;
  };
  
   //cosi riusciamo a vedere le previsioni giornaliere  sul fondo della pagina
   //nel div che abbiamo definito precedentemente che deve contenere 
  //  questo contenuto dinamico
  const displayDailyForecast = (dfArray) => {
    const dayDiv = createElem("div", "forecastDay");
    //el = element
    dfArray.forEach((el) => {
      dayDiv.appendChild(el);
    });
    const dailyForecastContainer = document.getElementById(
      "dailyForecast__contents"
    );
    dailyForecastContainer.appendChild(dayDiv);
  };
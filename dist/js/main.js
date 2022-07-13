// Si sfrutta l'API geolocalizzazione, https://w3c.github.io/geolocation-api/#dom-navigator-geolocation
// http://diveintohtml5.info/geolocation.html
// quindi: tutti quei comandi geolocation, geoError, geoSuccess, getCurrentPosition sono funzioni dell'api

// Importo CurrentLocation e definisco il nuovo oggetto
// con new,  che richiama le proprietà di "constructor" del file CurrentLocation
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new?retiredLocale=it

import {
    setLocationObject,
    getHomeLocation,
    getCoordsFromApi,
    getWeatherFromCoords,
    cleanText
  } from "./dataFunctions.js";

import {
    setPlaceholderText,
    addSpinner,
    displayError,
    displayApiError,
    updateScreenReaderConfirmation,
    updateDisplay
  } from "./domFunctions.js";


  import CurrentLocation from "./CurrentLocation.js";
  const currentLoc = new CurrentLocation();

// questo è per importare l'animazione dello spinner

// setLocationObject è per ottenere i dati di latitudine, longitudine etc. 
//getHomeLocation è per salvare la posizione



//definisco i pulsanti
const initApp = () => {
    // aggiungi listners

    //pulsante posizione
    const geoButton = document.getElementById("getLocation");
    geoButton.addEventListener("click", getGeoWeather);

    //pulsante home
    const homeButton = document.getElementById("home");
    homeButton.addEventListener("click", loadWeather); //loadWeather è la funzione che voglio chiamare appena l'applicazione si è caricata
   
    //definisco il pulsante Save
    const saveButton = document.getElementById("saveLocation");
    saveButton.addEventListener("click", saveLocation);

    //definisco il pulsante delle unità di misura
    const unitButton = document.getElementById("unit");
    unitButton.addEventListener("click", setUnitPref);

    //definisco il pulsante delle unità di misura
    const refreshButton = document.getElementById("refresh");
    refreshButton.addEventListener("click", refreshWeather);

    //definisco searchbar
    const locationEntry = document.getElementById("searchBar__form");
    locationEntry.addEventListener("submit", submitNewLocation);

    //set up
    setPlaceholderText();

    // carica meteo
    loadWeather();
};


// DOM: Definisce la struttura logica del documento e il modo in cui si può accedere e modificare il documento stesso
// DOMContentLoaded – il browser ha completamente caricato l’HTML, e l’albero del DOM è stato costruito, 
// ma risorse esterne come immagini <img> e i fogli di stile potrebbero ancora non essere stati caricati.
document.addEventListener("DOMContentLoaded", initApp);

// Qui faccio due cose: all'inizio sfrutto la funzione di localizzazione offerta dal pulsante creato da me e quindi
// aggiungo un eventListner (dopo, in geoButton nella funzione const initApp) che deve "sentire" il click sul pusalnte. 
// poi sfrutto anche la funzione di geolocalizzazione offerta dal browser, se le cose non vanno
const getGeoWeather = (event) => {
    if(event){

        // Creo a parte questa funzione in domFunctions, per fare in modo d'animare lo spinner quando clicco sulla posizione 
        // sopra, import la funzione.
        if (event.type === "click") {
            const mapIcon = document.querySelector(".fa-map-marker-alt");
            addSpinner(mapIcon);
        }
    }

// Utilizziamo due modi per verificare che sia supportato:
// 1) Se il navigator.geolocation non è supportato
// getCurrentPosition restituisce geoerror.
        if(!navigator.geolocation) geoError(); //navigator.geolocation: restituisce un oggetto Geolocation che consente di accedere alla posizione del dispositivo. https://developer.mozilla.org/en-US/docs/Web/API/Navigator
        navigator.geolocation.getCurrentPosition(geoSuccess,geoError);
    };


// 2) Usiamo un ternary statament: se abbiamo un error object( un errore)  
// e quindi navigator.geolocation non è supportato dal browser ci restituisce quel messaggio
// condition ? exprIfTrue : exprIfFalse
const geoError = (errObj) => {
    const errMsg = errObj ? errObj.message : "Geolocation not supported";
        displayError(errMsg, errMsg); //nel caso in cui l'utente non avesse consentito la geolocalizzazione sul browser 
        // poi esporto questa funzione  displayError nel domFunction dove 
        // creo i messaggi che devono uscire nel caso si verifichi questo errore. Poi lo aggiungo all'import affianco ad addSpinner
    };
   
// riceve un position object se va a buon fine    
const geoSuccess = (position) => {
    const myCoordsObj = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        name: `Lat:${position.coords.latitude} Long:${position.coords.longitude}`
      };

    // impostiamo l'oggetto location
    setLocationObject(currentLoc, myCoordsObj);
    // funzione per ottenre dati e aggiornarli sul display:
    updateDataAndDisplay(currentLoc);
};

// la prima cosa che farà questa funzione è cercare la posizione salvata
// che andiamo a ricercare tramite la funzione getHomeLocation che definiamo in datafunctions
const loadWeather = (event) => {
    const savedLocation = getHomeLocation();
    // se non abbiamo una posizione salvata e nessun evento passato (nessun pulsante cliccato)
    // restituisce getgeoweather che è il default quando carica all'applicazione la prima volta
    // (se la geolocalizzazione  è supportata)
    // . non c'è location salvata, nessun pulsante è stato cliccato
    if (!savedLocation && !event) return getGeoWeather();

    //se premo su location e poi home, appare questo messaggio perche non abbiamo premuto su Save che definiamo dopo
    if (!savedLocation && event.type === "click") {
        displayError(
          "No Home Location Saved.",
          "Sorry. Please save your home location first."
        );
        
        // Quando l'app è caricata e la posizione è stata salvata in passato, ma non c'è comunque nessun click
     } else if (savedLocation && !event) {
        displayHomeLocationWeather(savedLocation);     

        // Quando è premuto il pulsante e si aggiunge lo spinner al pulsante
        // e poi vediamo il meteo
    } else {
        const homeIcon = document.querySelector(".fa-home");
        addSpinner(homeIcon);
        displayHomeLocationWeather(savedLocation);
      }
    };

// verifichiamo di avere indietro una stringa, che otteniamo indietro dalla memoria locale
const displayHomeLocationWeather = (home) => {
    if (typeof home === "string") {
      const locationJson = JSON.parse(home);
      const myCoordsObj = {
        lat: locationJson.lat,
        lon: locationJson.lon,
        name: locationJson.name,
        unit: locationJson.unit
      };
      setLocationObject(currentLoc, myCoordsObj);
      updateDataAndDisplay(currentLoc);
    }
  };

//se abbiamo latitudine e longitudine nell'oggetto
//CurrentLoc , allora abbiamo le seguenti azioni
const saveLocation = () => {
    if (currentLoc.getLat() && currentLoc.getLon()) {
      const saveIcon = document.querySelector(".fa-save");
      addSpinner(saveIcon);
      const location = {
        name: currentLoc.getName(),
        lat: currentLoc.getLat(),
        lon: currentLoc.getLon(),
        unit: currentLoc.getUnit()
      };
        //lo salviamo nel nostro local storage
        localStorage.setItem("defaultWeatherLocation", JSON.stringify(location));
        updateScreenReaderConfirmation(
          `Saved ${currentLoc.getName()} as home location.`
        );
      }
    };

    const setUnitPref = () => {
        const unitIcon = document.querySelector(".fa-chart-bar");
        addSpinner(unitIcon);
        currentLoc.toggleUnit();
        updateDataAndDisplay(currentLoc);
      };

      const refreshWeather = () => {
        const refreshIcon = document.querySelector(".fa-sync-alt");
        addSpinner(refreshIcon);
        updateDataAndDisplay(currentLoc);
      };


// definisco la funzione per pulire gli spazi extra, che può essere il risultato di 
// un testo che ha una lunghezza di 0 o 2 spazi, o enter è premuto, o il pulsante è cliccato 
const submitNewLocation = async (event) => {
    event.preventDefault(); //per impedire che la pagina si aggiorni 
    const text = document.getElementById("searchBar__text").value;
    const entryText = cleanText(text);
    // se la lunghezza è false, cioè ha lunghezza 0 (del testo)
    // facciamo return e la funzione va avanti. Definiamo questa
    // funzione in dataFunctions tramite cleanText
    if (!entryText.length) return;

    // animo il pulsante
    const locationIcon = document.querySelector(".fa-search");
    addSpinner(locationIcon);
  
    // chiamo una funzione async , per chiamare la funzione coordinate
    const coordsData = await getCoordsFromApi(entryText, currentLoc.getUnit());    
    
    // lavoriamo con l'api data e faccio in modo che accada qualcosa se non ho i dati
    //se la funzione coordsData esiste, allora fai quello, altrimenti, errore perche non ha ricevuto data da api.
    // usiamo un metodo http che indica "success" tramite il valore 200
    if (coordsData) {
        if (coordsData.cod === 200) {
        //success
        //prima di guardare all'api per questa possibile informazione che torna indietro dalla funzione await, vado avanti
        // e definisco l'oggetto mycoordsobj, tramite ternary state, dove definisco da dove prendo questi dati, lat, lon sys. 
        //Lo scrivo cosi perche se vado sull'url api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=54ad6d3736f06a74a09574cce356089d 
        //su firefox, e vedo il file JSON, veedo coords:  e sys: , e il relativo lat e lon.
        const myCoordsObj = {
            lat: coordsData.coord.lat,
            lon: coordsData.coord.lon,
            name: coordsData.sys.country
              ? `${coordsData.name}, ${coordsData.sys.country}` //se è vero, cioè riceviamo dati di paese, creiamo un template literal
              : coordsData.name
          };

      setLocationObject(currentLoc, myCoordsObj);
      updateDataAndDisplay(currentLoc);
    } else {
      displayApiError(coordsData);
    }
// non abbiamo ricevuto nessuna informazione nel coordsdata dall'api.
// se invece abbiamo ricevuto l'informazione anche se c'è un errore, andiamo in displayApiError(coordsData) e visualizzare
// l'errore che c'è o andare avanti e lavorare con quei dati in const myCoordsObj = {}; setLocationObject(currentLoc, myCoordsObj);
    } else {
        displayError("Connection Error", "Connection Error");
    }
    };


    const updateDataAndDisplay = async (locationObj) => {
    const weatherJson = await getWeatherFromCoords(locationObj);
   // console.log(weatherJson);
    if(weatherJson) updateDisplay(weatherJson, locationObj);

};

//const WEATHER_API_KEY = "54ad6d3736f06a74a09574cce356089d"

export const setLocationObject = (locationObj, coordsObj) => {
  const { lat, lon, name, unit } = coordsObj;
  locationObj.setLat(lat);
  locationObj.setLon(lon);
  locationObj.setName(name);
  if (unit) {
    locationObj.setUnit(unit);
  }
};

export const getHomeLocation = () => {
  return localStorage.getItem("defaultWeatherLocation");
};

  //la rimpiazzerò con serverless functionality
  export const getWeatherFromCoords = async (locationObj) => {    
    /* const lat = locationObj.getLat();
    const lon = locationObj.getLon();
    const units = locationObj.getUnit();
    //Cioè qui uso la OPEN CALL API, l'endpoint finisce infatti con onecall. che chiama lon e lat, ed esclude alerts orari, minuti
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${WEATHER_API_KEY}`;    //in questo caso non dobbiamo codificare questo url perche lat e lon sono già fornite dall'url 
    //rimpiazzeremo questa funzione con una serverless che ci permetterà di nascondere l'api key
    try {
      const weatherStream = await fetch(url);
      const weatherJson = await weatherStream.json();
      return weatherJson;
    } catch (err) {
      console.error(err);
    }
  };  */

  const urlDataObj = {
    lat: locationObj.getLat(),
    lon: locationObj.getLon(),
    units: locationObj.getUnit()
  };
  try {
    const weatherStream = await fetch("./.netlify/functions/get_weather", {
      method: "POST",
      body: JSON.stringify(urlDataObj)
    });
    const weatherJson = await weatherStream.json();
    return weatherJson;
  } catch (err) {
    console.error(err);
  }
};
 

// definisco getCoordsFromApi per ottenere i dati dall'api
export const getCoordsFromApi = async (entryText, units) => {
  /*  // questo lo rimuoveremo perche questo verrà gestito da una funzione serverless.
    // ma per ora vediamo come funziona all'interno dell'app:
    // il regex cerca entrate che iniziano e finiscono con numeri  e,
    // tramite un ternary statment (true=zip, false = q),
    // assumiamo che questa richiesta è uno zip code (cioè un file che contiene tutti i dati e gli id) 
    // altrimenti è una singola query(q) che richiama una specifica informazione/id contenuta nello zip, che può essere un nome.
   // dichiarando flag < rivedere
    // https://helpcenter.woodwing.com/hc/en-us/articles/205654655-Elvis-5-REST-API-Zip-download
    const regex = /^\d+$/g;
    const flag = regex.test(entryText) ? "zip" : "q";    
    //qui ho già definito flag, units, entry, devo definire weatherapikey. Cioè qui uso la Current weather data API
    const url = `https://api.openweathermap.org/data/2.5/weather?${flag}=${entryText}&units=${units}&appid=${WEATHER_API_KEY}`;
    // dopo aver costruito l'url, con l'end point https://api.openweathermap.org/data/2.5/weather
    // dobbiamo codificare/riunire l'url, tramite encode che è una funzione interna di js,
    //questa serve per quei casi in cui potrei avere una parola o un termine che ha uno o piu spazzi
    //quindi  gli spazzi veranno codificati in %20, etc
    const encodedUrl = encodeURI(url);
    // definiaimo un catch block, dove noi ci connettiamo 
    //e otteniamo i dati dall'api. Guardare video su fetch e cath
    try {
      const dataStream = await fetch(encodedUrl);
      //aspettiamo che lo stream di dati venga convertito in json, con il metodo json, con il suo return
      const jsonData = await dataStream.json();
      return jsonData;
    } catch (err) {
      console.error(err.stack);
    }
};  */

const urlDataObj = {
  text: entryText,
  units: units
};
try {
  const dataStream = await fetch("./.netlify/functions/get_coords", {
    method: "POST",
    body: JSON.stringify(urlDataObj)
  });
  const jsonData = await dataStream.json();
  return jsonData;
} catch (err) {
  console.error(err);
}
};


// Per cancellare il campo di testo o rimuovere gli spazi
// prima e dopo il testo
export const cleanText = (text) => {
  const regex = / {2,}/g; //cioè cerca 2 o piu in una riga, g sta per global
  const entryText = text.replaceAll(regex, " ").trim();
     // cosi rimpiazzo 2 spazi con 1 spazio e con trim cancella l'inizio e la fine dalla stringa
     return entryText;
};
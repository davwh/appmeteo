// https://www.youtube.com/watch?v=HboT8g_QSGc

// Per esportare la classe nel file main.js
export default class CurrentLocation{
    constructor(){
        // Creo una funzione "constructor" che permette di creare un nuovo Oggetto che abbia le proprietà elencate sotto (name,lat,).
        // Lo scopo è di creare ogni volta un'istanza diversa dell'oggetto con diversi valori della proprietà (altrimenti 
        //     mi restituisce sempre lo stesso valore ogni volta che lo chiamo).
        // Uso _ per indicare che è una proprietà privata.
        // La proprietà dell'Oggetto/costruttore è CurrentLocation,imperial etc.
        this._name = "Current Location";
        this._lat = null;
        this._lon = null;
        this._unit = "imperial";
      }

      getName() {
        return this._name;
      }
    
      setName(name) {
        this._name = name;
      }
    
      getLat() {
        return this._lat;
      }
    
      setLat(lat) {
        this._lat = lat;
      }
    
      getLon() {
        return this._lon;
      }
    
      setLon(lon) {
        this._lon = lon;
      }
    
      getUnit() {
        return this._unit;
      }
    
      setUnit(unit) {
        this._unit = unit;
      }


    // per switchare le unità di misura
    toggleUnit() {
      this._unit = this._unit === "imperial" ? "metric" : "imperial";
    }
  }
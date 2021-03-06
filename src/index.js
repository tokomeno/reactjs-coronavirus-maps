import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Map as LeafletMap, GeoJSON, Marker, Popup } from 'react-leaflet';
import worldGeoJSON from 'geojson-world-map';
import './styles.css';
import countryCode from './countrycode-latlong';
import "leaflet/dist/leaflet.css";

import L from "leaflet";

// SVG to URL
const url = "data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='25' cy='25' r='24' fill='%23A90000' fill-opacity='0.7' stroke='%23A90000' stroke-width='2'/%3E%3C/svg%3E%0A";

const customMarker = (ratio) => new L.icon({
  iconUrl: url,
  iconSize: 10 * ratio,
  iconAnchor: [5 * ratio, 5 * ratio],
});

const axios = require('axios');

class App extends Component {
  constructor() {
    super();
    this.state = {
      selected: null,
      data: [],
      dataTotal: [],
      center: [0, 0],
      zoom: 3,
    };
  }

  getData() {

    // Cases by country
    axios.get("https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php", {
      "headers": {
        "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
        "x-rapidapi-key": "80e047913amsh644f35962c028e6p1aa841jsn7e10886a1614"
      }
    })
      .then(response => {
        this.setState({
          data: response.data.countries_stat
        })
      })
      .catch(err => {
        console.log(err);
      });

    // Stats panel
    axios.get("https://coronavirus-monitor.p.rapidapi.com/coronavirus/worldstat.php", {
      "headers": {
        "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
        "x-rapidapi-key": "80e047913amsh644f35962c028e6p1aa841jsn7e10886a1614"
      }
    })
      .then(response => {
        this.setState({
          dataTotal: response.data,
        })
      })
      .catch(err => {
        console.log(err);
      });
  }

  componentDidMount() {
    this.getData();
  }

  render() {
    return (
      <div>
        <LeafletMap
          center={[0, 0]}
          zoom={3}
          maxZoom={5}
          attributionControl={true}
          zoomControl={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          dragging={true}
          animate={true}
          easeLinearity={0.35}
          style={{
            height: "100vh",
            backgroundColor: "#01011a"
          }}
        >
          <GeoJSON
            data={worldGeoJSON}
            style={() => ({
              weight: 0.5,
              color: "#40403e",
              fillColor: "#2A2A28",
              fillOpacity: 1,
            })}
          />
          {this.state.data.map((value, index) => {
            let cases = value.cases.replace(/,/g, "");
            let cases_ratio = ((cases / 15000) + 1).toFixed(2);
            return (
              (countryCode.find((el) => el.name === value.country_name)) ?
                (<Marker key={index} position={
                  countryCode.find((el) => el.name === value.country_name) &&
                  countryCode.find((el) => el.name === value.country_name).latlng
                } icon={customMarker(cases_ratio)}>
                  <Popup className={'popup'} style={{ backgroundColor: "black" }}>
                    <h1>{value.country_name}</h1>
                    <p><b>Cases: </b> <span style={{ color: '#A90000' }}>{value.cases}</span></p>
                    <p><b>Today cases: </b> <span style={{ color: '#A90000' }}>{value.new_cases}</span></p>
                    <p><b>Recovered: </b> <span style={{ color: '#28a745' }}>{value.total_recovered}</span></p>
                    <p><b>Active: </b> <span style={{ color: '#ffc107' }}>{value.active_cases}</span></p>
                    <p><b>Deaths: </b> {value.deaths}</p>
                    <p><b>Today deaths: </b> {value.new_deaths}</p>
                    <p><b>Critical: </b> {value.serious_critical}</p>
                    <p><b>Per 1m: </b>{value.total_cases_per_1m_population}</p>
                  </Popup>
                </Marker>) :
                (console.log("Lat/Lng - Country not found : " + value.country_name))
            )
          })
          }
        </LeafletMap>
        <div className="info-box" id="total">
          <p><b>Total cases: </b><span style={{ color: '#A90000' }}>{this.state.dataTotal.total_cases}</span></p>
          <p><b>New cases: </b><span style={{ color: '#A90000' }}>{this.state.dataTotal.new_cases}</span></p>
          <p><b>Total recovered: </b><span style={{ color: '#28a745' }}>{this.state.dataTotal.total_recovered}</span></p>
          <p><b>Total deaths: </b><span>{this.state.dataTotal.total_deaths}</span></p>
          <p><b>New deaths: </b><span>{this.state.dataTotal.new_deaths}</span></p>
          <p><small>Developed by : <a href="https://github.com/fteichma/">Fabian Teichmann</a></small></p>
          <p><small>Data from <a href="https://coronavirus-monitor.p.rapidapi.com/">rapidapi</a> - I am not responsible for the veracity of the information provided</small></p>
        </div>
        <div id="gh">
          <p>
            <a href="https://github.com/fteichma/">
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt="Github - Logo" />
            </a>
          </p>
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
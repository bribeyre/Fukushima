import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import {ScaleLine,defaults as defaultControls} from 'ol/control.js';
import XYZ from 'ol/source/XYZ.js';
import {Image as ImageLayer} from 'ol/layer.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import {Vector as VectorSource} from 'ol/source.js';
import Overlay from 'ol/Overlay.js';
import {Icon, Style} from 'ol/style.js';
import { Circle as CircleStyle, Fill, Stroke, Text} from 'ol/style.js';
import {fromLonLat} from 'ol/proj.js';
import {Cluster} from 'ol/source.js';

let myChart;
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

const overlay = new Overlay({
	element: container,
	autoPan: {
		animation: {
			duration: 250,
		},
	},
});

/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function() {
	overlay.setPosition(undefined);
	closer.blur();
	return false;
};

const map = new Map({
	overlays: [overlay],
	target: 'map',

	layers: [
		new TileLayer({
			preload: Infinity,

			source: new XYZ({
				attributions: [
					'<a href="https://jawg.io?utm_medium=map&utm_source=attribution" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib" >&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a> | <a href="https://opendata.paris.fr/explore/dataset/velib-disponibilite-en-temps-reel/information/?disjunctive.name&disjunctive.is_installed&disjunctive.is_renting&disjunctive.is_returning&disjunctive.nom_arrondissement_communes" target="_blank">OpenData Paris</a> ',
				],
				url: 'https://tile.jawg.io/2dcec727-580f-4915-a903-5373db4d0b40/{z}/{x}/{y}.png?access-token=cHwHz2jFd1k6blmFA6wnYur05s8mCVw6336l2GHmEEAWqvCNZ0dfQMazW83EJUHw',
			}),
		}),
	],
	view: new View({
		center: [15800300, 4500000],
		projection: 'EPSG:3857',
		zoom: 5.5, // Niveau de zoom initial
	}),
});

let scaleLineControl = new ScaleLine({
	units: 'metric',
	minWidth: 65,
});

map.addControl(scaleLineControl);

let url = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/exports/geojson?lang=fr&timezone=Europe%2FBerlin";
fetch(url)
	.then(response => {
		return response.json()
	})
	.then(data => {
		let jsonData = JSON.stringify(data);
		localStorage.setItem('station_velo', jsonData)
	})

let jsonData = localStorage.getItem('station_velo');
let data = JSON.parse(jsonData);

let vectorSource = new VectorSource({
	format: new GeoJSON(),
	features: (new GeoJSON({
		dataProjection: 'EPSG:4326',
		featureProjection: 'EPSG:3857'
	})).readFeatures(data)
})
const piste_cyclable = new ImageLayer({
	source: new ImageWMS({
		url: 'http://localhost:8080/geoserver/OL/wms?service=WMS&version=1.1.0&request=GetMap',
		params: {
			'LAYERS': 'OL:Pistes_cyclables'
		},
		ratio: 1,
		serverType: 'geoserver',
	}),
});

const japon = new VectorLayer({
	source: new VectorSource({
		url: 'json/Dept_nom_jap.json',
		format: new GeoJSON()
	}),
});

const fuku = new VectorLayer({
	source: new VectorSource({
		url: 'json/Dept_Fuku.json',
		format: new GeoJSON()
	}),
});

const busStyle = new Style({
	image: new Icon({
		src: 'img/bus.png',
		scale: .15
	}),
});

let layers = {
    "Dept_nom_jap": japon,
}


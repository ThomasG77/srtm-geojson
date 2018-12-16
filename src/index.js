import 'ol/ol.css';
import './main.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import {Fill, Stroke, Style} from 'ol/style';
import {unByKey} from 'ol/Observable';

var vectorSource = new VectorSource({
  url: 'data/srtm_1arc_hgt_zip.geojson',
  format: new GeoJSON()
});

var vectorLayer = new VectorLayer({
  source: vectorSource,
  renderMode: 'image',
  style:  new Style({
    fill: new Fill({
      color: [255, 255, 255, 0.0]
    }),
    stroke: new Stroke({
      color: '#D24D57',
      width: 1
    })
  })
});

var view = new View({
  center: [10, -40],
  zoom: 3,
  maxZoom: 10
});

var map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new XYZ({
        url: 'http://{a-c}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'//'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      })
    })
  ],
  view: view
});

map.addLayer(vectorLayer);

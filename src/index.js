import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';

var vectorLayer = new VectorLayer({
  source: new VectorSource({
    url: 'data/srtm_1arc_hgt_zip.geojson',
    format: new GeoJSON()
  }),
  renderMode: 'image'
  // ,style: function(feature) {
  //   style.getText().setText(feature.get('name'));
  //   return style;
  // }
});

new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new XYZ({
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      })
    }),
    vectorLayer
  ],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});

import 'leaflet/dist/leaflet.css';
import './style.css';
import { createMap } from './map/createMap';

const mapElement = document.querySelector<HTMLElement>('#map');
const statusElement = document.querySelector<HTMLElement>('#map-status');
const resetButton = document.querySelector<HTMLButtonElement>('#reset-map');

if (!mapElement || !statusElement || !resetButton) {
  throw new Error('Sidans kartbehållare, status eller knapp saknas.');
}

const { resetView } = createMap(mapElement, statusElement);
resetButton.addEventListener('click', resetView);

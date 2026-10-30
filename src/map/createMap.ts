import { latLngBounds, map, tileLayer } from 'leaflet';
import { swedenInitialBounds } from '../config/mapConfig';

export function createMap(container: HTMLElement, status: HTMLElement) {
  const swedenBounds = latLngBounds(swedenInitialBounds);
  const leafletMap = map(container, { scrollWheelZoom: true });
  const resetView = () => leafletMap.fitBounds(swedenBounds, { padding: [16, 16] });
  resetView();

  const background = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });

  let hasTileError = false;
  background.on('loading', () => {
    hasTileError = false;
    status.textContent = 'Laddar bakgrundskartan…';
  });
  background.on('tileerror', () => {
    hasTileError = true;
    status.textContent = 'Delar av bakgrundskartan kunde inte hämtas. Kontrollera internetanslutningen och försök ladda om sidan.';
  });
  background.on('load', () => {
    if (!hasTileError) status.textContent = 'Bakgrundskartan är laddad.';
  });
  background.addTo(leafletMap);

  const resizeObserver = new ResizeObserver(() => leafletMap.invalidateSize());
  resizeObserver.observe(container);

  return { resetView };
}

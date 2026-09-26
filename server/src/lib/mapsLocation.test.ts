import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  extractCoordinatesFromMapsUrl,
  extractGeocodeQueryFromMapsUrl,
  isAllowedMapsUrl,
  isValidCoordinates,
} from './mapsLocation.ts';

describe('maps location parsing', () => {
  it('extracts coordinates from a standard Google Maps URL', () => {
    const coords = extractCoordinatesFromMapsUrl('https://www.google.com/maps/@36.8065,10.1815,17z');
    assert.deepEqual(coords, { latitude: 36.8065, longitude: 10.1815 });
  });

  it('prefers place pin coordinates over camera coordinates', () => {
    const coords = extractCoordinatesFromMapsUrl(
      'https://www.google.com/maps/place/Venue/@36.8,10.1,17z/data=!3d36.8065!4d10.1815',
    );
    assert.deepEqual(coords, { latitude: 36.8065, longitude: 10.1815 });
  });

  it('extracts q=lat,lng coordinates', () => {
    const coords = extractCoordinatesFromMapsUrl('https://maps.google.com/?q=48.8584,2.2945');
    assert.deepEqual(coords, { latitude: 48.8584, longitude: 2.2945 });
  });

  it('rejects non-Google URLs', () => {
    assert.equal(isAllowedMapsUrl('https://example.com'), false);
    assert.equal(isAllowedMapsUrl('https://maps.app.goo.gl/abc123'), true);
  });

  it('rejects invalid coordinates', () => {
    assert.equal(isValidCoordinates(0, 0), false);
    assert.equal(isValidCoordinates(91, 10), false);
    assert.equal(isValidCoordinates(36.8, 10.18), true);
  });

  it('reads place names from /maps/place URLs', () => {
    const query = extractGeocodeQueryFromMapsUrl('https://www.google.com/maps/place/Villa+Ephrussi/@43.6,7.3,17z');
    assert.equal(query, 'Villa Ephrussi');
  });
});

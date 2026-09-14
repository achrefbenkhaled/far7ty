import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getEventFieldConfig, googleMapsUrlSchema, defaultDynamicDataForEvent } from './invitationFieldSchemas';

describe('invitation field schemas', () => {
  it('returns wedding-specific fields', () => {
    const config = getEventFieldConfig('wedding');
    assert.equal(config.fields.some((field) => field.key === 'brideName'), true);
    assert.equal(config.fields.some((field) => field.key === 'groomName'), true);
  });

  it('accepts valid Google Maps URLs', () => {
    assert.equal(googleMapsUrlSchema.parse('https://maps.google.com/?q=Paris'), 'https://maps.google.com/?q=Paris');
  });

  it('rejects non-Google map URLs', () => {
    assert.throws(() => googleMapsUrlSchema.parse('https://example.com'));
  });

  it('creates defaults for birthday invitations', () => {
    const data = defaultDynamicDataForEvent('birthday');
    assert.equal(data.celebrantName, '');
    assert.equal(data.language, 'fr');
  });
});

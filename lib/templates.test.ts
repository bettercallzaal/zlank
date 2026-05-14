import { describe, it, expect } from 'vitest';
import {
  TEMPLATES,
  getTemplateById,
  getTemplatesByPartner,
  listTemplatePartners,
} from './templates';
import { validateDoc } from './validate-snap';

describe('partner templates', () => {
  it('exposes getTemplatesByPartner filtered by partner id', () => {
    const footy = getTemplatesByPartner('footy');
    expect(footy.length).toBeGreaterThan(0);
    footy.forEach((t) => expect(t.partner?.id).toBe('footy'));
    expect(getTemplatesByPartner('nobody')).toEqual([]);
  });

  it('lists every distinct template partner', () => {
    const partners = listTemplatePartners().map((p) => p.id);
    expect(partners).toEqual(
      expect.arrayContaining([
        'footy',
        'clanker',
        'zora',
        'hypersub',
        'polymarket',
        'bountycaster',
        'highlight',
        'defifa',
        'empirebuilder',
      ]),
    );
  });

  it('keeps the original generic templates partner-free', () => {
    expect(getTemplateById('fan-vote')?.partner).toBeUndefined();
    expect(getTemplateById('quick-poll')?.partner).toBeUndefined();
  });

  it('every partner template carries doc.partner attribution', () => {
    for (const t of TEMPLATES) {
      if (!t.partner) continue;
      expect(t.doc.partner?.id).toBe(t.partner.id);
      expect(t.doc.partner?.attribution).toBe(true);
    }
  });

  it('every template produces a valid SnapDoc', () => {
    for (const t of TEMPLATES) {
      const result = validateDoc(t.doc);
      expect(result.ok, `${t.id}: ${result.errors.join('; ')}`).toBe(true);
    }
  });
});

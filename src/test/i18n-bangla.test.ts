import { describe, expect, it } from 'vitest';
import { STRINGS } from '@/lib/i18n/strings';

const bn = STRINGS.bn as Record<string, string>;
const en = STRINGS.en as Record<string, string>;

describe('Bangla interface strings', () => {
  it('end sentences with the dari (।), never an ASCII full stop', () => {
    const bad = Object.entries(bn).filter(([, v]) => /[\u0980-\u09FF]\.$/.test(v.trim()));
    expect(bad).toEqual([]);
  });

  it('have no doubled spaces, stray edge spaces (outside label prefixes) or emoji', () => {
    const intentionalTrailing = new Set(Object.keys(en).filter((k) => en[k].endsWith(' ')));
    const bad = Object.entries(bn).filter(
      ([k, v]) => /\s{2,}/.test(v) || v.startsWith(' ') || (v.endsWith(' ') && !intentionalTrailing.has(k)) || /\p{Extended_Pictographic}/u.test(v),
    );
    expect(bad).toEqual([]);
  });

  it('keep split sentences in Bangla word order (verb after the link or key)', () => {
    expect(`${bn['sources.none']} x@y ${bn['sources.noneEnd']}`).toMatch(/চোখে পড়েছে\? x@y ঠিকানায় ইমেইল করুন/);
    expect(`${bn['end.latestOnThis']} প্রযুক্তি ${bn['end.forMore']}`).toBe('এ বিষয়ে আপাতত এটুকুই। আরও পড়তে প্রযুক্তি বিভাগটি দেখুন।');
    expect(bn['searchPage.tipAfter']).toBe('চাপুন।');
  });
});

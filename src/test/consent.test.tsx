import { describe, expect, it, vi, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { MarketingConsent } from '@/components/news/MarketingConsent';
import { subscriptionApi } from '@/lib/api/client';

function Harness({ onValue }: { onValue: (v: boolean) => void }) {
  const [v, setV] = useState(false);
  return (
    <MarketingConsent
      checked={v}
      onChange={(next) => {
        setV(next);
        onValue(next);
      }}
    />
  );
}

afterEach(() => vi.restoreAllMocks());

describe('marketing consent', () => {
  it('starts unchecked and only becomes true when the reader ticks it', () => {
    const seen: boolean[] = [];
    render(<Harness onValue={(v) => seen.push(v)} />);
    const box = screen.getByRole('checkbox');
    expect(box).not.toBeChecked();
    fireEvent.click(box);
    expect(box).toBeChecked();
    fireEvent.click(box);
    expect(seen).toEqual([true, false]);
  });

  it('sends the actual consent value to checkout, never a hard-coded true', async () => {
    const calls: unknown[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
      calls.push(JSON.parse(String((init as RequestInit).body)));
      return new Response(JSON.stringify({ checkout_url: 'https://checkout.example' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });
    await subscriptionApi.createCheckout('1', false);
    await subscriptionApi.createCheckout('1', true);
    expect(calls).toEqual([
      { plan_id: '1', consent_opt_in: false, consent_source: 'checkout' },
      { plan_id: '1', consent_opt_in: true, consent_source: 'checkout' },
    ]);
  });
});

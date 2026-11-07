import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ConfirmDialog } from './components/ConfirmDialog';
import { StudioGate } from './StudioGate';
import { sanitizeArticleHtml } from './lib/sanitize';
import { Response as ChatResponse } from './components/ai/elements';
import { fromDhakaLocalInput, toDhakaLocalInput } from './lib/format';
import { NotEnoughData } from './components/common';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function Where() {
  const loc = useLocation();
  return <p data-testid="where">{loc.pathname + loc.search}</p>;
}

function renderGate(path = '/studio/articles') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/studio/login" element={<Where />} />
        <Route path="/" element={<Where />} />
        <Route path="/studio/*" element={<StudioGate>{(me) => <p>Welcome {me.email}</p>}</StudioGate>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('StudioGate', () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('sends signed-out visitors to the Studio sign-in with a return path', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderGate('/studio/articles?status=ready');
    await waitFor(() => expect(screen.getByTestId('where').textContent).toBe('/studio/login?next=%2Fstudio%2Farticles%3Fstatus%3Dready'));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('redirects signed-in non-staff users to the public site', async () => {
    window.localStorage.setItem('token', 'reader-token');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ id: 2, email: 'r@example.com', name: 'R', is_staff: false, is_superuser: false }));
    renderGate();
    await waitFor(() => expect(screen.getByTestId('where').textContent).toBe('/'));
    expect(screen.queryByText(/Welcome/)).toBeNull();
  });

  it('renders the Studio for staff and sends the JWT', async () => {
    window.localStorage.setItem('token', 'staff-token');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ id: 1, email: 'nasir@example.com', name: 'Nasir', is_staff: true, is_superuser: true }));
    renderGate();
    expect(await screen.findByText('Welcome nasir@example.com')).toBeInTheDocument();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain('/api/admin/me/');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer staff-token');
  });

  it('clears a rejected token and asks for sign-in again', async () => {
    window.localStorage.setItem('token', 'expired');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ detail: 'Token is invalid' }, 401));
    renderGate();
    await waitFor(() => expect(screen.getByTestId('where').textContent).toMatch(/^\/studio\/login/));
    expect(window.localStorage.getItem('token')).toBeNull();
  });
});

describe('ConfirmDialog', () => {
  it('runs the action only after the confirm button, then closes', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    render(<ConfirmDialog open onOpenChange={onOpenChange} title="Publish this article?" confirmLabel="Publish now" tone="public" onConfirm={onConfirm} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Publish now' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('cancel never runs the action', () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(<ConfirmDialog open onOpenChange={onOpenChange} title="Unpublish?" confirmLabel="Unpublish" tone="destructive" onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('requires the exact typed confirmation before sending', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<ConfirmDialog open onOpenChange={() => undefined} title="Send this newsletter now?" confirmLabel="Send to 148" typedConfirmation="SEND" onConfirm={onConfirm} />);
    const button = screen.getByRole('button', { name: 'Send to 148' });
    expect(button).toBeDisabled();
    const input = screen.getByLabelText(/Type/);
    fireEvent.change(input, { target: { value: 'send' } });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: 'SEND' } });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
  });

  it('stays open and shows the error when the action fails', async () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog open onOpenChange={onOpenChange} title="Publish?" confirmLabel="Publish now" onConfirm={() => Promise.reject(new Error('Blocked by PublishGuard'))} />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Publish now' }));
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Blocked by PublishGuard');
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});

describe('article HTML sanitizer', () => {
  it('removes scripts, handlers, iframes and javascript links; hardens external links', () => {
    const dirty =
      '<p onclick="steal()">Hi <a href="javascript:alert(1)">x</a> <a href="https://example.com">ok</a></p><script>alert(1)</script><iframe src="https://evil"></iframe><img src="x" onerror="boom()">';
    const clean = sanitizeArticleHtml(dirty);
    expect(clean).not.toMatch(/script|onclick|onerror|iframe|javascript:/i);
    expect(clean).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer">ok</a>');
  });
});

describe('chat Response renderer', () => {
  it('renders lists and bold as elements, never raw HTML', () => {
    const { container } = render(<ChatResponse>{'Views **rose**.\n\n- one\n- two\n\n<img src=x onerror=alert(1)>'}</ChatResponse>);
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(container.querySelector('strong')?.textContent).toBe('rose');
    expect(container.querySelector('img')).toBeNull();
  });
});

describe('Asia/Dhaka time inputs', () => {
  it('round-trips a publish time on the owner clock', () => {
    expect(fromDhakaLocalInput('2026-11-08T20:00')).toBe('2026-11-08T14:00:00.000Z');
    expect(toDhakaLocalInput('2026-11-08T14:00:00Z')).toBe('2026-11-08T20:00');
  });
});

describe('NotEnoughData', () => {
  it('says so plainly instead of guessing', () => {
    render(<NotEnoughData needed="at least 30 measured reading sessions" sample={{ sessions: 4 }} />);
    expect(screen.getByText('Not enough data yet')).toBeInTheDocument();
    expect(screen.getByText(/4 sessions/)).toBeInTheDocument();
  });
});

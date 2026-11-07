import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { AuthShell, Field } from '@/components/layout/PageShell';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { newsletterApi } from '@/lib/api/client';

/** Newsletter unsubscribe: POST /api/newsletter/unsubscribe/ with the email's token, or an email address. */
export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get('token') || undefined;
  const [email, setEmail] = useState(params.get('email') || '');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('busy');
    try {
      const res = await newsletterApi.unsubscribe(token ? { token } : { email: email.trim() });
      setState('done');
      setMessage(res?.message || 'You’ve been unsubscribed.');
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : 'That didn’t work.');
    }
  };

  return (
    <>
      <Seo title="Unsubscribe" path="/unsubscribe/" noindex />
      <AuthShell title="Unsubscribe from the briefing" dek="Sorry to see you go. You can resubscribe anytime.">
        {state === 'done' ? (
          <Alert variant="success">{message}</Alert>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            {state === 'error' && <Alert variant="destructive">{message}</Alert>}
            {!token && (
              <Field id="unsub-email" label="Email">
                <Input id="unsub-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </Field>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={state === 'busy' || (!token && !email.trim())}>
              {state === 'busy' && <Loader2 className="animate-spin" />} Unsubscribe
            </Button>
          </form>
        )}
      </AuthShell>
    </>
  );
}

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { AuthShell, Field } from '@/components/layout/PageShell';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api/client';

/** Target of the backend's reset email: /reset-password/:uid/:token */
export default function ResetPassword() {
  const { uid = '', token = '' } = useParams<{ uid: string; token: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const validLink = Boolean(uid && token);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Use at least 8 characters.');
    if (password !== confirm) return setError('The passwords don’t match.');
    setBusy(true);
    try {
      await authApi.confirmPasswordReset(uid, token, password);
      setDone(true);
    } catch (err) {
      setError(
        `${err instanceof Error ? err.message : 'The reset failed.'} If this link is old or already used, request a new one.`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Seo title="Choose a new password" path="/reset-password/" noindex />
      <AuthShell
        title={done ? 'Password updated.' : 'Choose a new password.'}
        footer={
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        }
      >
        {!validLink ? (
          <Alert variant="destructive">
            This reset link is incomplete. Open the link from your email again, or{' '}
            <Link to="/forgot-password" className="underline">
              request a new one
            </Link>
            .
          </Alert>
        ) : done ? (
          <Alert variant="success">
            <CheckCircle2 />
            <p>
              You can now{' '}
              <Link to="/login" className="font-medium underline">
                sign in
              </Link>{' '}
              with your new password.
            </p>
          </Alert>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            {error && <Alert variant="destructive">{error}</Alert>}
            <Field id="rp-pass" label="New password" hint="8+ characters">
              <Input id="rp-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Field>
            <Field id="rp-pass2" label="Confirm new password">
              <Input id="rp-pass2" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </Field>
            <Button type="submit" className="w-full" size="lg" disabled={busy} loading={busy}>
              Update password
            </Button>
          </form>
        )}
      </AuthShell>
    </>
  );
}

import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { Field, PageIntro } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CONTACT_EMAIL } from '@/lib/utils';

const TOPICS = ['General', 'Story tip', 'Correction', 'Partnerships', 'Careers'];

/**
 * The backend has no /api/contact/ endpoint, so the form composes an email in the
 * reader's mail app instead of pretending to submit.
 */
export default function Contact() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`[${topic}] ${name ? `from ${name}` : 'Message'}`)}&body=${encodeURIComponent(message)}`;

  return (
    <>
      <Seo title="Contact" description="Contact The Age of GenZ newsroom: tips, corrections, partnerships and general questions." path="/contact/" />
      <div className="container pt-8 sm:pt-12">
        <PageIntro eyebrow="Contact" title="Talk to the newsroom." dek="Tips, corrections, partnerships or a question about a story. A person reads every message." />
        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <form
            className="space-y-5 lg:col-span-7"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = href;
            }}
          >
            <div role="radiogroup" aria-label="Topic" className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={topic === t}
                  onClick={() => setTopic(t)}
                  className={
                    topic === t
                      ? 'rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground'
                      : 'rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium hover:border-foreground/40'
                  }
                >
                  {t}
                </button>
              ))}
            </div>
            <Field id="c-name" label="Your name">
              <Input id="c-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field id="c-msg" label="Message">
              <Textarea id="c-msg" rows={7} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What would you like to tell us?" />
            </Field>
            <Button type="submit" size="lg" disabled={!message.trim()}>
              <Send /> Open in my email app
            </Button>
            <p className="text-xs text-muted-foreground">This opens your email app with the message filled in, addressed to {CONTACT_EMAIL}.</p>
          </form>
          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-lg border bg-card p-6">
              <Mail className="size-5 text-primary" />
              <p className="mt-3 font-display text-2xl font-medium">Email us directly</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline mt-1 inline-block text-primary">
                {CONTACT_EMAIL}
              </a>
              <p className="mt-4 text-sm text-muted-foreground">For corrections, include the story link and what needs fixing.</p>
            </div>
            <div className="rounded-lg bg-mist p-6 text-mist-foreground">
              <p className="eyebrow text-secondary-foreground">Based in</p>
              <p className="mt-2 font-display text-xl">Dhaka, Bangladesh</p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

import { Link } from 'react-router-dom';
import { Seo } from '@/components/seo/Seo';
import { PageIntro } from '@/components/layout/PageShell';
import { CONTACT_EMAIL, SITE_URL } from '@/lib/utils';

const SECTIONS_POLICY: { h: string; p: string[] }[] = [
  {
    h: 'What we publish',
    p: [
      'We publish news, explainers and clearly labelled opinion. A news story reports what happened and why it matters. An opinion piece argues a point of view and is marked “Opinion” wherever it appears.',
    ],
  },
  {
    h: 'Accuracy and sourcing',
    p: [
      'We aim to verify facts before publishing and to say plainly when something is not yet known or confirmed.',
      'Stories link to the reporting, documents and data they rely on, so readers can check them. When a story builds on another outlet’s reporting, we credit and link to it.',
    ],
  },
  {
    h: 'How we use AI',
    p: [
      'Some features use AI: short summaries (TL;DR), “Why it matters” lines, translations and the “Ask about this article” tool. These are labelled where they appear.',
      'AI answers in “Ask about this article” draw only on the text of the story you are reading and can still be wrong. The article itself, and the sources it links to, remain the reference.',
      'A summary is described as reviewed by editors only when an editor has reviewed it.',
    ],
  },
  {
    h: 'Independence',
    p: [
      'Advertisers, donors and subscribers do not decide what we cover or how. Sponsored content, if we ever publish it, will be labelled as sponsored.',
    ],
  },
  {
    h: 'Fairness',
    p: [
      'We try to represent people and positions accurately, give those we write about a fair chance to respond to serious claims, and avoid sensational headlines that the story does not support.',
    ],
  },
  {
    h: 'Corrections',
    p: ['When we get something wrong, we fix it and say so. See our corrections policy for how that works.'],
  },
];

export default function EditorialPolicy() {
  return (
    <>
      <Seo
        title="Editorial policy"
        description="How The Age of GenZ reports, sources, labels opinion and AI features, and stays independent."
        path="/editorial-policy/"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Editorial policy', url: `${SITE_URL}/editorial-policy/` }}
      />
      <div className="container pt-8 sm:pt-12">
        <PageIntro eyebrow="Standards" title="Editorial policy" dek="How we decide what to publish, how we check it, and how we label it." />
        <div className="article-body mt-12 max-w-prose">
          {SECTIONS_POLICY.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((t) => (
                <p key={t.slice(0, 24)}>{t}</p>
              ))}
            </section>
          ))}
          <p>
            Read our <Link to="/corrections">corrections policy</Link>, or write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with questions
            about our standards.
          </p>
        </div>
      </div>
    </>
  );
}

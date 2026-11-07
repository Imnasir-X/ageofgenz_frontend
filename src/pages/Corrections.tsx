import { Link } from 'react-router-dom';
import { Seo } from '@/components/seo/Seo';
import { PageIntro } from '@/components/layout/PageShell';
import { CONTACT_EMAIL, SITE_URL } from '@/lib/utils';

export default function Corrections() {
  const mail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Correction request')}`;
  return (
    <>
      <Seo
        title="Corrections"
        description="How to report an error to The Age of GenZ and how we correct and update stories."
        path="/corrections/"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Corrections policy', url: `${SITE_URL}/corrections/` }}
      />
      <div className="container pt-8 sm:pt-12">
        <PageIntro eyebrow="Standards" title="Corrections" dek="When we get something wrong, we fix it and say so." />
        <div className="article-body mt-12 max-w-prose">
          <h2>Report an error</h2>
          <p>
            If you think a story contains a factual error, email <a href={mail}>{CONTACT_EMAIL}</a> with the link to the story, what you believe is
            wrong, and, if you can, a source that shows it. We read every report.
          </p>
          <h2>How we correct</h2>
          <p>
            When a fact in a published story is wrong, we correct the text and add a note to the story explaining what changed. We do not quietly
            rewrite errors.
          </p>
          <p>
            Small fixes that do not change the meaning, such as spelling or formatting, may be made without a note.
          </p>
          <h2>Updates</h2>
          <p>
            Developing stories may be updated as new information arrives. Updated stories show an “Updated” time next to the original publication
            time.
          </p>
          <h2>Opinion and AI features</h2>
          <p>
            Opinion pieces are corrected the same way when they contain a factual error. If an AI summary or answer on our site is wrong, report it
            the same way; we fix or remove it.
          </p>
          <p>
            See also our <Link to="/editorial-policy">editorial policy</Link>.
          </p>
        </div>
      </div>
    </>
  );
}

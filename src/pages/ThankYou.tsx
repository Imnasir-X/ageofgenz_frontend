import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { Button } from '@/components/ui/button';
import { NewsletterForm } from '@/components/news/NewsletterForm';

export default function ThankYou() {
  return (
    <>
      <Seo title="Thank you" path="/donation/success/" noindex />
      <div className="container max-w-2xl py-20 text-center">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <h1 className="mt-6 font-display text-5xl font-medium tracking-[-0.025em]">Thank you.</h1>
        <p className="mt-4 font-serif text-xl leading-relaxed text-muted-foreground">
          Your support keeps The Age of GenZ independent. A receipt is on its way to your email from Stripe.
        </p>
        <div className="mx-auto mt-10 max-w-md text-left">
          <p className="eyebrow mb-2 text-primary">Get the weekly briefing</p>
          <NewsletterForm source="thank-you" />
        </div>
        <Button asChild variant="link" className="mt-8">
          <Link to="/">Back to today’s briefing</Link>
        </Button>
      </div>
    </>
  );
}

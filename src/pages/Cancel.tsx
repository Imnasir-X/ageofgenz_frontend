import { Link } from 'react-router-dom';
import { Seo } from '@/components/seo/Seo';
import { Button } from '@/components/ui/button';

export default function Cancel() {
  return (
    <>
      <Seo title="Checkout cancelled" path="/donation/cancelled/" noindex />
      <div className="container max-w-2xl py-20 text-center">
        <p className="eyebrow text-primary">Checkout cancelled</p>
        <h1 className="mt-4 font-display text-5xl font-medium tracking-[-0.025em]">No payment was taken.</h1>
        <p className="mt-4 font-serif text-xl leading-relaxed text-muted-foreground">Changed your mind or hit a snag? You can try again whenever you like.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link to="/donate">Try again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Today’s briefing</Link>
          </Button>
        </div>
      </div>
    </>
  );
}

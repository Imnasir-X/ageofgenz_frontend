import React from 'react';

import { Link } from 'react-router-dom';

import { subscribeToNewsletter } from '../utils/api';

import { Mail, Globe, Sparkles, Clock, Users, Check, Star, Shield } from 'lucide-react';

// Common email domains used for fast suggestion checks
const COMMON_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'] as const;

const Footer: React.FC = () => {

const [email, setEmail] = React.useState<string>('');

const [message, setMessage] = React.useState<string>('');

const [error, setError] = React.useState<string>('');

const [loading, setLoading] = React.useState<boolean>(false);

const [emailSuggestion, setEmailSuggestion] = React.useState<string>('');

const [showSuccess, setShowSuccess] = React.useState<boolean>(false);

const [frequency, setFrequency] = React.useState<'daily' | 'weekly' | 'breaking'>('daily');

// Removed language selector (not used)
const successTimeoutRef = React.useRef<number | undefined>(undefined);

// Email suggestion using closest domain match



// Fast email suggestion without heavy Levenshtein
const validateEmailSmart = React.useCallback((emailValue: string) => {
  const parts = emailValue.split('@');
  if (parts.length === 2 && parts[1]) {
    const domain = parts[1].toLowerCase().replace(',', '.');
    // If already a known domain
    if ((COMMON_DOMAINS as readonly string[]).includes(domain)) {
      setEmailSuggestion('');
      return;
    }
    // Common typo map
    const typoMap: Record<string, string> = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmali.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
      'iclod.com': 'icloud.com',
    };
    if (typoMap[domain]) {
      setEmailSuggestion(`${parts[0]}@${typoMap[domain]}`);
      return;
    }
    // Fuzzy prefix match fallback
    for (const d of COMMON_DOMAINS as readonly string[]) {
      if (domain.length >= 4 && d.startsWith(domain.slice(0, 4))) {
        setEmailSuggestion(`${parts[0]}@${d}`);
        return;
      }
    }
  }
  setEmailSuggestion('');
}, []);const handleNewsletterSubmit = async (e: React.FormEvent) => {

e.preventDefault();

setMessage('');

setError('');

setLoading(true);

if (!email.trim()) {

setError('Email address is required.');

setLoading(false);

return;

}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {

setError('Please enter a valid email address.');

setLoading(false);

return;

}

try {

await subscribeToNewsletter({ email: email.trim(), frequency });
setShowSuccess(true);

setMessage("You're subscribed! Please check your inbox.");

setEmail('');

setEmailSuggestion('');

if (successTimeoutRef.current) window.clearTimeout(successTimeoutRef.current);

successTimeoutRef.current = window.setTimeout(() => setShowSuccess(false), 3000);

} catch (err) {

console.error('Newsletter subscription error:', err);

setError('Failed to subscribe. Please try again shortly.');

} finally {

setLoading(false);

}

};

const debounceRef = React.useRef<number | undefined>(undefined);

// Cleanup timers on unmount

React.useEffect(() => {

return () => {

if (debounceRef.current) window.clearTimeout(debounceRef.current);

if (successTimeoutRef.current) window.clearTimeout(successTimeoutRef.current);

};

}, []);

const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {

const value = e.target.value;

setEmail(value);

if (debounceRef.current) {

clearTimeout(debounceRef.current);

}

if (value.includes('@') && value.length > 5) {

debounceRef.current = window.setTimeout(() => {

validateEmailSmart(value);

}, 500);

} else {

setEmailSuggestion('');

}

};

const applySuggestion = () => {

setEmail(emailSuggestion);

setEmailSuggestion('');

};

const scrollToTop = () => {

window.scrollTo({ top: 0, behavior: 'smooth' });

};

// Simple quick links

const quickLinks = [

{ to: '/about', label: 'About' },

{ to: '/contact', label: 'Contact' },

{ to: '/join', label: 'Careers' },

{ to: '/privacy', label: 'Privacy' },

{ to: '/terms', label: 'Terms' },

{ to: '/trending', label: 'Trending' }

];

const isEmailValid = React.useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);

return (

<footer className="bg-black backdrop-blur-md text-white pt-12 pb-6">

<div className="container mx-auto px-4">

{/* Main Footer Content */}

<div className="grid grid-cols-1 md:grid-cols-3 gap-8">

{/* Column 1: Brand & Description */}

<div className="md:col-span-1">

<div className="flex items-center mb-4">

<img src="/logo.png?v=2025" alt="The Age Of GenZ Logo" className="h-8 w-auto mr-2" />

<span className="text-xl font-bold tracking-tight">The Age Of GenZ</span>

</div>

<p className="text-orange-500 font-medium text-lg mb-4">"NEWS YOU CAN VIBE WITH"</p>

<p className="text-gray-400 text-sm mb-6 leading-relaxed">

Professional news organization delivering quality journalism for all generations across the globe.

</p>

{/* Social Media (no fake stats/tooltips, no scale transforms) */}

<div className="flex space-x-4">

<a

href="https://twitter.com/TheAgeOfGenZ"

target="_blank"

rel="noopener noreferrer"

className="relative text-gray-400 hover:text-orange-600 transition-colors duration-200"

aria-label="Follow us on X"

title="Follow @TheAgeOfGenZ on X"

>

<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">

<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />

</svg>

</a>

<a

href="https://facebook.com/theageofgenz"

target="_blank"

rel="noopener noreferrer"

className="relative text-gray-400 hover:text-orange-600 transition-colors duration-200"

aria-label="Follow us on Facebook"

title="Follow us on Facebook"

>

<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">

<path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />

</svg>

</a>

<a

href="https://instagram.com/theageofgenz"

target="_blank"

rel="noopener noreferrer"

className="relative text-gray-400 hover:text-orange-600 transition-colors duration-200"

aria-label="Follow us on Instagram"

title="Follow us on Instagram"

>

<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">

<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>

</svg>

</a>

<a

href="https://youtube.com/@theageofgenz"

target="_blank"

rel="noopener noreferrer"

className="relative text-gray-400 hover:text-orange-600 transition-colors duration-200"

aria-label="Subscribe to our YouTube channel"

title="Subscribe to our YouTube channel"

>

<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">

<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>

</svg>

</a>

</div>

</div>

{/* Column 2: Quick Links (simple) */}

<div className="md:col-span-1">

<h3 className="text-lg font-bold mb-4 text-white flex items-center">

<Sparkles className="w-4 h-4 mr-2 text-orange-500" />

Quick Links

</h3>

<div className="grid grid-cols-2 gap-2 text-sm">

{quickLinks.map(link => (

<Link

key={link.to}

to={link.to}

className="relative text-gray-400 hover:text-orange-600 transition-colors duration-200 flex items-center"

>

<span>{link.label}</span>

</Link>

))}

</div>

</div>

{/* Column 3: Newsletter */}

<div className="md:col-span-1">

<div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl p-6 border border-gray-700 backdrop-blur-sm">

<h3 className="text-lg font-bold mb-3 text-white flex items-center">

<Sparkles className="w-5 h-5 text-orange-500 mr-3" />

Stay Informed

</h3>

<div className="mb-4">

<p className="text-gray-300 text-sm mb-2 flex items-center">

<Shield className="w-4 h-4 mr-2 text-blue-500" />

Join <span className="text-orange-500 font-bold mx-1">25,000+</span> informed readers

</p>

<div className="flex items-center text-xs text-gray-400 space-x-4">

<span className="flex items-center">

<Star className="w-3 h-3 mr-1 text-yellow-500" />

Breaking news alerts

</span>

<span className="flex items-center">

<Clock className="w-3 h-3 mr-1 text-blue-500" />

Daily briefings

</span>

</div>

</div>

<form onSubmit={handleNewsletterSubmit}>

{message && (

<div className={`mb-3 p-3 rounded-lg text-sm flex items-center transition-all duration-300 ${

showSuccess ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-green-900 text-green-300'

}`} role="status" aria-live="polite">

<div className="flex items-center">

{showSuccess && (

<div className="mr-2">

<Check className="w-4 h-4" />

</div>

)}

<span>{message}</span>

</div>

</div>

)}

{error && (

<div id="newsletter-error" className="mb-3 p-3 bg-red-900 text-red-300 rounded-lg text-sm border border-red-700" role="alert" aria-live="assertive">

{error}

</div>

)}

<div className="space-y-3">

<div className="relative">

<input

type="email"

value={email}

onChange={handleEmailChange}

placeholder="Enter your email..."

className="w-full p-3 text-sm bg-gray-800/50 border-2 rounded-lg text-white focus:outline-none transition-colors duration-200 backdrop-blur-sm border-gray-600 focus:border-orange-500"

aria-invalid={!!error || (!!email && !isEmailValid)}

aria-describedby={`${error ? 'newsletter-error' : ''} ${emailSuggestion ? 'newsletter-suggestion' : ''}`.trim()}

required

disabled={loading}

/>

{/* Minimal validation indicator */}

{email && isEmailValid && (

<div className="absolute right-3 top-1/2 -translate-y-1/2">

<Check className="w-4 h-4 text-green-500" />

</div>

)}

</div>

{/* Domain Suggestion */}

{emailSuggestion && (

<button

type="button"

onClick={applySuggestion}

className="w-full text-left text-sm bg-orange-900/30 hover:bg-orange-900/50 text-orange-300 p-2 rounded-lg border border-orange-700/30 transition-colors duration-200 flex items-center"

id="newsletter-suggestion"

aria-label={`Apply email suggestion ${emailSuggestion}`}

>

<Sparkles className="w-3 h-3 mr-2" />

Did you mean: <span className="font-semibold underline ml-1">{emailSuggestion}</span>?

</button>

)}

{/* Email frequency */}

<fieldset className="text-xs text-gray-300" aria-labelledby="newsletter-frequency-label">

<legend id="newsletter-frequency-label" className="mb-1 font-medium">Email frequency</legend>

<div className="flex items-center space-x-4">

<label className="flex items-center space-x-1">

<input type="radio" name="frequency" value="daily" checked={frequency==='daily'} onChange={() => setFrequency('daily')} />

<span>Daily</span>

</label>

<label className="flex items-center space-x-1">

<input type="radio" name="frequency" value="weekly" checked={frequency==='weekly'} onChange={() => setFrequency('weekly')} />

<span>Weekly</span>

</label>

<label className="flex items-center space-x-1">

<input type="radio" name="frequency" value="breaking" checked={frequency==='breaking'} onChange={() => setFrequency('breaking')} />

<span>Breaking</span>

</label>

</div>

</fieldset>

{/* Subscribe Button */}

<button

type="submit"

className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${

loading

? 'bg-orange-600 cursor-wait'

: showSuccess

? 'bg-green-600 shadow-md shadow-green-500/20'

: 'bg-orange-500 hover:bg-orange-600'

} ${email && !loading ? 'text-white' : 'text-gray-200'}`}

disabled={loading || !email}

>

{loading ? (

<>

<Sparkles className="w-4 h-4 animate-spin" />

<span>Processing...</span>

</>

) : showSuccess ? (

<>

<Check className="w-4 h-4" />

<span>Subscribed!</span>

</>

) : (

<>

<Mail className="w-4 h-4" />

<span>Subscribe Now</span>

</>

)}

</button>

{/* Trust Indicator */}

<div className="flex items-center justify-center text-xs text-gray-500 pt-2">

<span className="flex items-center">

<div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>

No spam policy

</span>

</div>

</div>

</form>

</div>

</div>

</div>

{/* Contact Information */}

<div className="border-t border-gray-800 pt-6">

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left text-sm">

<div className="flex flex-col md:flex-row items-center md:items-start">

<Mail className="w-4 h-4 text-orange-500 mr-2 mb-1 md:mb-0 flex-shrink-0" />

<div>

<a

href="mailto:contact@theageofgenz.com"

className="text-gray-300 hover:text-orange-500 transition-colors"

>

contact@theageofgenz.com

</a>

<div className="flex items-center mt-1">

<div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>

<p className="text-xs text-gray-500">Response within 2 hours</p>

</div>

</div>

</div>

<div className="flex flex-col md:flex-row items-center md:items-start">

<Globe className="w-4 h-4 text-orange-500 mr-2 mb-1 md:mb-0 flex-shrink-0" />

<div>

<p className="text-gray-300">Global Coverage: US, Europe & Asia</p>

<div className="flex items-center mt-1">

<Users className="w-3 h-3 text-gray-500 mr-1" />

<p className="text-xs text-gray-500">Trusted by journalists worldwide</p>

</div>

</div>

</div>

</div>

</div>

{/* Recent/Popular Posts */}
<div className="border-t border-gray-800 mt-6 pt-4">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
    <div>
      <h4 className="text-white font-semibold mb-2">Recent Posts</h4>
      <ul className="space-y-1 text-gray-400">
        <li><Link to="/trending" className="hover:text-orange-600 transition-colors" aria-label="Read trending stories">Trending Stories</Link></li>
        <li><Link to="/latest" className="hover:text-orange-600 transition-colors" aria-label="Read latest news">Latest News</Link></li>
        <li><Link to="/opinion" className="hover:text-orange-600 transition-colors" aria-label="Read opinion articles">Opinion</Link></li>
      </ul>
    </div>
    <div>
      <h4 className="text-white font-semibold mb-2">Popular</h4>
      <ul className="space-y-1 text-gray-400">
        <li><Link to="/popular" className="hover:text-orange-600 transition-colors" aria-label="Read popular stories">Most Read</Link></li>
        <li><Link to="/topics/technology" className="hover:text-orange-600 transition-colors" aria-label="Technology coverage">Technology</Link></li>
        <li><Link to="/topics/world" className="hover:text-orange-600 transition-colors" aria-label="World coverage">World</Link></li>
      </ul>
    </div>
    <div>
      <h4 className="text-white font-semibold mb-2">Follow</h4>
      <ul className="space-y-1 text-gray-400">
        <li><a href="https://twitter.com/TheAgeOfGenZ" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors" aria-label="Follow on X">X (Twitter)</a></li>
        <li><a href="https://instagram.com/theageofgenz" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors" aria-label="Follow on Instagram">Instagram</a></li>
        <li><a href="https://youtube.com/@theageofgenz" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors" aria-label="Subscribe on YouTube">YouTube</a></li>
      </ul>
    </div>
  </div>
</div>

{/* Bottom Bar */}
<div className="border-t border-gray-800 mt-6 pt-4">

<div className="flex flex-col md:flex-row justify-between items-center">

<p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} The Age Of GenZ LLC. All rights reserved.</p>

<div className="mt-2 md:mt-0 flex items-center space-x-4">
              

<Link to="/privacy" className="text-gray-400 hover:text-orange-600 text-sm transition-colors">Privacy</Link>

<Link to="/terms" className="text-gray-400 hover:text-orange-600 text-sm transition-colors">Terms</Link>

<button

onClick={scrollToTop}

className="relative text-gray-400 hover:text-orange-600 text-sm flex items-center transition-colors duration-200"

aria-label="Scroll to top"

>

<svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">

<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />

</svg>

<span>Back to Top</span>

</button>

</div>

</div>

</div>

</div>

</footer>

);

};

export default Footer;







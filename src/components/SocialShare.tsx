import React, { useState } from 'react';
import { Facebook, Mail, Linkedin, Copy } from 'lucide-react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  className?: string;
}

// X (Twitter) Logo Component
const XLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SocialShare: React.FC<SocialShareProps> = ({
  url,
  title,
  description = '',
  hashtags = [],
  className = ''
}) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Generate hashtag string for social shares
  const hashtagString = hashtags.length > 0 ? hashtags.join(',') : '';

  return (
    <div className={`${className} border-t border-gray-200 pt-6`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Share this article:</h4>
        <div className="flex items-center gap-3">
          {/* Facebook Share */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            aria-label="Share on Facebook"
            title="Share on Facebook"
          >
            <Facebook size={20} />
          </a>

          {/* X Share */}
          <a
            href={`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=${hashtagString}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            aria-label="Share on X"
            title="Share on X"
          >
            <XLogo />
          </a>
          
          {/* Email Share */}
          <a
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\nRead more: ${url}`)}`}
            className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            aria-label="Share via Email"
            title="Share via Email"
          >
            <Mail size={20} />
          </a>

          {/* LinkedIn Share */}
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            aria-label="Share on LinkedIn"
            title="Share on LinkedIn"
          >
            <Linkedin size={20} />
          </a>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className={`p-2 rounded-full transition-colors ${
              copySuccess 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label="Copy article link"
            title="Copy Link"
          >
            <Copy size={20} />
          </button>
        </div>
      </div>

      {copySuccess && (
        <p className="text-green-600 text-sm text-right mt-2 animate-fadeIn">
          Link copied to clipboard!
        </p>
      )}
    </div>
  );
};

export default SocialShare;
import React, { useState } from 'react';
import { Facebook, Mail, Linkedin, Copy, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  className?: string;
}

// X (Twitter) Logo Component
const XLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Reddit Logo Component  
const RedditLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

// Telegram Logo Component
const TelegramLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
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
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);

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

  // Primary social options (always visible)
  const primaryOptions = [
    {
      name: 'X',
      icon: <XLogo />,
      url: `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=${hashtagString}`,
      bgColor: 'bg-gray-100 hover:bg-gray-200',
      textColor: 'text-gray-900'
    },
    {
      name: 'Facebook',
      icon: <Facebook size={18} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
      bgColor: 'bg-blue-100 hover:bg-blue-200',
      textColor: 'text-blue-700'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin size={18} />,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`,
      bgColor: 'bg-blue-100 hover:bg-blue-200',
      textColor: 'text-blue-600'
    }
  ];

  // Secondary social options (expandable)
  const secondaryOptions = [
    {
      name: 'Reddit',
      icon: <RedditLogo />,
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      bgColor: 'bg-orange-100 hover:bg-orange-200',
      textColor: 'text-orange-700'
    },
    {
      name: 'Telegram',
      icon: <TelegramLogo />,
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      bgColor: 'bg-sky-100 hover:bg-sky-200',
      textColor: 'text-sky-700'
    },
    {
      name: 'Email',
      icon: <Mail size={18} />,
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\nRead more: ${url}`)}`,
      bgColor: 'bg-gray-100 hover:bg-gray-200',
      textColor: 'text-gray-700',
      external: false
    }
  ];

  return (
    <div className={className}>
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
              max-height: 0;
            }
            to {
              opacity: 1;
              transform: translateY(0);
              max-height: 200px;
            }
          }
          
          .slide-down {
            animation: slideDown 0.3s ease-out;
          }
        `}
      </style>

      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Share this article:</h4>
      </div>

      {/* Primary Social Options + More Options Button */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Primary Social Icons */}
        {primaryOptions.map((option) => (
          <a
            key={option.name}
            href={option.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${option.bgColor} ${option.textColor} p-2 rounded-full transition-all hover:scale-105 group`}
            title={`Share on ${option.name}`}
          >
            <div className="group-hover:scale-110 transition-transform">
              {option.icon}
            </div>
          </a>
        ))}

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          className={`p-2 rounded-full transition-all hover:scale-105 ${
            copySuccess 
              ? 'bg-green-100 text-green-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title="Copy Link"
        >
          <Copy size={18} />
        </button>

        {/* More Options Button - Styled like other social icons */}
        <button
          onClick={() => setShowMoreOptions(!showMoreOptions)}
          className="bg-orange-100 text-orange-600 hover:bg-orange-200 p-2 rounded-full transition-all hover:scale-105 group"
          title="More sharing options"
        >
          <div className="group-hover:scale-110 transition-transform">
            {showMoreOptions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>
      </div>

      {/* Copy URL Section - Babylon Bee Style */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1 font-medium">Article URL:</div>
            <input
              type="text"
              value={url}
              readOnly
              className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded text-gray-700 font-mono focus:outline-none focus:ring-1 focus:ring-orange-300"
              onClick={(e) => e.currentTarget.select()}
            />
          </div>
          <button
            onClick={handleCopyLink}
            className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
              copySuccess 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-orange-100 text-orange-700 border border-orange-300 hover:bg-orange-200'
            }`}
          >
            {copySuccess ? 'Copied!' : 'Copy'}
          </button>
        </div>
        {copySuccess && (
          <p className="text-green-600 text-xs mt-2 font-medium">
            ✓ Link copied to clipboard!
          </p>
        )}
      </div>

      {/* Expandable Secondary Options - Stacked */}
      {showMoreOptions && (
        <div className="mt-4 space-y-2 slide-down">
          {secondaryOptions.map((option) => (
            <a
              key={option.name}
              href={option.url}
              target={option.external !== false ? "_blank" : undefined}
              rel={option.external !== false ? "noopener noreferrer" : undefined}
              className={`${option.bgColor} ${option.textColor} flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.02] group w-full`}
            >
              <div className="group-hover:scale-110 transition-transform">
                {option.icon}
              </div>
              <span className="text-sm font-medium">Share on {option.name}</span>
            </a>
          ))}
        </div>
      )}

      {/* Compact Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Help spread independent journalism
        </p>
      </div>
    </div>
  );
};

export default SocialShare;
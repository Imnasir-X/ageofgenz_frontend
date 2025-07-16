import React, { useState } from 'react';
import { Facebook, Mail, Linkedin, Copy, MessageCircle, Send } from 'lucide-react';

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

// WhatsApp Logo Component  
const WhatsAppLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.063"/>
  </svg>
);

// Telegram Logo Component
const TelegramLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

// Reddit Logo Component
const RedditLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
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
  const [shareCount, setShareCount] = useState<number>(0);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setShareCount(prev => prev + 1);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleShare = (platform: string) => {
    setShareCount(prev => prev + 1);
    
    // Track sharing analytics (you can implement actual tracking here)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: platform,
        content_type: 'article',
        item_id: url
      });
    }
  };

  // Generate hashtag string for social shares
  const hashtagString = hashtags.length > 0 ? hashtags.join(',') : 'GenZ,News,TheAgeOfGenZ';
  const shareText = `${title} via @theageofgenz`;
  const fullDescription = description || title;

  return (
    <div className={`${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Send size={18} className="text-orange-500" />
            Share this story
          </h4>
          {shareCount > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
              {shareCount} shares
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Facebook Share */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleShare('facebook')}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow-md"
            aria-label="Share on Facebook"
            title="Share on Facebook"
          >
            <Facebook size={16} />
            <span className="hidden sm:inline">Facebook</span>
          </a>

          {/* X (Twitter) Share */}
          <a
            href={`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}&hashtags=${hashtagString}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleShare('twitter')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow-md"
            aria-label="Share on X"
            title="Share on X"
          >
            <XLogo />
            <span className="hidden sm:inline">X</span>
          </a>

          {/* LinkedIn Share */}
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(fullDescription)}&source=TheAgeOfGenZ`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleShare('linkedin')}
            className="flex items-center gap-2 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow-md"
            aria-label="Share on LinkedIn"
            title="Share on LinkedIn"
          >
            <Linkedin size={16} />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>

          {/* WhatsApp Share */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleShare('whatsapp')}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow-md"
            aria-label="Share on WhatsApp"
            title="Share on WhatsApp"
          >
            <WhatsAppLogo />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* Telegram Share */}
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleShare('telegram')}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow-md"
            aria-label="Share on Telegram"
            title="Share on Telegram"
          >
            <TelegramLogo />
            <span className="hidden sm:inline">Telegram</span>
          </a>

          {/* Reddit Share */}
          <a
            href={`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleShare('reddit')}
            className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow-md"
            aria-label="Share on Reddit"
            title="Share on Reddit"
          >
            <RedditLogo />
            <span className="hidden sm:inline">Reddit</span>
          </a>

          {/* Email Share */}
          <a
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${fullDescription}\n\nRead the full article: ${url}\n\n— Shared from The Age of GenZ`)}`}
            onClick={() => handleShare('email')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow-md"
            aria-label="Share via Email"
            title="Share via Email"
          >
            <Mail size={16} />
            <span className="hidden sm:inline">Email</span>
          </a>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium text-sm shadow-sm hover:shadow-md ${
              copySuccess 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label="Copy article link"
            title="Copy Link"
          >
            <Copy size={16} />
            <span className="hidden sm:inline">
              {copySuccess ? 'Copied!' : 'Copy'}
            </span>
          </button>
        </div>
      </div>

      {/* Native Web Share API for mobile devices */}
      {typeof navigator !== 'undefined' && navigator.share && (
        <div className="mt-4 sm:hidden">
          <button
            onClick={async () => {
              try {
                await navigator.share({
                  title: title,
                  text: fullDescription,
                  url: url,
                });
                handleShare('native');
              } catch (err) {
                console.log('Error sharing:', err);
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            <Send size={18} />
            Share Article
          </button>
        </div>
      )}

      {copySuccess && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm font-medium flex items-center gap-2">
            <Copy size={16} />
            Link copied to clipboard! Share it anywhere.
          </p>
        </div>
      )}
    </div>
  );
};

export default SocialShare;
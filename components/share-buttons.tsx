'use client';

import { Twitter, Linkedin, Facebook, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const t = useTranslations('common.share');
  const [copied, setCopied] = useState(false);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t('linkCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('copyFailed'));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-muted-foreground">{t('label')}</span>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md p-2 transition-colors hover:bg-accent"
        aria-label={t('twitter')}
      >
        <Twitter className="h-5 w-5" />
      </a>

      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md p-2 transition-colors hover:bg-accent"
        aria-label={t('linkedin')}
      >
        <Linkedin className="h-5 w-5" />
      </a>

      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md p-2 transition-colors hover:bg-accent"
        aria-label={t('facebook')}
      >
        <Facebook className="h-5 w-5" />
      </a>

      <button
        onClick={copyToClipboard}
        className="rounded-md p-2 transition-colors hover:bg-accent"
        aria-label={t('copyLink')}
      >
        {copied ? <Check className="h-5 w-5 text-green-500" /> : <LinkIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}

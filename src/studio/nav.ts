import {
  BarChart3,
  FileText,
  FolderTree,
  HandCoins,
  Image,
  Mail,
  MessageSquareText,
  Radar,
  Settings,
  Sun,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  keywords?: string;
  group: 'Overview' | 'Content' | 'Audience' | 'System';
}

export const NAV: NavItem[] = [
  { to: '/studio', label: 'Today', icon: Sun, group: 'Overview', keywords: 'home brief queue approve' },
  { to: '/studio/analytics', label: 'Analytics', icon: BarChart3, group: 'Overview', keywords: 'charts views readers hours read time' },
  { to: '/studio/ask', label: 'Ask your data', icon: MessageSquareText, group: 'Overview', keywords: 'chat ai hermes question' },
  { to: '/studio/articles', label: 'Articles', icon: FileText, group: 'Content', keywords: 'posts stories editor publish' },
  { to: '/studio/newsroom', label: 'Newsroom', icon: Radar, group: 'Content', keywords: 'trends clusters hermes drafts runs cost' },
  { to: '/studio/categories', label: 'Categories', icon: FolderTree, group: 'Content', keywords: 'sections' },
  { to: '/studio/media', label: 'Media', icon: Image, group: 'Content', keywords: 'images library upload' },
  { to: '/studio/newsletter', label: 'Newsletter', icon: Mail, group: 'Audience', keywords: 'campaigns subscribers digest send' },
  { to: '/studio/donations', label: 'Donations', icon: HandCoins, group: 'Audience', keywords: 'money export csv' },
  { to: '/studio/users', label: 'Users', icon: Users, group: 'System', keywords: 'accounts disable' },
  { to: '/studio/settings', label: 'Settings', icon: Settings, group: 'System', keywords: 'site maintenance' },
];

export const NAV_GROUPS = ['Overview', 'Content', 'Audience', 'System'] as const;

export const isActive = (pathname: string, to: string) =>
  to === '/studio' ? pathname.replace(/\/$/, '') === '/studio' : pathname === to || pathname.startsWith(`${to}/`);

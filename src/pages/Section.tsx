import { SectionPage } from '@/components/news/SectionPage';
import { SECTIONS } from '@/constants/sections';
import NotFound from './NotFound';

/** Trending, Opinion, AI, Culture, Politics, World, Sports, Insights, Memes and the top-level category URLs. */
export default function Section({ sectionKey }: { sectionKey: string }) {
  const section = SECTIONS[sectionKey];
  if (!section) return <NotFound />;
  return <SectionPage key={sectionKey} section={section} />;
}

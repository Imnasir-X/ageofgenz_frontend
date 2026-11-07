import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SeoContext } from './context';
import { applySeoTags, buildSeoTags, type SeoProps } from './seo-core';

/** Document head for a page: collected during prerender, applied to <head> on the client. */
export function Seo(props: SeoProps) {
  const collector = useContext(SeoContext);
  const { pathname } = useLocation();
  if (collector) {
    collector.props = props;
    collector.path = pathname;
  }
  const key = JSON.stringify(props);
  useEffect(() => {
    applySeoTags(buildSeoTags(JSON.parse(key) as SeoProps, pathname));
  }, [key, pathname]);
  return null;
}

import React from 'react';
import CategoryPage from '../components/CategoryPage';
import { CATEGORY_SLUGS } from '../constants/categories';

const Insights: React.FC = () => {
  return (
    <CategoryPage
      slug={CATEGORY_SLUGS.insights}
      title="Insights"
      description="Charts, workflows, and deep dives into the trends shaping Gen Z's world."
      metaTitle="Insights | The Age of GenZ"
      metaDescription="Latest insights and analysis: data stories, workflows, and research."
      emptyMessage="No insights available yet."
    />
  );
};

export default Insights;

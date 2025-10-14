import React from 'react';
import CategoryPage from '../components/CategoryPage';
import { CATEGORY_SLUGS } from '../constants/categories';

const AI: React.FC = () => {
  return (
    <CategoryPage
      slug={CATEGORY_SLUGS.ai}
      title="AI & Technology"
      description="Exploring artificial intelligence, machine learning, and the future of technology through a Gen Z perspective."
      metaTitle="AI & Technology | The Age of GenZ"
      metaDescription="Latest AI and technology news, analysis, and trends for Gen Z."
      emptyMessage="No AI articles available yet."
    />
  );
};

export default AI;

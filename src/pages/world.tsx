import React from 'react';
import CategoryPage from '../components/CategoryPage';
import { CATEGORY_SLUGS } from '../constants/categories';

const World: React.FC = () => {
  return (
    <CategoryPage
      slug={CATEGORY_SLUGS.world}
      title="World News"
      description="Global perspectives, breaking news, and international affairs — understanding our interconnected world."
      metaTitle="World News | The Age of GenZ"
      metaDescription="Latest world news and global coverage from a Gen Z perspective."
      emptyMessage="No world news articles available yet."
    />
  );
};

export default World;

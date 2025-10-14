import React from 'react';
import CategoryPage from '../components/CategoryPage';
import { CATEGORY_SLUGS } from '../constants/categories';

const Politics: React.FC = () => {
  return (
    <CategoryPage
      slug={CATEGORY_SLUGS.politics}
      title="Politics Unraveled"
      description="Deep dives into policies, campaigns, and movements — exploring the political landscape through a Gen Z lens."
      metaTitle="Politics | The Age of GenZ"
      metaDescription="Latest politics stories: campaigns, policy, global affairs, and Gen Z perspectives."
      emptyMessage="No politics articles available yet."
    />
  );
};

export default Politics;

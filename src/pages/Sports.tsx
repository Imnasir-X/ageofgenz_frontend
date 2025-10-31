import React from 'react';
import CategoryPage from '../components/CategoryPage';

const Sports: React.FC = () => {
  return (
    <CategoryPage
      slug="sports"
      title="Sports Central"
      description="From game-changing plays to athlete activism — covering sports that matter to the next generation."
      metaTitle="Sports | The Age of GenZ"
      metaDescription="Latest sports stories: scores, culture, athletes, and Gen Z sports trends."
      emptyMessage="No sports articles available yet."
    />
  );
};

export default Sports;

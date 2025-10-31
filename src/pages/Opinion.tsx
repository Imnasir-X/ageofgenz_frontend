import React from 'react';
import CategoryPage from '../components/CategoryPage';

const Opinion: React.FC = () => {
  return (
    <CategoryPage
      slug="opinion"
      title="Opinion & Analysis"
      description="Fresh perspectives, hot takes, and thoughtful analysis — where Gen Z voices shape the conversation."
      metaTitle="Opinion | The Age of GenZ"
      metaDescription="Latest opinion and analysis: commentary, perspectives, and editorials from a Gen Z lens."
      emptyMessage="No opinions yet."
    />
  );
};

export default Opinion;

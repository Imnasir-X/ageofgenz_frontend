import React from 'react';
import CategoryPage from '../components/CategoryPage';
import { CATEGORY_SLUGS } from '../constants/categories';

const Culture: React.FC = () => {
  return (
    <CategoryPage
      slug={CATEGORY_SLUGS.culture}
      title="Culture Unleashed"
      description="Art, music, fashion, and the trends defining Gen Z. This is where culture gets loud and proud."
      metaTitle="Culture | The Age of GenZ"
      metaDescription="Latest culture stories: music, fashion, art, and internet trends."
      emptyMessage="No culture articles available yet."
    />
  );
};

export default Culture;

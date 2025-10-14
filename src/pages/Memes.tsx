import React from 'react';
import CategoryPage from '../components/CategoryPage';
import { CATEGORY_SLUGS } from '../constants/categories';

const Memes: React.FC = () => {
  return (
    <CategoryPage
      slug={CATEGORY_SLUGS.memes}
      title="Meme Central"
      description="The funniest, most viral memes Gen Z can't stop sharing. Laugh, relate, repeat."
      metaTitle="Memes | The Age of GenZ"
      metaDescription="Latest meme culture: viral posts, internet trends, and Gen Z humor."
      emptyMessage="No memes available yet."
    />
  );
};

export default Memes;

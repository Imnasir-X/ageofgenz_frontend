import React from 'react';
import { Navigate } from 'react-router-dom';
import { resolveCategorySlug } from '../constants/categories';

const target = resolveCategorySlug('memes');

const Memes: React.FC = () => <Navigate to={`/category/${target.slug}`} replace />;

export default Memes;

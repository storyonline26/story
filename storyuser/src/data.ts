import { UserProfile } from './types';

export const INITIAL_USER_PROFILE: UserProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  language: 'ENGLISH',
  newsletter: false
};

export const INSTANT_ADDRESSES = [];

// Products, categories and trending tags are loaded from the API.
// These static arrays are intentionally empty.
export const PRODUCTS = [];
export const TRENDING_TAGS: string[] = [];
export const CATEGORIES: string[] = [];

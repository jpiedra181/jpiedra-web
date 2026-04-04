export type Lang = 'es' | 'en';

export interface Project {
  slug: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  link: string;
}

export interface ApproachStep {
  number: string;
  title: string;
  description: string;
}

export interface NavItem {
  href: string;
  label: string;
}

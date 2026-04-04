export interface Translations {
  nav: {
    about: string;
    approach: string;
    projects: string;
    contact: string;
  };
  hero: {
    label: string;
    title: string;
    subtitle: string;
    cta: string;
    tags: string[];
  };
  about: {
    label: string;
    title: string;
    text: string;
  };
  approach: {
    label: string;
    title: string;
    steps: {
      title: string;
      description: string;
    }[];
  };
  projects: {
    label: string;
    title: string;
    cta: string;
    items: {
      category: string;
      title: string;
      description: string;
      tags: string[];
    }[];
  };
  contact: {
    label: string;
    title: string;
    subtitle: string;
    cta: string;
    form: {
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      message: string;
      messagePlaceholder: string;
      submit: string;
      sending: string;
      success: string;
      error: string;
    };
  };
  footer: {
    available: string;
    rights: string;
  };
}

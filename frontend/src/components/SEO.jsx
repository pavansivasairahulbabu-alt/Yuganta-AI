import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({ 
  title = 'YugantaAI - AI & Technology Learning Platform',
  description = 'Master AI and technology skills with expert-led courses and mentorship programs.',
  keywords = 'AI courses, machine learning, technology training, online learning',
  image = '/yuganta-logo.png',
  url = ''
}) => {
  const location = useLocation();
  const fullUrl = `https://yugantaai.com${url || location.pathname}`;

  useEffect(() => {
    // Update title
    document.title = title;

    // Update meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: `https://yugantaai.com${image}` },
      { property: 'og:url', content: fullUrl },
      { property: 'twitter:title', content: title },
      { property: 'twitter:description', content: description },
      { property: 'twitter:image', content: `https://yugantaai.com${image}` },
      { property: 'twitter:url', content: fullUrl },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let element = document.querySelector(selector);
      
      if (!element) {
        element = document.createElement('meta');
        if (name) element.setAttribute('name', name);
        if (property) element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    });

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);
  }, [title, description, keywords, image, fullUrl]);

  return null;
};

export default SEO;

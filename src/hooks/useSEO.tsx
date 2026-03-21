import { useEffect } from "react";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
}

const SITE_URL = "https://qurapp.com";
const DEFAULT_TITLE = "QurApp - #1 Islamic Social Media App | Connect Through the Holy Quran";
const DEFAULT_DESCRIPTION = "Join millions of Muslims worldwide in live audio rooms. Recite, listen, and discuss the Holy Quran together in a beautiful spiritual community.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_KEYWORDS = "Islamic app, Quran app, Muslim social media, Islamic community, Quran recitation, Islamic audio rooms, Muslim networking, Quran study, Islamic learning";

export const useSEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  noindex = false,
}: SEOProps = {}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | QurApp` : DEFAULT_TITLE;
    const finalDescription = description || DEFAULT_DESCRIPTION;
    const finalKeywords = keywords || DEFAULT_KEYWORDS;
    const finalImage = image || DEFAULT_IMAGE;
    const finalUrl = url ? `${SITE_URL}${url}` : SITE_URL;

    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute("content", content);
    };

    // Primary meta tags
    updateMetaTag("title", fullTitle);
    updateMetaTag("description", finalDescription);
    updateMetaTag("keywords", finalKeywords);
    updateMetaTag("robots", noindex ? "noindex, nofollow" : "index, follow");

    // Open Graph tags
    updateMetaTag("og:title", fullTitle, true);
    updateMetaTag("og:description", finalDescription, true);
    updateMetaTag("og:image", finalImage, true);
    updateMetaTag("og:url", finalUrl, true);
    updateMetaTag("og:type", type, true);

    // Twitter tags
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", finalDescription);
    updateMetaTag("twitter:image", finalImage);
    updateMetaTag("twitter:card", "summary_large_image");

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", finalUrl);

    // Cleanup function (optional, for component unmount)
    return () => {
      // Optionally reset to defaults on unmount if needed
    };
  }, [title, description, keywords, image, url, type, noindex]);
};


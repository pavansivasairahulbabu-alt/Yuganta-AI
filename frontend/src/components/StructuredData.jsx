export default function StructuredData() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Yuganta AI",
        "url": "https://yugantaai.com",
        "logo": "https://yugantaai.com/yuganta-logo.png",
        "sameAs": [
            "https://www.linkedin.com/company/yugantaai",
            "https://twitter.com/yugantaai",
            "https://www.instagram.com/yugantaai"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-8978946421",
            "contactType": "customer service",
            "areaServed": "IN",
            "availableLanguage": "en"
        }
    };

    const websiteData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Yuganta AI",
        "url": "https://yugantaai.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://yugantaai.com/courses?search={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify([structuredData, websiteData]),
            }}
        />
    );
}

import React from "react";
import Head from "next/head";

const SITE_NAME = "Urva Gandhi Portfolio";
const DOMAIN = "https://urvagandhi.tech";
const DEFAULT_IMAGE = `${DOMAIN}/images/profile/urva.png`;

const BRAND_KEYWORDS = [
  "Urva Gandhi",
  "Urva Gandhi Portfolio",
  "Urva Yogeshkumar Gandhi",
  "software engineer",
  "AI engineer",
  "full-stack developer",
  "Java",
  "Spring Boot",
  "Nirma University",
];

const Seo = ({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  keywords = [],
  breadcrumb,
  noindex = false,
}) => {
  const url = `${DOMAIN}${path}`;
  const headTitle = title;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: headTitle,
        description,
        isPartOf: { "@id": `${DOMAIN}/#website` },
        about: { "@id": `${DOMAIN}/#person` },
        ...(image ? { primaryImageOfPage: image } : {}),
      },
      ...(breadcrumb
        ? [
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: `${DOMAIN}/`,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: breadcrumb,
                  item: url,
                },
              ],
            },
          ]
        : []),
    ],
  };

  return (
    <Head>
      <title>{headTitle}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        }
      />
      <meta
        name="keywords"
        content={[...BRAND_KEYWORDS, ...keywords].join(", ")}
      />
      <meta name="author" content="Urva Yogeshkumar Gandhi" />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={headTitle} />
      <meta property="og:description" content={description} />
      {image && (
        <>
          <meta property="og:image" content={image} />
          <meta
            property="og:image:alt"
            content="Urva Gandhi — Software & AI Systems Engineer"
          />
        </>
      )}
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={headTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      <meta name="twitter:creator" content="@urvagandhi" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Head>
  );
};

export default Seo;

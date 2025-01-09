export default [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:", "http"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "https://hmweb-dev-bucket.s3.us-west-2.amazonaws.com",
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "https://hmweb-dev-bucket.s3.us-west-2.amazonaws.com",
          ],
          upgradeInsecureRequests: null,
        },
      },
      cors: {
        origin: [
          "http://localhost:3000",
          "http://localhost:1337",
          "htttp://localhost:5173",
          "https://aeroconsultant.fr",
        ],
      },
    },
  },
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];

// src/index.ts (or index.js)
import { Core } from "@strapi/strapi";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

// Strapi v4 extension file
export default {
  /**
   * The register function (called before bootstrap).
   * In a *vanilla* Strapi v4, the DB is usually already initialized by this time.
   */
  async register({ strapi }: { strapi: Core.Strapi }) {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    try {
      // 1. Fetch secrets from AWS
      const secretsClient = new SecretsManagerClient({
        region: process.env.AWS_REGION || "us-west-2",
      });

      const response = await secretsClient.send(
        new GetSecretValueCommand({
          SecretId: "my-rds-secret",
          VersionStage: "AWSCURRENT",
        })
      );

      // 2. Update strapi.config if we got our secrets
      if (response.SecretString) {
        const { host, port, username, password, dbname } = JSON.parse(
          response.SecretString
        );

        // Overwrite Strapi config in memory
        strapi.config.set("database.connection.client", "postgres");
        strapi.config.set("database.connection.connection.host", host);
        strapi.config.set(
          "database.connection.connection.port",
          parseInt(port, 10)
        );
        strapi.config.set("database.connection.connection.database", dbname);
        strapi.config.set("database.connection.connection.user", username);
        strapi.config.set("database.connection.connection.password", password);

        // If you need SSL
        strapi.config.set("database.connection.connection.ssl", {
          rejectUnauthorized: false,
        });

        // 3. Force Strapi to re-initialize DB
        //    (this is the "hacky" part; not officially recommended)
        // if (strapi.db && strapi.db.connection) {
        //   await strapi.db.connection.destroy();
        //   await strapi.db.init()
        // }
      }
    } catch (error) {
      console.error("Failed to fetch secrets in register():", error);
      throw error; // or gracefully handle
    }
  },

  /**
   * The bootstrap function (called right after register()).
   * By now the DB is definitely initialized (or re-initialized).
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Any code that needs the DB after re-init
  },
};

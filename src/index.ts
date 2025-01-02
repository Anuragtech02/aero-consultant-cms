import { Core } from "@strapi/strapi";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // Your register implementation here
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    if (process.env.NODE_ENV === "production") {
      try {
        const client = new SecretsManagerClient({
          region: process.env.AWS_REGION || "us-west-2",
        });

        const response = await client.send(
          new GetSecretValueCommand({
            SecretId: "hmweb-dev-rds",
            VersionStage: "AWSCURRENT",
          })
        );

        if (response.SecretString) {
          const { host, port, username, password, dbname } = JSON.parse(
            response.SecretString
          );

          // Set the database configuration
          strapi.config.set("database.connection.client", "postgres");
          strapi.config.set("database.connection.connection.host", host);
          strapi.config.set(
            "database.connection.connection.port",
            parseInt(port)
          );
          strapi.config.set("database.connection.connection.database", dbname);
          strapi.config.set("database.connection.connection.user", username);
          strapi.config.set(
            "database.connection.connection.password",
            password
          );

          // Optional: Set SSL configuration if needed
          strapi.config.set("database.connection.connection.ssl", {
            rejectUnauthorized: true,
          });
        }
      } catch (error) {
        console.error("Failed to fetch database secrets:", error);
        throw error;
      }
    }
  },
};

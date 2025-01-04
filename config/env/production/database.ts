/**
 * config/env/production/database.ts
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export default async ({ env }) => {
  // Default, in case fetching secrets fails or we’re not in production
  let client = env("DATABASE_CLIENT", "postgres");
  let host = env("DATABASE_HOST", "localhost");
  let port = env.int("DATABASE_PORT", 5432);
  let database = env("DATABASE_NAME", "strapi");
  let user = env("DATABASE_USERNAME", "strapi");
  let password = env("DATABASE_PASSWORD", "strapi");
  let ssl = env.bool("DATABASE_SSL", false) && {
    rejectUnauthorized: env.bool("DATABASE_SSL_REJECT_UNAUTHORIZED", true),
  };

  // Only fetch Secrets in production
  if (env("NODE_ENV") === "production") {
    try {
      const secretsClient = new SecretsManagerClient({
        region: env("AWS_REGION", "us-west-2"),
      });
      const command = new GetSecretValueCommand({
        SecretId: "hmweb-dev-rds",
        VersionStage: "AWSCURRENT",
      });
      const response = await secretsClient.send(command);

      if (response.SecretString) {
        const parsed = JSON.parse(response.SecretString);
        // Overwrite defaults with secrets
        client = "postgres";
        host = parsed.host;
        port = parseInt(parsed.port, 10);
        database = parsed.dbname;
        user = parsed.username;
        password = parsed.password;

        // If you want SSL in production, enable it here:
        ssl = {
          rejectUnauthorized: env.bool(
            "DATABASE_SSL_REJECT_UNAUTHORIZED",
            false
          ),
        };
      }
    } catch (error) {
      console.error("Failed to fetch RDS secrets from Secrets Manager:", error);
      // Optionally throw error so Strapi will stop if DB config can’t load
      throw error;
    }
  }

  // Return the final DB configuration to Strapi
  return {
    connection: {
      client,
      connection: {
        host,
        port,
        database,
        user,
        password,
        ssl,
      },
      pool: {
        min: env.int("DATABASE_POOL_MIN", 2),
        max: env.int("DATABASE_POOL_MAX", 10),
      },
    },
  };
};

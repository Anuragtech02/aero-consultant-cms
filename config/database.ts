import path from "path";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const getSecret = async () => {
  const client = new SecretsManagerClient({
    region: process.env.AWS_REGION || "us-west-2",
  });

  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: "hmweb-dev-rds",
        VersionStage: "AWSCURRENT",
      })
    );

    if (response.SecretString) {
      return JSON.parse(response.SecretString);
    }
  } catch (error) {
    console.error("Error fetching secret:", error);
    throw error;
  }
};

export default async ({ env }) => {
  const client = env("DATABASE_CLIENT", "postgres");

  // Fetch secrets in production environment
  let dbConfig = {};
  if (env("NODE_ENV") === "production") {
    try {
      const dbSecret = await getSecret();
      dbConfig = {
        host: dbSecret.host,
        port: parseInt(dbSecret.port),
        database: dbSecret.dbname,
        user: dbSecret.username,
        password: dbSecret.password,
      };
    } catch (error) {
      console.error("Failed to fetch database secrets:", error);
      // Fallback to environment variables if secrets fetch fails
      dbConfig = {
        host: env("DATABASE_HOST", "localhost"),
        port: env.int("DATABASE_PORT", 5432),
        database: env("DATABASE_NAME", "strapi"),
        user: env("DATABASE_USERNAME", "strapi"),
        password: env("DATABASE_PASSWORD", "strapi"),
      };
    }
  } else {
    // Use environment variables for non-production environments
    dbConfig = {
      host: env("DATABASE_HOST", "localhost"),
      port: env.int("DATABASE_PORT", 5432),
      database: env("DATABASE_NAME", "strapi"),
      user: env("DATABASE_USERNAME", "strapi"),
      password: env("DATABASE_PASSWORD", "strapi"),
    };
  }

  const connections = {
    postgres: {
      connection: {
        ...dbConfig,
        connectionString: env("DATABASE_URL"),
        ssl: env.bool("DATABASE_SSL", false) && {
          key: env("DATABASE_SSL_KEY", undefined),
          cert: env("DATABASE_SSL_CERT", undefined),
          ca: env("DATABASE_SSL_CA", undefined),
          capath: env("DATABASE_SSL_CAPATH", undefined),
          cipher: env("DATABASE_SSL_CIPHER", undefined),
          rejectUnauthorized: env.bool(
            "DATABASE_SSL_REJECT_UNAUTHORIZED",
            true
          ),
        },
        schema: env("DATABASE_SCHEMA", "public"),
      },
      pool: {
        min: env.int("DATABASE_POOL_MIN", 2),
        max: env.int("DATABASE_POOL_MAX", 10),
      },
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
    },
  };
};

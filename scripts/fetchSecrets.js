const fs = require("fs");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

(async () => {
  try {
    // Read existing .env file if it exists
    let existingEnv = {};
    try {
      const envContent = fs.readFileSync(".env", "utf8");
      existingEnv = envContent.split("\n").reduce((acc, line) => {
        const [key, value] = line.split("=");
        if (key && value) {
          acc[key.trim()] = value.trim();
        }
        return acc;
      }, {});
    } catch (err) {
      // File doesn't exist or can't be read, continue with empty object
    }

    // Use instance role credentials automatically
    const client = new SecretsManagerClient({
      region: process.env.AWS_REGION || "us-west-2",
    });

    const { SecretString } = await client.send(
      new GetSecretValueCommand({
        SecretId: "hmweb-dev-rds",
        VersionStage: "AWSCURRENT",
      })
    );

    if (SecretString) {
      const {
        host,
        port,
        username,
        password,
        dbInstanceIdentifier: dbname,
      } = JSON.parse(SecretString);

      // Merge new values with existing ones
      const newEnv = {
        ...existingEnv,
        DATABASE_HOST: host,
        DATABASE_PORT: port,
        DATABASE_USERNAME: username,
        DATABASE_PASSWORD: password,
        DATABASE_NAME: dbname,
        DATABASE_CLIENT: "postgres",
        DATABASE_SSL_REJECT_UNAUTHORIZED: "false",
      };

      // Convert back to .env format
      const lines = Object.entries(newEnv).map(
        ([key, value]) => `${key}=${value}`
      );
      fs.writeFileSync(".env", lines.join("\n"));
      console.log("Successfully updated .env file with database credentials");
    }
  } catch (error) {
    console.error("Error fetching secrets:", error);
    process.exit(1);
  }
})();

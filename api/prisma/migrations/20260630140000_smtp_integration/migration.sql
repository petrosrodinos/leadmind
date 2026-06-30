-- AlterEnum
ALTER TYPE "ExternalIntegrationProvider" ADD VALUE 'SMTP';

-- AlterEnum
ALTER TYPE "IntegrationKeyType" ADD VALUE 'HOST';
ALTER TYPE "IntegrationKeyType" ADD VALUE 'PORT';
ALTER TYPE "IntegrationKeyType" ADD VALUE 'USERNAME';
ALTER TYPE "IntegrationKeyType" ADD VALUE 'PASSWORD';
ALTER TYPE "IntegrationKeyType" ADD VALUE 'FROM_EMAIL';

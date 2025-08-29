// lib/dynamodb.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * Región:
 * - Prioriza la específica de DynamoDB si existe
 * - Luego usa AWS_REGION o la de S3 como fallback
 * - Default: us-east-2
 */
const region =
  process.env.AWS_DYNAMODB_REGION ||
  process.env.AWS_REGION ||
  process.env.AWS_S3_REGION ||
  "us-east-2";

/**
 * Credenciales:
 * - Toma AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY si existen (convención estándar)
 * - Si no, intenta con las específicas de DynamoDB o S3
 * - Si no hay ninguna, deja `credentials` undefined para usar Default Provider Chain
 *   (perfil local, IAM Role, etc.)
 */
function resolveCredentials():
  | { accessKeyId: string; secretAccessKey: string }
  | undefined {
  const accessKeyId =
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.AWS_DYNAMODB_ACCESS_KEY_ID ||
    process.env.AWS_S3_ACCESS_KEY_ID;

  const secretAccessKey =
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.AWS_DYNAMODB_SECRET_ACCESS_KEY ||
    process.env.AWS_S3_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey) {
    return { accessKeyId, secretAccessKey };
  }
  return undefined; // Default Provider Chain (útil en local con perfil o en Lambda con role)
}

/**
 * Cliente base y DocumentClient con marshall que ignora undefined.
 */
export const ddbRaw = new DynamoDBClient({
  region,
  credentials: resolveCredentials(),
});

export const ddb = DynamoDBDocumentClient.from(ddbRaw, {
  marshallOptions: { removeUndefinedValues: true },
});

// Alias por compatibilidad
export const ddbDocClient = ddb;

/* =========================
 * NOMBRES DE TABLAS
 * =========================
 * Ajusta estos valores en .env.local si tu tabla se llama distinto.
 * Usa SIEMPRE las mismas constantes en tus APIs para evitar “tabla no encontrada”.
 */

// Mentoría (perfiles, disponibilidad, reservas)
export const TABLE_PROFILES =
  process.env.NEXT_PUBLIC_DYNAMODB_PROFILES_TABLE_NAME || "MentorAppProfiles";

export const TABLE_AVAILABILITY =
  process.env.DYNAMODB_AVAILABILITY_TABLE_NAME || "MentorAvailability";

export const TABLE_BOOKINGS =
  process.env.DYNAMODB_BOOKINGS_TABLE_NAME || "Bookings";

// Marketplace
export const TABLE_MARKETPLACE_PROVIDERS =
  process.env.DYNAMODB_MARKETPLACE_PROVIDERS_TABLE_NAME ||
  "MarketplaceProviders";
export const TABLE_MARKETPLACE_SERVICES =
  process.env.DYNAMODB_MARKETPLACE_SERVICES_TABLE_NAME ||
  "MarketplaceServices";
export const TABLE_MARKETPLACE_CONTACTS =
  process.env.DYNAMODB_MARKETPLACE_CONTACTS_TABLE_NAME ||
  "MarketplaceContacts";

// Google OAuth / Calendar
export const TABLE_GOOGLE_TOKENS =
  process.env.DYNAMODB_GOOGLE_TOKENS_TABLE_NAME || "GoogleOAuthTokens";

// Notificaciones
export const TABLE_NOTIFS =
  process.env.DYNAMODB_NOTIFS_TABLE_NAME || "Notifications";

// Back-compat (si algún código viejo usa TABLE_AVAIL)
export const TABLE_AVAIL = TABLE_AVAILABILITY;

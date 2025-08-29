// pages/api/marketplace/marketplace/contacts/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const TABLE = process.env.DYNAMODB_MARKETPLACE_CONTACTS_TABLE_NAME!;
const region = process.env.AWS_DYNAMODB_REGION || process.env.AWS_S3_REGION || "us-east-2";
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  if (!TABLE) return res.status(500).json({ error: "TABLE env missing" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { providerId, serviceId, name, email, message } = body || {};
    if (!providerId || !name || !email || !message) return res.status(400).json({ error: "missing fields" });

    const ts = Date.now();
    const createdAtId = `ts#${ts}#${randomUUID()}`;
    const item = {
      providerId, createdAtId,
      senderUserId: (req.headers["x-user-id"] as string) || null,
      serviceId: serviceId || null,
      name, email, message,
      status: "new",
      createdAt: ts,
    };

    await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message || "contact error" });
  }
}

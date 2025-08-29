import type { NextApiRequest, NextApiResponse } from "next";
import { ddb } from "../../../lib/dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { requireUserId } from "../util/getUserId";

const TABLE_ORDERS = process.env.DYNAMODB_PAYMENTS_ORDERS_TABLE_NAME || "PaymentsOrders";
const GSI_BY_USER = "GSI1"; // crea un índice: PK=userId, SK=createdAt

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const q = await ddb.send(new QueryCommand({
      TableName: TABLE_ORDERS,
      IndexName: GSI_BY_USER,
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: { ":u": userId },
      ScanIndexForward: false, // más recientes primero
      Limit: 100,
    }));
    res.status(200).json({ items: q.Items || [] });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "No se pudieron obtener tus pagos" });
  }
}

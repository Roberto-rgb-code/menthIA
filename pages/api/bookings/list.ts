// pages/api/bookings/list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_BOOKINGS } from "../../../lib/dynamodb";

const IDX_MENTOR = process.env.DYNAMODB_BOOKINGS_MENTOR_GSI || "byMentor";
const IDX_MENTEE = process.env.DYNAMODB_BOOKINGS_MENTEE_GSI || "byMentee";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const { mentorId, menteeId, from, to } = req.query as { mentorId?: string; menteeId?: string; from?: string; to?: string };
    if (!mentorId && !menteeId) return res.status(400).json({ error: "mentorId o menteeId requerido" });

    const rangeFrom = (from && String(from)) || "0000-01-01T00:00:00";
    const rangeTo   = (to && String(to))   || "9999-12-31T23:59:59";

    if (mentorId) {
      try {
        const q = await ddb.send(new QueryCommand({
          TableName: TABLE_BOOKINGS,
          IndexName: IDX_MENTOR,
          KeyConditionExpression: "mentorId = :m AND startISO BETWEEN :a AND :b",
          ExpressionAttributeValues: { ":m": mentorId, ":a": rangeFrom, ":b": rangeTo },
          ScanIndexForward: true,
          Limit: 200,
        }));
        return res.status(200).json({ items: q.Items || [] });
      } catch (e: any) {
        // Fallback (dev) sin GSI
        if (String(e?.message || "").includes("index") || e?.name === "ValidationException") {
          const s = await ddb.send(new ScanCommand({ TableName: TABLE_BOOKINGS }));
          const all = (s.Items || []).filter(it => it.mentorId === mentorId);
          all.sort((a:any,b:any)=> String(a.startISO).localeCompare(String(b.startISO)));
          return res.status(200).json({ items: all });
        }
        throw e;
      }
    }

    if (menteeId) {
      try {
        const q = await ddb.send(new QueryCommand({
          TableName: TABLE_BOOKINGS,
          IndexName: IDX_MENTEE,
          KeyConditionExpression: "menteeId = :m AND startISO BETWEEN :a AND :b",
          ExpressionAttributeValues: { ":m": menteeId, ":a": rangeFrom, ":b": rangeTo },
          ScanIndexForward: true,
          Limit: 200,
        }));
        return res.status(200).json({ items: q.Items || [] });
      } catch (e: any) {
        // Fallback (dev) sin GSI
        if (String(e?.message || "").includes("index") || e?.name === "ValidationException") {
          const s = await ddb.send(new ScanCommand({ TableName: TABLE_BOOKINGS }));
          const all = (s.Items || []).filter(it => it.menteeId === menteeId);
          all.sort((a:any,b:any)=> String(a.startISO).localeCompare(String(b.startISO)));
          return res.status(200).json({ items: all });
        }
        throw e;
      }
    }
  } catch (e: any) {
    console.error("bookings list error", e);
    return res.status(500).json({ error: "Server error" });
  }
}

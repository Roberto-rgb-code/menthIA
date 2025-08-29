import { ddb, TABLE_PROFILES } from "./dynamodb";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export async function getMentorProfile(userId: string) {
  const r = await ddb.send(new GetCommand({
    TableName: TABLE_PROFILES,
    Key: { userId },
  }));
  return r.Item as any | undefined;
}

export async function saveMentorStripeAccount(userId: string, stripeAccountId: string) {
  await ddb.send(new UpdateCommand({
    TableName: TABLE_PROFILES,
    Key: { userId },
    UpdateExpression: "SET stripeAccountId = :a",
    ExpressionAttributeValues: { ":a": stripeAccountId },
  }));
}

import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { amount, fromChain, toChain } = body;

    if (!amount) {
      return NextResponse.json({ error: "Amount required" }, { status: 400 });
    }

    // Call Circle API FROM SERVER (no CORS issue)
    const response = await fetch(
      `https://iris-api-sandbox.circle.com/v2/burn/USDC/fees/${amount}/26`,
    );

    const data = await response.json();

    // Optional: store in MongoDB
    const client = await clientPromise;
    const db = client.db("bridge");
    await db.collection("estimates").insertOne({
      amount,
      fromChain,
      toChain,
      response: data,
      createdAt: new Date(),
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("Estimate API error:", err);
    return NextResponse.json({ error: "Failed to estimate" }, { status: 500 });
  }
}

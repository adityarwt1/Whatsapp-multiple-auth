import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {

    return NextResponse.json({ message: "Boiler plate of next js" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
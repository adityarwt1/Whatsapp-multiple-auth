import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    return NextResponse.json(
      { message: "Finally communitcated with api", username },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { errro: (error as Error).message },
      { status: 500 }
    );
  }
}

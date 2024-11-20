import { NextResponse } from "next/server";

export async function GET(request: Request, context: any) {
  const { searchParams } = new URL(request.url);
  const activityId = searchParams.get("activity_id");

  try {
    const countryActivity = await prisma.countryActivity.findFirst({
      where: {
        activityId: activityId,
      },
      include: {
        country: {
          include: {
            languages: true,
          },
        },
        campaign: true,
      },
    });

    console.log("countryActivity", countryActivity);

    if (!countryActivity) {
      return NextResponse.json(
        { message: "CountryActivity not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json(
      { item: countryActivity },
      { status: 200 }
    );
    response.headers.set("Cache-Control", "public, max-age=3600");
    return response;
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

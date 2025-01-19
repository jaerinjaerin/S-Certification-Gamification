import { NextResponse } from "next/server";

type Handler = (req: Request) => Promise<NextResponse>;

export function withCors(handler: Handler): Handler {
  return async (req: Request): Promise<NextResponse> => {
    const allowedOrigins = [process.env.NEXT_PUBLIC_API_URL];
    const origin = req.headers.get("origin");

    console.log("origin: ", origin, allowedOrigins);

    // Origin이 없거나 허용되지 않은 경우 처리
    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 실제 핸들러 실행
    const response = await handler(req);

    // CORS 헤더 추가
    response.headers.set(
      "Access-Control-Allow-Origin",
      process.env.NEXT_PUBLIC_API_URL!
    ); // Origin이 없으면 '*' 허용
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");

    return response;
  };
}

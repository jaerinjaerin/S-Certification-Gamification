import { NextResponse } from "next/server";

type Handler = (req: Request) => Promise<NextResponse>;

export function withCors(handler: Handler): Handler {
  return async (req: Request): Promise<NextResponse> => {
    const allowedOrigins = [process.env.NEXT_PUBLIC_API_URL!];
    const origin = req.headers.get("origin");
    // const protocol = req.headers.get("x-forwarded-proto") || "http";
    // const host = req.headers.get("host");

    // 프로토콜 + 호스트 조합
    // const fullHost = `${protocol}://${host}`;

    console.log("origin: ", origin, allowedOrigins);

    // 요청의 origin 또는 fullHost가 허용되지 않은 경우 처리
    // if (
    //   // origin &&
    //   // !allowedOrigins.includes(origin) &&
    //   !allowedOrigins.includes(fullHost)
    // ) {
    //   return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    // }
    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 실제 핸들러 실행
    const response = await handler(req);

    // CORS 헤더 추가
    response.headers.set(
      "Access-Control-Allow-Origin",
      process.env.NEXT_PUBLIC_API_URL!
    );
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

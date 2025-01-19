export function withCors(handler) {
  return async (req, res) => {
    const allowedOrigin = process.env.NEXT_PUBLIC_API_URL;
    const origin = req.headers.origin;

    if (origin !== allowedOrigin) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // OPTIONS 요청에 대한 응답
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    return handler(req, res);
  };
}

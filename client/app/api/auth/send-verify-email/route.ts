import { prisma } from "@/prisma-client";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

const sesClient =
  process.env.NODE_ENV !== "production"
    ? new SESClient({
        region: process.env.AWS_SES_REGION,
        credentials: {
          accessKeyId: process.env.AWS_SES_IAM_ACCESS_KEY!,
          secretAccessKey: process.env.AWS_SES_IAM_SECRET_KEY!,
        },
      })
    : new SESClient({
        region: process.env.AWS_SES_REGION,
      });

console.log("process.env.AWS_SES_REGION:", process.env.AWS_SES_REGION);
console.log("process.env.NODE_ENV:", process.env.NODE_ENV);
console.log("sesClient:", sesClient);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { toAddress, subject, bodyHtml } = body as {
    toAddress: string;
    subject: string;
    bodyHtml: string;
  };

  try {
    let verifyToken = await prisma.verifyToken.findFirst({
      where: { email: toAddress },
    });

    console.log(
      "verifyToken:",
      new Date(),
      verifyToken
      // Date() < verifyToken.expiresAt
    );

    if (verifyToken) {
      const now = new Date();

      // 이메일이 이미 발송되었고, 2분 이내에 재전송하려는 경우
      if (
        now < verifyToken.expiresAt &&
        now.getTime() - verifyToken.updatedAt.getTime() < 2 * 60 * 1000
      ) {
        Sentry.captureMessage("Verification email recently sent");
        return NextResponse.json(
          {
            error: "Verification email recently sent",
            // code: "EMAIL_RECENTLY_SENT",
            code: "EMAIL_ALREADY_SENT",
            expiresAt: verifyToken.expiresAt,
            // retryAfter: new Date(
            //   verifyToken.updatedAt.getTime() + 2 * 60 * 1000
            // ),
          },
          { status: 429 } // Too Many Requests
        );
      }

      if (now < verifyToken.expiresAt) {
        // 만료된 토큰 삭제
        await prisma.verifyToken.deleteMany({
          where: {
            expiresAt: { lt: now },
          },
        });
      }
    }

    // const token = crypto.randomBytes(32).toString("hex");
    const randomCode = generateRandomCode();
    const bodyHtmlWithCode = bodyHtml.replace("$CODE$", randomCode);
    // const newVerifyToken = await createVerifyToken(toAddress);

    const params = {
      Destination: {
        ToAddresses: [toAddress],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: bodyHtmlWithCode,
          },
          Text: {
            Charset: "UTF-8",
            Data: bodyHtmlWithCode,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: process.env.AWS_SES_SENDER,
    };

    const data = await sesClient.send(new SendEmailCommand(params));
    console.log(
      "Email sent successfully:",
      data,
      data?.$metadata?.httpStatusCode,
      typeof data?.$metadata?.httpStatusCode
    );

    if (data?.$metadata?.httpStatusCode == 200) {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료

      if (verifyToken) {
        verifyToken = await prisma.verifyToken.update({
          where: { id: verifyToken?.id },
          data: {
            token: randomCode,
            expiresAt,
            updatedAt: new Date(),
          },
        });
      } else {
        verifyToken = await prisma.verifyToken.create({
          data: {
            email: toAddress,
            token: randomCode,
            expiresAt,
          },
        });
      }

      return NextResponse.json(
        {
          verifyToken: verifyToken,
          code: "EMAIL_SENT",
          expiresAt: verifyToken.expiresAt,
        },
        { status: data?.$metadata?.httpStatusCode }
      );
    }

    return NextResponse.json(
      { error: "Verification email not sent" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Error send email verify error: ", error);
    // Sentry.captureException(error);
    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "api",
        endpoint: "/api/auth/send-verify-email",
        method: "POST",
        description: "Failed to send email verify",
      });
      scope.setTag("toAddress", toAddress);
      scope.setTag("subject", subject);
      return scope;
    });

    return NextResponse.json({ error: error }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
function generateRandomCode() {
  // 6자리 랜덤 숫자 생성
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString(); // 문자열로 반환
}

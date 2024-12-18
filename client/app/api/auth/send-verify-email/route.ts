import { prisma } from "@/prisma-client";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { NextRequest, NextResponse } from "next/server";

const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION,
  // endpoint: "https://email.ap-northeast-2.amazonaws.com",
  // credentials: {
  //   accessKeyId: process.env.AWS_SES_IAM_ACCESS_KEY!,
  //   secretAccessKey: process.env.AWS_SES_IAM_SECRET_KEY!,
  // },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toAddress } = body as { toAddress: string };

    const verifyToken = await prisma.verifyToken.findFirst({
      where: { email: toAddress },
    });

    console.log(
      "verifyToken:",
      new Date(),
      verifyToken
      // Date() < verifyToken.expiresAt
    );

    if (verifyToken) {
      if (new Date() < verifyToken.expiresAt) {
        return NextResponse.json(
          {
            error: "Verification email already sent",
            verifyToken: verifyToken,
            code: "EMAIL_ALREADY_SENT",
            expiresAt: verifyToken.expiresAt,
          },
          { status: 409 }
        );
      }

      // 만료된 토큰 삭제
      await prisma.verifyToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() }, // 현재 시간보다 이전
        },
      });
    }

    // const token = crypto.randomBytes(32).toString("hex");
    const randomCode = generateRandomCode();
    // const newVerifyToken = await createVerifyToken(toAddress);

    const params = {
      Destination: {
        ToAddresses: [toAddress],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<h1>Hello</h1><p>Please enter the verification code.</p>. Code: ${randomCode}`,
          },
          Text: {
            Charset: "UTF-8",
            Data: `Hello\nPlease enter the verification code.\nCode: ${randomCode}`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Test Email",
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

      await prisma.verifyToken.create({
        data: {
          email: toAddress,
          token: randomCode,
          expiresAt,
        },
      });
    }

    return NextResponse.json(
      { item: { success: true } },
      { status: data?.$metadata?.httpStatusCode }
    );
  } catch (error: unknown) {
    console.error("Error send email verify error: ", error);
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

import { prisma } from "@/prisma-client";
import { decryptEmail } from "@/utils/encrypt";
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, subject, bodyHtml } = body as {
      userId: string;
      subject: string;
      bodyHtml: string;
    };

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.emailId) {
      throw new Error("User email not found");
    }

    const email = decryptEmail(user.emailId!);

    const params = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: bodyHtml,
          },
          Text: {
            Charset: "UTF-8",
            Data: bodyHtml,
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
      return NextResponse.json(
        {
          item: {
            code: "EMAIL_SENT",
          },
        },
        { status: data?.$metadata?.httpStatusCode }
      );
    }

    Sentry.captureMessage(JSON.stringify(data));
    throw new Error("Email not sent");
  } catch (error: unknown) {
    console.error("Error send badge email: ", error);
    Sentry.captureException(error);
    return NextResponse.json({ error: error }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import { decrypt } from "@/utils/encrypt";
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
  console.log("POST send badge email handler called");
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { userId, subject, bodyHtml } = body as {
    userId: string;
    subject: string;
    bodyHtml: string;
  };

  try {
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

    const email = decrypt(user.emailId!, true);

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
    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "api",
        endpoint: "/api/activity/send-badge-email",
        method: "POST",
        description: "Failed to send badge email",
      });
      scope.setTag("userId", userId);
      return scope;
    });
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

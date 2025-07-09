import { getBadgeEmailTemplete } from "@/templete/email";

const sendEmail = async () => {
  const badgeImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/25galaxyz/images/badge/badge_3.png`;

  const galaxyAIExpert: string = "Galaxy Expert ";
  const emailBadgeDate: string = "March 24~";
  const emailBadgeDescriptionA: string = "Congratulations!";
  const emailBadgeDescriptionB = "You have earned the Galaxy Expert Badge.";
  const emailBadgeDescriptionC: string = "This message was automatically delivered by Samsung+ service. Do not reply to this message.";
  const subject: string = "You have earned the Galaxy AI Expert Badge.";
  const bodyHtml: string = getBadgeEmailTemplete(
    badgeImageUrl,
    galaxyAIExpert,
    emailBadgeDate,
    emailBadgeDescriptionA,
    emailBadgeDescriptionB,
    emailBadgeDescriptionC,
  );

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/activity/send-badge-email`, {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify({
      userId: "865e2287-9bc3-4f16-96a2-72b2c0e1ad5c",
      subject,
      bodyHtml,
    }),
  });

  return true;
};

export default function EmailTestButton() {
  return (
    <button className="absolute top-0 right-50 z-50 bg-amber-500" onClick={sendEmail}>
      버튼
    </button>
  );
}

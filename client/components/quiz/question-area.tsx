import SpeechBubble from "./speech-bubble";
import { TypewriteTextVer } from "./typewrite";

export default function Qusetion({
  question,
  bgImageUrl,
  charImageUrl,
  isArabicCountry,
}: {
  question: string;
  bgImageUrl: string;
  charImageUrl: string;
  isArabicCountry: boolean;
}) {
  return (
    <div
      className="min-h-[480px] flex flex-col justify-between"
      style={{
        backgroundImage: `url(${bgImageUrl})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <SpeechBubble>
        <TypewriteTextVer
          question={question}
          isArabicCountry={isArabicCountry}
        />
      </SpeechBubble>
      <div
        style={{
          backgroundImage: `url(${charImageUrl})`,
          backgroundPosition: "center bottom",
        }}
        className="h-[309px] bg-no-repeat bg-contain"
      />
    </div>
  );
}

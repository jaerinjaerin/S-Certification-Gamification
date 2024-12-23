import SpeechBubble from "./speech-bubble";
import { TypewriteTextVer } from "./typewrite";

export default function Qusetion({ question, bgImageUrl, charImageUrl }: { question: string; bgImageUrl: string; charImageUrl: string }) {
  return (
    <div
      className="min-h-[480px] flex flex-col justify-between"
      style={{
        backgroundImage: `url(${bgImageUrl})`,
      }}
    >
      <SpeechBubble>
        <TypewriteTextVer question={question} />
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

import SpeechBubble from "./speech-bubble";
import { TypewriteTextVer } from "./typewrite";

export default function Qusetion({ currentQuizStage, question }: { currentQuizStage: any; question: any }) {
  const bgImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${currentQuizStage.backgroundImageUrl}`;
  const charImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${currentQuizStage.characterImageUrl}`;

  return (
    <div
      className="min-h-[480px] flex flex-col justify-between"
      style={{
        backgroundImage: `url(${bgImageUrl})`,
      }}
    >
      <SpeechBubble>
        <TypewriteTextVer question={question.text} />
        {/* <Typewrite question={question.text} /> */}
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

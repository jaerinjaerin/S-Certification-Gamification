import SpeechBubble from "./speech-bubble";

export default function Qusetion({
  question,
  bgImageUrl,
  charImageUrl,
}: {
  question: string;
  bgImageUrl: string;
  charImageUrl: string;
}) {
  console.log("question", question, charImageUrl);
  return (
    <div
      className="min-h-[480px] flex flex-col justify-between"
      style={{
        backgroundImage: `url(${bgImageUrl})`,
      }}
    >
      <SpeechBubble>{question}</SpeechBubble>
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

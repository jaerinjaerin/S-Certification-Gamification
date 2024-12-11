import SpeechBubble from "./speech-bubble";

export default function Qusetion({ questionText }: { questionText: string }) {
  return (
    <div
      className="min-h-[480px] flex flex-col justify-between"
      style={{
        backgroundImage: `url("/assets/bg_main.png")`,
      }}
    >
      <SpeechBubble>{questionText}</SpeechBubble>
      <div
        style={{ backgroundImage: `url("/assets/character/man_01.png")`, backgroundPosition: "center bottom" }}
        className="h-[309px] bg-no-repeat"
      />
    </div>
  );
}

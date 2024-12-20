export default function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full px-5 pt-[27px] relative">
      <div className="bg-white text-sm rounded-lg px-[26px] py-6">{children}</div>
      <div className="absolute size-[26px] bg-white rotate-45 bottom-0 left-0 translate-y-2 translate-x-20 rounded-[3px]" />
    </div>
  );
}

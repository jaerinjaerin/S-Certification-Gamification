export default function CountDownBar({ progress }: { progress: number }) {
  return (
    <div className="bg-white relative h-[6px] w-full">
      <div
        className="bg-black/30 w-full absolute top-0 left-0 h-[6px] z-[99999]"
        style={{
          width: `${progress}%`,
        }}
      ></div>
    </div>
  );
}

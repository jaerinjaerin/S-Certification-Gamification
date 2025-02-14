import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useCheckLocale from "@/hooks/useCheckLocale";
import { useQuiz } from "@/providers/quizProvider";
import { cn } from "@/utils/utils";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function GameOverAlertDialog({
  gameOver,
  onRestart,
}: {
  gameOver: boolean;
  onRestart: () => void;
}) {
  const translation = useTranslations();
  const router = useRouter();
  const { restartStage } = useQuiz();
  const { isMyanmar } = useCheckLocale();
  return (
    <AlertDialog open={gameOver}>
      <AlertDialogContent className="w-[250px] sm:w-[340px] rounded-[20px]">
        <AlertDialogHeader>
          <AlertDialogTitle aria-hidden className="hidden">
            Game Over
          </AlertDialogTitle>
          <AlertDialogDescription
            className={cn("text-base", isMyanmar && "leading-9")}
          >
            {/* Attempts exhausted. <br />
            Retry? <br />
            Selecting “No” will return to stage selection */}
            {translation("alert_notification")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel
            onClick={() => router.push("map")}
            className="text-wrap"
          >
            {translation("no")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onRestart();
            }}
            className="text-wrap"
          >
            {translation("retry")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ErrorAlertDialog({ error }: { error: string | undefined }) {
  const translation = useTranslations();
  const router = useRouter();

  return (
    <AlertDialog open={!!error}>
      <AlertDialogContent className="w-[250px] sm:w-[340px] rounded-[20px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="hidden" aria-hidden></AlertDialogTitle>
          <AlertDialogDescription>{error}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => router.push("map")}>
            {translation("back")}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
import { usePathNavigator } from "@/route/usePathNavigator";
import { cn } from "@/utils/utils";
import { useTranslations } from "next-intl";

export function GameOverAlertDialog({ gameOver }: { gameOver: boolean }) {
  const { routeToPage } = usePathNavigator();
  const translation = useTranslations();
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
          <AlertDialogCancel onClick={() => routeToPage("map")}>
            {translation("no")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => routeToPage("quiz")}>
            {translation("retry")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ErrorAlertDialog({ error }: { error: string | undefined }) {
  const { routeToPage } = usePathNavigator();
  const translation = useTranslations();

  return (
    <AlertDialog open={!!error}>
      <AlertDialogContent className="w-[250px] sm:w-[340px] rounded-[20px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="hidden" aria-hidden></AlertDialogTitle>
          <AlertDialogDescription>{error}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => routeToPage("map")}>
            {translation("back")}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

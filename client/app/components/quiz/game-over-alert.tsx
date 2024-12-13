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
import { usePathNavigator } from "@/route/usePathNavigator";

export default function GameOverAlertDialog({ gameOver }: { gameOver: boolean }) {
  const { routeToPage } = usePathNavigator();
  return (
    <AlertDialog open={gameOver}>
      <AlertDialogContent className="w-[250px] sm:w-[340px] rounded-[20px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Game Over</AlertDialogTitle>
          <AlertDialogDescription>
            Attempts exhausted. <br />
            Retry? <br />
            Selecting “No” will return to stage selection
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => routeToPage("map")}>No</AlertDialogCancel>
          <AlertDialogAction onClick={() => routeToPage("quiz")}>Retry</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

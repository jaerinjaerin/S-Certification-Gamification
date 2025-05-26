import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";

type ResultAlertDialogProps = {
  open: boolean;
  descprtion: string | null;
  onConfirm: () => void;
  translationOk: string;
};
export function ResultAlertDialog({ open, descprtion, onConfirm, translationOk }: ResultAlertDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="w-[250px] sm:w-[340px] rounded-[20px] z-[9999]">
        <AlertDialogHeader>
          <AlertDialogTitle></AlertDialogTitle>
          <AlertDialogDescription>{descprtion}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button variant={"primary"} onClick={onConfirm}>
              <span>{translationOk}</span>
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
  description: string | null;
  onConfirm: () => void;
  confirmText: string;
};
export function ResultAlertDialog({ open, description, onConfirm, confirmText }: ResultAlertDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="w-[250px] sm:w-[340px] rounded-[20px] z-[9999]">
        <AlertDialogHeader>
          <AlertDialogTitle></AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button variant={"primary"} onClick={onConfirm}>
              <span>{confirmText}</span>
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

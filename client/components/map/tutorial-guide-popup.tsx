import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useTranslations } from "next-intl";
import { QuestionMark } from "../icons/icons";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import TutorialCarousel from "./tutorial-carousel";

export default function TutorialGuidePopup() {
  const translation = useTranslations();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="ml-auto border rounded-full border-black/50 [&_svg]:size-4"
          size={"icon_md"}
        >
          <QuestionMark />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{translation("how_to_play")}</DialogTitle>
        </DialogHeader>

        <TutorialCarousel />
        <DialogFooter>
          <DialogClose className="text-[18px] py-[22px] px-[34px]" asChild>
            <Button variant={"primary"}>
              <span>{translation("ok")}</span>
            </Button>
          </DialogClose>
          <DialogClose className="absolute top-5 right-5">
            <X />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

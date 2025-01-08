import { cn } from "@/utils/utils";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export default function PrivacyAndTerm({ className }: { className?: string }) {
  const translation = useTranslations();
  return (
    <div className={cn("font-medium text-sm", className)}>
      <Dialog>
        <DialogTrigger>{translation("privacy")}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translation("privacy")}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[50svh] overflow-hidden overflow-y-scroll font-one font-medium">
            Information Collection: We collect only the necessary personal
            information to provide our services. Purpose of Use: Your data is
            used for service delivery, improvement, customer support, and
            compliance with legal requirements. Retention Period: Information is
            retained only for as long as required by applicable laws.
            Third-Party Sharing: Your data will not be shared without your
            consent. Security: We employ secure technologies and procedures to
            protect your personal information. Contact: For privacy-related
            inquiries, please contact us at [Contact Information]. Information
            Collection: We collect only the necessary personal information to
            provide our services. Purpose of Use: Your data is used for service
            delivery, improvement, customer support, and compliance with legal
            requirements. Retention Period: Information is retained only for as
            long as required by applicable laws. Third-Party Sharing: Your data
            will not be shared without your consent. Security: We employ secure
            technologies and procedures to protect your personal information.
            Contact: For privacy-related inquiries, please contact us at
            [Contact Information]. Information Collection: We collect only the
            necessary personal information to provide our services. Purpose of
            Use: Your data is used for service delivery, improvement, customer
            support, and compliance with legal requirements. Retention Period:
            Information is retained only for as long as required by applicable
            laws. Third-Party Sharing: Your data will not be shared without your
            consent. Security: We employ secure technologies and procedures to
            protect your personal information. Contact: For privacy-related
            inquiries, please contact us at [Contact Information].
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"primary"}>{translation("accept")}</Button>
            </DialogClose>
            <DialogClose className="absolute top-5 right-5">
              <X />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <span className="mx-2">|</span>
      <Dialog>
        <DialogTrigger>{translation("term")}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translation("term")}</DialogTitle>
          </DialogHeader>

          <div className="max-h-[50svh] overflow-hidden overflow-y-scroll font-one font-medium">
            Information Collection: We collect only the necessary personal
            information to provide our services. Purpose of Use: Your data is
            used for service delivery, improvement, customer support, and
            compliance with legal requirements. Retention Period: Information is
            retained only for as long as required by applicable laws.
            Third-Party Sharing: Your data will not be shared without your
            consent. Security: We employ secure technologies and procedures to
            protect your personal information. Contact: For privacy-related
            inquiries, please contact us at [Contact Information]. Information
            Collection: We collect only the necessary personal information to
            provide our services. Purpose of Use: Your data is used for service
            delivery, improvement, customer support, and compliance with legal
            requirements. Retention Period: Information is retained only for as
            long as required by applicable laws. Third-Party Sharing: Your data
            will not be shared without your consent. Security: We employ secure
            technologies and procedures to protect your personal information.
            Contact: For privacy-related inquiries, please contact us at
            [Contact Information]. Information Collection: We collect only the
            necessary personal information to provide our services. Purpose of
            Use: Your data is used for service delivery, improvement, customer
            support, and compliance with legal requirements. Retention Period:
            Information is retained only for as long as required by applicable
            laws. Third-Party Sharing: Your data will not be shared without your
            consent. Security: We employ secure technologies and procedures to
            protect your personal information. Contact: For privacy-related
            inquiries, please contact us at [Contact Information].
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"primary"}>{translation("ok")}</Button>
            </DialogClose>
            <DialogClose className="absolute top-5 right-5">
              <X />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

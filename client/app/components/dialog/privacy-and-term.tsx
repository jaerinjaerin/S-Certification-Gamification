import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export default function PrivacyAndTerm({ className }: { className?: string }) {
  return (
    // fixed bottom-7 z-30 flex
    <div className={cn("", className)}>
      <Dialog>
        <DialogTrigger>Privacy</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Privacy</DialogTitle>
          </DialogHeader>
          <div className="max-h-[50svh] overflow-hidden overflow-y-scroll">
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
            <DialogClose>
              <Button variant={"primary"}>Accept</Button>
            </DialogClose>
            <DialogClose className="absolute top-5 right-5">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <span className="mx-2">|</span>
      <Dialog>
        <DialogTrigger>Terms</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terms</DialogTitle>
          </DialogHeader>

          <div className="max-h-[50svh] overflow-hidden overflow-y-scroll">
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
            <DialogClose>
              <Button variant={"primary"}>OK</Button>
            </DialogClose>
            <DialogClose className="absolute top-5 right-5">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

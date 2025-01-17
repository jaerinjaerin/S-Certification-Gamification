import { extractCodesFromPath } from "@/utils/pathUtils";
import { cn } from "@/utils/utils";
import * as Sentry from "@sentry/nextjs";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import useLoader from "../ui/loader";

export default function PrivacyAndTerm({ className }: { className?: string }) {
  const [term, setTerm] = useState<any>();
  const { loading, setLoading, renderLoader } = useLoader();
  const params = useParams();
  const quizPathParams = params.quizset_path;
  const { domainCode } = extractCodesFromPath(String(quizPathParams));

  const fetchTermAndCondition = async () => {
    try {
      setLoading(true);
      const jsonUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/jsons/term/${domainCode}.json`;
      // const jsonUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/jsons/term/OrgCode-7.json`;
      const res = await fetch(jsonUrl, {
        method: "GET",
        cache: "no-cache",
      });

      const data = await res.json();
      setTerm(data);
    } catch (error) {
      setTerm({ contents: "Not Found" });
      console.error(`Failed to fetch T&C data log: ${error}`);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTermAndCondition();
  }, []);

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
            {loading && renderLoader()}
            {term && <p className="whitespace-break-spaces">{term.contents}</p>}
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

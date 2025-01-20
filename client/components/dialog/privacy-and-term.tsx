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
import { Markdown } from "../markdown/markdown";

export default function PrivacyAndTerm({ className }: { className?: string }) {
  const [term, setTerm] = useState<any>();
  const [privacy, setPrivacy] = useState<any>();
  const { loading, setLoading, renderLoader } = useLoader();
  const params = useParams();
  const quizPathParams = params.quizset_path;
  const fetchTerm = async () => {
    try {
      setLoading(true);
      const jsonUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/jsons/term/${quizPathParams}.json`;
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

  const fetchPrivacy = async () => {
    try {
      setLoading(true);
      const jsonUrl = `https://assets-stage.samsungplus.net/certification/s25/jsons/privacy/eu-privacy.json`;

      const res = await fetch(jsonUrl, {
        method: "GET",
        cache: "no-cache",
      });

      const data = await res.json();
      setPrivacy(data);
    } catch (error) {
      console.error(`Failed to fetch privacy data log: ${error}`);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerm();
    fetchPrivacy();
  }, []);

  const translation = useTranslations();
  return (
    <div className={cn("font-medium text-sm", className)}>
      <Dialog>
        <DialogTrigger>{translation("privacy")}</DialogTrigger>
        <DialogContent className="!px-[10px] text-xs">
          <DialogHeader>
            <DialogTitle style={{ wordBreak: "break-word" }}>
              {translation("privacy")}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[50svh] overflow-hidden overflow-y-scroll font-one font-medium">
            {loading && renderLoader()}
            {privacy && <Markdown>{privacy.contents as string}</Markdown>}
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
            <DialogTitle style={{ wordBreak: "break-word" }}>
              {translation("term")}
            </DialogTitle>
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

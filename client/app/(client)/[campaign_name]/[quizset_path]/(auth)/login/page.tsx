"use client";

import PolicyFooter from "@/components/dialog/privacy-and-term";
import { Button } from "@/components/ui/button";
import useLoader from "@/components/ui/loader";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Spinner from "@/components/ui/spinner";
import useGAPageView from "@/core/monitoring/ga/usePageView";
import useCheckLocale from "@/hooks/useCheckLocale";
import { cn } from "@/utils/utils";
import { AutoTextSize } from "auto-text-size";
import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { usePolicy } from "@/providers/policyProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { Markdown } from "@/components/markdown/markdown";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useState } from "react";

const FormSchema = z.object({
  privacy: z.boolean().default(false),
  term: z.boolean().default(false),
});

export default function Login() {
  useGAPageView();
  const { status } = useSession();
  const translation = useTranslations();
  const { isArabic } = useCheckLocale();
  const { loading, setLoading, renderLoader } = useLoader();
  const { subsidiary } = usePolicy();
  const regionName = subsidiary && subsidiary.region.name;
  const ACCEPT_POLICY_REGION = regionName === "MENA";

  const processSignIn = async () => {
    setLoading(true);
    await signIn("sumtotal");
  };

  if (status === "loading") {
    return <Spinner />;
  }

  return (
    <>
      <div className={cn("h-svh")}>
        <div
          className="object-fill w-full h-svh"
          style={{
            backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/background/main_bg2.jpg')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-col items-center h-full py-[20px] relative">
            <span className="block text-lg font-bold">
              {translation("galaxy_ai_expert")}
            </span>
            <div
              className={cn("flex flex-col items-center my-auto gap-[49px]")}
            >
              <div className="font-bold text-center text-4xl/normal sm:text-5xl/normal text-balance px-[20px] max-w-[420px] min-w-[280px] w-full h-[200px] ">
                <AutoTextSize mode="box">
                  {translation("be_a_galaxy_ai_expert")}
                </AutoTextSize>
              </div>
              <PolicySheet
                ACCEPT_POLICY_REGION={ACCEPT_POLICY_REGION}
                processSignIn={processSignIn}
                loading={loading}
              >
                <Button
                  variant={"primary"}
                  disabled={loading}
                  onClick={() => {
                    if (!ACCEPT_POLICY_REGION) {
                      processSignIn();
                    }
                  }}
                  className={cn(
                    "disabled:bg-disabled ",
                    isArabic && "flex-row-reverse"
                  )}
                >
                  <span>S+</span>
                  <span>{translation("login")}</span>
                </Button>
              </PolicySheet>
            </div>
            <PolicyFooter />
          </div>
        </div>
      </div>
      {loading && renderLoader()}
    </>
  );
}

function PolicySheet({
  children,
  ACCEPT_POLICY_REGION,
  processSignIn,
  loading,
}: {
  children: React.ReactNode;
  ACCEPT_POLICY_REGION: boolean;
  processSignIn: () => Promise<void>;
  loading: boolean;
}) {
  const [openSheet, setOpenSheet] = useState(ACCEPT_POLICY_REGION);
  const { privacyContent, termContent, domainName } = usePolicy();
  const translation = useTranslations();
  const { isArabic } = useCheckLocale();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      privacy: false,
      term: false,
    },
  });

  const checkAllCheckbox = () => {
    if (form.getValues("privacy") && form.getValues("term")) {
      return true;
    }
    return false;
  };
  const isAllChecked = checkAllCheckbox();

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side={"bottom"}
        className={cn(
          "w-full h-fit max-w-[412px] mx-auto ",
          "flex flex-col justify-end"
        )}
      >
        <SheetHeader>
          <SheetTitle aria-hidden className="hidden"></SheetTitle>
          <SheetDescription>
            <Accordion type="single" collapsible defaultValue="privacy">
              <Form {...form}>
                <form>
                  <FormField
                    key={"privacy"}
                    control={form.control}
                    name="privacy"
                    render={({ field }) => {
                      return (
                        <AccordionItem value="privacy">
                          <AccordionTitle title={translation("privacy")} />
                          <AccordionContent className="h-[60svh]  flex flex-col gap-3">
                            <div className="overflow-hidden overflow-y-scroll">
                              <Markdown
                                className={cn(
                                  "text-xs",
                                  isArabic && "text-right",
                                  domainName === "Myanmar" && "leading-loose"
                                )}
                              >
                                {privacyContent}
                              </Markdown>
                            </div>

                            <div className="flex items-center space-x-2">
                              <FormItem
                                key={"privacy"}
                                className="flex flex-row items-start space-x-3 space-y-0 w-full"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#0F0F0F]">
                                  {translation("mena_check_1")}
                                </FormLabel>
                              </FormItem>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    }}
                  />
                  <FormField
                    key={"term"}
                    control={form.control}
                    name="term"
                    render={({ field }) => {
                      return (
                        <AccordionItem value="term">
                          <AccordionTitle title={translation("term")} />
                          <AccordionContent className="h-[60svh]  flex flex-col gap-3">
                            <div className="overflow-hidden overflow-y-scroll">
                              <Markdown
                                className={cn(
                                  "text-xs",
                                  isArabic && "text-right",
                                  domainName === "Myanmar" && "leading-loose"
                                )}
                              >
                                {termContent}
                              </Markdown>
                            </div>

                            <div className="flex items-center space-x-2">
                              <FormItem
                                key={"term"}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#0F0F0F]">
                                  {translation("mena_check_2")}
                                </FormLabel>
                              </FormItem>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    }}
                  />
                </form>
              </Form>
            </Accordion>
          </SheetDescription>
        </SheetHeader>
        <SheetFooter className="mt-[26px]">
          <Button
            variant={"primary"}
            disabled={loading || !isAllChecked}
            onClick={processSignIn}
          >
            <span>{translation("accept")}</span>
          </Button>
          <SheetClose asChild>
            <Button variant={"primary"} disabled={loading}>
              <span>{translation("mena_Decline")}</span>
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function AccordionTitle({ title }: { title: string }) {
  return (
    <AccordionTrigger className="text-2xl font-bold text-[#0F0F0F]">
      {title}
    </AccordionTrigger>
  );
}

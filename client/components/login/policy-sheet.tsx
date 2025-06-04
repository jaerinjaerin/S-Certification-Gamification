import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Markdown } from "@/components/markdown/markdown";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { z } from "zod";
import { useTranslations } from "next-intl";
import useCheckLocale from "@/hooks/useCheckLocale";
import { cn } from "@/utils/utils";
import { Button } from "../ui/button";
import { arabicDomains } from "@/core/config/default";

interface PolicySheetProps {
  onClick: () => Promise<void>;
  loading: boolean;
  error: boolean;
  open: boolean;
  setOpenSheet: Dispatch<SetStateAction<boolean>>;
  privacyContent: string;
  termContent: string;
  domainCode: string | undefined;
}

const FormSchema = z.object({
  privacy: z.boolean().default(false),
  term: z.boolean().default(false),
});

export default function PolicySheet({ loading, open, setOpenSheet, onClick, domainCode, privacyContent, termContent, error }: PolicySheetProps) {
  const translation = useTranslations();
  const { isArabic } = useCheckLocale();
  const isArabicCountry = arabicDomains.includes(domainCode ?? "");

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
  const privacyChecked = form.watch("privacy");
  const [accordionValue, setAccordionValue] = useState<string>("privacy");

  useEffect(() => {
    if (privacyChecked) {
      setAccordionValue("term");
    }
  }, [privacyChecked]);

  return (
    <Sheet open={open} onOpenChange={setOpenSheet}>
      <SheetTrigger></SheetTrigger>
      <SheetContent side={"bottom"} className={cn("w-full h-fit max-w-[412px] mx-auto ", "flex flex-col justify-end")}>
        <SheetHeader>
          <SheetTitle aria-hidden className="hidden"></SheetTitle>
          <SheetDescription>
            <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue}>
              <div></div>
              <Form {...form}>
                <form>
                  <AccordionFormItem
                    accordionProps={{
                      form: form,
                      // domainName: domainName,
                      title: `${translation("privacy")}`,
                      contents: error ? `${translation("unexpected_error")}` : `${privacyContent}`,
                      formKey: "privacy",
                      formLabelText: translation.rich("mena_check_1", {
                        strong: (chunks) => <span className="text-blue-500 font-bold inline-block">{chunks}</span>,
                      }),
                      isArabic,
                      isArabicCountry,
                    }}
                  />
                  <AccordionFormItem
                    accordionProps={{
                      form: form,
                      // domainName: domainName,
                      title: `${translation("term")}`,
                      contents: error ? `${translation("unexpected_error")}` : `${termContent}`,
                      formKey: "term",
                      formLabelText: translation.rich("mena_check_2", {
                        strong: (chunks) => <span className="text-blue-500 font-bold inline-block">{chunks}</span>,
                      }),
                      isArabic,
                      isArabicCountry,
                    }}
                  />
                </form>
              </Form>
            </Accordion>
          </SheetDescription>
        </SheetHeader>
        <SheetFooter className={cn("mt-[26px]", isArabicCountry && "sm:flex-row-reverse")}>
          <Button
            variant={"primary"}
            disabled={loading || error || !isAllChecked}
            onClick={() => {
              if (open) {
                setOpenSheet(false);
              }

              onClick();
            }}
            className="text-sm"
          >
            <span>{translation("accept")}</span>
          </Button>
          <SheetClose asChild>
            <Button variant={"primary"} disabled={loading} className="text-sm">
              <span>{translation("mena_Decline")}</span>
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

type AccordionFormItemProps = {
  accordionProps: {
    title: string;
    contents: string;
    formKey: "privacy" | "term";
    formLabelText: string | React.ReactNode;
    form: UseFormReturn<{ privacy: boolean; term: boolean }, any, undefined>;
    isArabic: boolean;
    isArabicCountry: boolean;
  };
};
function AccordionFormItem({ accordionProps }: AccordionFormItemProps) {
  const { form, title, contents, formKey, formLabelText, isArabic, isArabicCountry } = accordionProps;

  return (
    <FormField
      key={formKey}
      control={form.control}
      name={formKey}
      render={({ field }) => {
        return (
          <AccordionItem value={formKey}>
            <AccordionTrigger className={cn("text-xl font-bold text-[#0F0F0F] focus:outline-none", isArabic && "flex-row-reverse")}>
              {title}
            </AccordionTrigger>
            <AccordionContent className="h-[60svh]  flex flex-col gap-3">
              <div className="overflow-hidden overflow-y-scroll bg-[#F7F7F7] px-[10px]">
                <Markdown
                  className={cn(
                    "text-sm font-one font-medium text-[#4E4E4E] break-words",
                    isArabicCountry && "text-right",
                    isArabic && "text-right"
                    // domainName === "Myanmar" && "leading-loose"
                  )}
                >
                  {contents}
                </Markdown>
              </div>

              <div
                className={cn("flex items-center gap-2")}
                dir={isArabic ? "rtl" : "ltr"}
                // dir={isArabicCountry ? "rtl" : "ltr"}
              >
                <FormItem key={formKey} className="flex flex-row items-start gap-3 space-y-0 w-full">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                      }}
                    />
                  </FormControl>
                  <FormLabel
                    className={cn(
                      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#0F0F0F]",
                      isArabic && "text-right"
                    )}
                    dir={isArabic ? "rtl" : "ltr"}
                    // dir={isArabicCountry ? "rtl" : "ltr"}
                  >
                    {formLabelText}
                  </FormLabel>
                </FormItem>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      }}
    />
  );
}

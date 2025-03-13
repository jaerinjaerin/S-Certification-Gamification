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
import { Checkbox } from "@/components/ui/checkbox";
import { Markdown } from "@/components/markdown/markdown";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Dispatch, SetStateAction } from "react";
import { z } from "zod";
import { useTranslations } from "next-intl";
import useCheckLocale from "@/hooks/useCheckLocale";
import { cn } from "@/utils/utils";
import { Button } from "../ui/button";

interface PolicySheetProps {
  children: React.ReactNode;
  processSignIn: (() => Promise<void>) | (() => void);
  loading: boolean;
  privacyContent: string;
  termContent: string;
  domainName: string;
  openSheet?: boolean;
  setOpenSheet?: Dispatch<SetStateAction<boolean>>;
  disabledCondition?: boolean;
}

const FormSchema = z.object({
  privacy: z.boolean().default(false),
  term: z.boolean().default(false),
});

export default function PolicySheet({
  children,
  processSignIn,
  loading,
  privacyContent,
  termContent,
  domainName,
  openSheet,
  setOpenSheet,
}: PolicySheetProps) {
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
              <div></div>
              <Form {...form}>
                <form>
                  <AccordionFormItem
                    accordionProps={{
                      form: form,
                      domainName: domainName,
                      accordionTitle: `${translation("privacy")}`,
                      contents: `${privacyContent}`,
                      formKey: "privacy",
                      formLabelText: translation.rich("mena_check_1", {
                        strong: (chunks) => (
                          <span className="text-blue-500 font-bold inline-block">
                            {chunks}
                          </span>
                        ),
                      }),
                    }}
                  />
                  <AccordionFormItem
                    accordionProps={{
                      form: form,
                      domainName: domainName,
                      accordionTitle: `${translation("term")}`,
                      contents: `${termContent}`,
                      formKey: "term",
                      formLabelText: translation.rich("mena_check_2", {
                        strong: (chunks) => (
                          <span className="text-blue-500 font-bold inline-block">
                            {chunks}
                          </span>
                        ),
                      }),
                    }}
                  />
                </form>
              </Form>
            </Accordion>
          </SheetDescription>
        </SheetHeader>
        <SheetFooter
          className={cn("mt-[26px]", isArabic && "sm:flex-row-reverse")}
        >
          <Button
            variant={"primary"}
            disabled={loading || !isAllChecked}
            onClick={() => {
              if (setOpenSheet) {
                setOpenSheet(false);
              }

              processSignIn();
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

function AccordionTitle({
  title,
  isArabic,
}: {
  title: string;
  isArabic: boolean;
}) {
  return (
    <AccordionTrigger
      className={cn(
        "text-xl font-bold text-[#0F0F0F] focus:outline-none",
        isArabic && "flex-row-reverse"
      )}
    >
      {title}
    </AccordionTrigger>
  );
}

function AccordionFormItem({
  accordionProps,
}: {
  accordionProps: {
    accordionTitle: string;
    domainName: string;
    contents: string;
    formKey: "privacy" | "term";
    formLabelText: string | React.ReactNode;
    form: UseFormReturn<
      {
        privacy: boolean;
        term: boolean;
      },
      any,
      undefined
    >;
  };
}) {
  const { form, accordionTitle, domainName, contents, formKey, formLabelText } =
    accordionProps;
  const { isArabic } = useCheckLocale();

  return (
    <FormField
      key={formKey}
      control={form.control}
      name={formKey}
      render={({ field }) => {
        return (
          <AccordionItem value={formKey}>
            <AccordionTitle title={accordionTitle} isArabic={isArabic} />
            <AccordionContent className="h-[60svh]  flex flex-col gap-3">
              <div className="overflow-hidden overflow-y-scroll bg-[#F7F7F7] px-[10px]">
                <Markdown
                  className={cn(
                    "text-sm font-one font-medium text-[#4E4E4E] break-words",
                    isArabic && "text-right",
                    domainName === "Myanmar" && "leading-loose"
                  )}
                >
                  {contents}
                </Markdown>
              </div>

              <div
                className={cn("flex items-center gap-2")}
                dir={isArabic ? "rtl" : "ltr"}
              >
                <FormItem
                  key={formKey}
                  className="flex flex-row items-start gap-3 space-y-0 w-full"
                >
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

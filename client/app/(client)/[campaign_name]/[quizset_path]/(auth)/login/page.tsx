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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const FormSchema = z.object({
  // username: z.string().min(2, {
  //   message: "Username must be at least 2 characters.",
  // }),
  privacy: z.boolean().default(false),
  term: z.boolean().default(false),
});

export default function Login() {
  useGAPageView();
  const { status } = useSession();
  const translation = useTranslations();
  const { isArabic } = useCheckLocale();
  const { loading, setLoading, renderLoader } = useLoader();
  const { privacyContent, termContent, domainName } = usePolicy();
  // const [isChecked, setIsChecked] = useState({
  //   privacy: false,
  //   term: false,
  // });
  const processSignIn = async () => {
    setLoading(true);
    await signIn("sumtotal");
    // console.log("result", result);
  };
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      privacy: false,
      term: false,
    },
  });

  const { watch } = form;
  console.log("[privacy]➡️", watch("privacy"));
  console.log("[term] ➡️", watch("term"));

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("⭐️", data);
    // toast({
    //   title: "You submitted the following values:",
    //   description: (
    //     <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
    //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
    //     </pre>
    //   ),
    // });
  }

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

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant={"primary"}
                    // onClick={processSignIn}
                    className={cn(
                      "disabled:bg-disabled ",
                      isArabic && "flex-row-reverse"
                    )}
                  >
                    <span>S+</span>
                    <span>{translation("login")}</span>
                  </Button>
                </SheetTrigger>
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
                      <Accordion
                        type="single"
                        collapsible
                        defaultValue="privacy"
                      >
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                              key={"privacy"}
                              control={form.control}
                              name="privacy"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={"privacy"}
                                    className="flex flex-row items-start space-x-3 space-y-0 w-full"
                                  >
                                    <AccordionItem value="privacy">
                                      <AccordionTitle
                                        title={translation("privacy")}
                                      />
                                      <AccordionContent className="h-[60svh]  flex flex-col gap-3">
                                        <div className="bg-blue-300 overflow-hidden overflow-y-scroll">
                                          <Markdown
                                            className={cn(
                                              "text-xs",
                                              isArabic && "text-right",
                                              domainName === "Myanmar" &&
                                                "leading-loose"
                                            )}
                                          >
                                            {privacyContent}
                                          </Markdown>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value}
                                              onCheckedChange={(checked) => {
                                                field.onChange(checked);
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#0F0F0F]">
                                            Accept terms and conditions
                                          </FormLabel>
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  </FormItem>
                                );
                              }}
                            />
                            <FormField
                              key={"term"}
                              control={form.control}
                              name="term"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={"term"}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <AccordionItem value="term">
                                      <AccordionTitle
                                        title={translation("term")}
                                      />
                                      <AccordionContent className="h-[60svh]  flex flex-col gap-3">
                                        <div className="bg-blue-300 overflow-hidden overflow-y-scroll">
                                          <Markdown
                                            className={cn(
                                              "text-xs",
                                              isArabic && "text-right",
                                              domainName === "Myanmar" &&
                                                "leading-loose"
                                            )}
                                          >
                                            {termContent}
                                          </Markdown>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value}
                                              onCheckedChange={(checked) => {
                                                field.onChange(checked);
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#0F0F0F]">
                                            Accept terms and conditions
                                          </FormLabel>
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  </FormItem>
                                );
                              }}
                            />
                          </form>
                        </Form>
                      </Accordion>
                    </SheetDescription>
                  </SheetHeader>
                  <SheetFooter className="mt-[26px]">
                    <Button variant={"primary"} disabled={loading}>
                      <span>{translation("accept")}</span>
                    </Button>
                    <SheetClose asChild>
                      <Button variant={"primary"} disabled={loading}>
                        <span>Decline</span>
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
            <PolicyFooter />
          </div>
        </div>
      </div>
      {loading && renderLoader()}
    </>
  );
}

// function PolicyCheckBox() {}

// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion"

// export function AccordionDemo() {
//   return (
//     <Accordion type="single" collapsible className="w-full">
//       <AccordionItem value="item-1">
//         <AccordionTrigger>Is it accessible?</AccordionTrigger>
//         <AccordionContent>
//           Yes. It adheres to the WAI-ARIA design pattern.
//         </AccordionContent>
//       </AccordionItem>
//       <AccordionItem value="item-2">
//         <AccordionTrigger>Is it styled?</AccordionTrigger>
//         <AccordionContent>
//           Yes. It comes with default styles that matches the other
//           components&apos; aesthetic.
//         </AccordionContent>
//       </AccordionItem>
//       <AccordionItem value="item-3">
//         <AccordionTrigger>Is it animated?</AccordionTrigger>
//         <AccordionContent>
//           Yes. It's animated by default, but you can disable it if you prefer.
//         </AccordionContent>
//       </AccordionItem>
//     </Accordion>
//   )
// }

function AccordionTitle({ title }: { title: string }) {
  return (
    <AccordionTrigger className="text-2xl font-bold text-[#0F0F0F]">
      {title}
    </AccordionTrigger>
  );
}

// "use client"

// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"

// import { toast } from "@/components/hooks/use-toast"
// import { Button } from "@/components/ui/button"
// import { Checkbox } from "@/components/ui/checkbox"
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"

// const items = [
//   {
//     id: "recents",
//     label: "Recents",
//   },
//   {
//     id: "home",
//     label: "Home",
//   },
//   {
//     id: "applications",
//     label: "Applications",
//   },
//   {
//     id: "desktop",
//     label: "Desktop",
//   },
//   {
//     id: "downloads",
//     label: "Downloads",
//   },
//   {
//     id: "documents",
//     label: "Documents",
//   },
// ] as const

// const FormSchema = z.object({
//   items: z.array(z.string()).refine((value) => value.some((item) => item), {
//     message: "You have to select at least one item.",
//   }),
// })

// export function CheckboxReactHookFormMultiple() {
//   const form = useForm<z.infer<typeof FormSchema>>({
//     resolver: zodResolver(FormSchema),
//     defaultValues: {
//       items: ["recents", "home"],
//     },
//   })

//   function onSubmit(data: z.infer<typeof FormSchema>) {
//     toast({
//       title: "You submitted the following values:",
//       description: (
//         <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
//           <code className="text-white">{JSON.stringify(data, null, 2)}</code>
//         </pre>
//       ),
//     })
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//         <FormField
//           control={form.control}
//           name="items"
//           render={() => (
//             <FormItem>
//               <div className="mb-4">
//                 <FormLabel className="text-base">Sidebar</FormLabel>
//                 <FormDescription>
//                   Select the items you want to display in the sidebar.
//                 </FormDescription>
//               </div>
//               {items.map((item) => (
//                 <FormField
//                   key={item.id}
//                   control={form.control}
//                   name="items"
//                   render={({ field }) => {
//                     return (
//                       <FormItem
//                         key={item.id}
//                         className="flex flex-row items-start space-x-3 space-y-0"
//                       >
//                         <FormControl>
//                           <Checkbox
//                             checked={field.value?.includes(item.id)}
//                             onCheckedChange={(checked) => {
//                               return checked
//                                 ? field.onChange([...field.value, item.id])
//                                 : field.onChange(
//                                     field.value?.filter(
//                                       (value) => value !== item.id
//                                     )
//                                   )
//                             }}
//                           />
//                         </FormControl>
//                         <FormLabel className="text-sm font-normal">
//                           {item.label}
//                         </FormLabel>
//                       </FormItem>
//                     )
//                   }}
//                 />
//               ))}
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <Button type="submit">Submit</Button>
//       </form>
//     </Form>
//   )
// }

'use client';

import { DownloadFileListPopoverButton } from '../../cms/_components/custom-popover';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Pen, RotateCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formSchema, FormValues } from '../formSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function CertificationClientComponent() {
  const [isCreateCertification, setIsCreateCertification] = useState(false);

  if (isCreateCertification) {
    return (
      <CertificationForm
        type="create"
        setIsCreateCertification={setIsCreateCertification}
      />
    );
  }
  return (
    <div>
      <div className="flex justify-between">
        <h2>Certification List</h2>
        <div>
          <DownloadFileListPopoverButton type="template" />
          {/* <CertificationFormModal type="create"> */}
          <Button
            variant="action"
            onClick={() => setIsCreateCertification(true)}
          >
            Create Certification
          </Button>
          {/* </CertificationFormModal> */}
        </div>
      </div>
      <div className="flex">
        {Array.from({ length: 4 }).map((_, index) => (
          <CertificationListItem key={index} />
        ))}
      </div>
    </div>
  );
}

function CertificationListItem() {
  return (
    <div className="flex items-center border border-zinc-200 rounded-md">
      <div>
        <h3>Galaxy S25 Expert: certification.name</h3>
        <time>2025.02.08</time>
      </div>
      <Button variant="ghost">
        <Pen />
      </Button>
    </div>
  );
}

function CertificationForm({
  type,
  setIsCreateCertification,
}: {
  type: 'create' | 'edit';
  setIsCreateCertification: (value: boolean) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      certificationName: '',
      slug: '',
      startDate: undefined,
      endDate: undefined,
      copyMedia: undefined,
      copyTarget: undefined,
      numberOfStages: undefined,
      firstBadgeName: '',
      ffFirstBadgeStage: undefined,
      fsmFirstBadgeStage: undefined,
      secondBadgeName: '',
      ffSecondBadgeStage: undefined,
      fsmSecondBadgeStage: undefined,
    },
  });
  const onSubmit = (data: FormValues) => {
    console.log('Form Data:', data);
  };

  console.log('🥕 errors', form.formState.errors);
  const resetValue = (value: string) => {
    form.setValue(value as keyof FormValues, '');
  };

  return (
    <div>
      <h2>
        {type === 'create' ? 'Create Certification' : 'Edit Certification'}
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="certification-form"
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="certificationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certification Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="flex">
                    <span>https://www.samsungplus.net/</span>
                    <Input placeholder="Enter Slug" {...field} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      type="button"
                      onClick={() => resetValue(field.name)}
                    >
                      <RotateCw />
                    </Button>
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon />
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 "
                      align="start"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon />
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 " align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="copyMedia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Media to Copy (Optional)</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: 이전 인증제 목록 */}
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="est">Galaxy AI Expert</SelectItem>
                      <SelectItem value="cst">Galaxy A10 Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="copyTarget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target to Copy (Optional)</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: 이전 인증제 목록 */}
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="est">Galaxy AI Expert</SelectItem>
                      <SelectItem value="cst">Galaxy A10 Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />
          <div>Stage Setting</div>
          <FormField
            control={form.control}
            name="numberOfStages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Stages</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }).map((_, index) => (
                        <SelectItem value={`${index}`} key={index}>
                          {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />
          <div>Badge Setting</div>
          <FormField
            control={form.control}
            name="firstBadgeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Badge Name</FormLabel>
                <FormControl>
                  <Input placeholder="Expert" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="secondBadgeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Second Badge Name</FormLabel>
                <FormControl>
                  <Input placeholder="Advanced" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Group</TableHead>
                <TableHead>First Badge Stage</TableHead>
                <TableHead>Second Badge Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>FF</TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name="ffFirstBadgeStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }).map((_, index) => (
                                <SelectItem value={`${index}`} key={index}>
                                  {index + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name="ffSecondBadgeStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }).map((_, index) => (
                                <SelectItem value={`${index}`} key={index}>
                                  {index + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>FSM</TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name="fsmFirstBadgeStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }).map((_, index) => (
                                <SelectItem value={`${index}`} key={index}>
                                  {index + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name="fsmSecondBadgeStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }).map((_, index) => (
                                <SelectItem value={`${index}`} key={index}>
                                  {index + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </form>
      </Form>

      <Button
        variant="secondary"
        onClick={() => setIsCreateCertification(false)}
      >
        Cancel
      </Button>

      <Button variant="action" type="submit" form="certification-form">
        Save
      </Button>
    </div>
  );
}

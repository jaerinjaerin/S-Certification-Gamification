'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DateRange,
  DayPicker,
  SelectRangeEventHandler,
} from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  /** 최종 선택 값이 업데이트되면 부모에 전달됩니다. */
  onSelect?: SelectRangeEventHandler;
};

export function CalendarRange({
  className,
  classNames,
  showOutsideDays = true,
  selected, // 부모로부터 전달받은(최종) 선택 값
  onSelect,
  ...props
}: CalendarProps) {
  /** 최종 확정된 선택 (부모의 selected 혹은 최종 사용자가 선택한 값) */
  const [finalRange, setFinalRange] = React.useState<DateRange>();
  /** 진행 중(임시) 선택 값 (첫 클릭 후부터 최종 선택 전까지) */
  const [tempRange, setTempRange] = React.useState<DateRange>();
  /** 진행 시작 전 백업된 값: 최종 선택값을 백업하여, 선택 취소 시 복원할 수 있도록 함 */
  const [backupRange, setBackupRange] = React.useState<DateRange>();
  /** 선택이 진행 중인지를 나타내는 플래그 */
  const [selecting, setSelecting] = React.useState<boolean>(false);
  /** 마우스 오버 중인 날짜(미리보기용) */
  const [hoveredDate, setHoveredDate] = React.useState<Date | undefined>(
    undefined
  );

  // 부모의 selected 값이 변경되고 선택 중이 아니라면 최종 선택 및 백업을 업데이트
  useEffect(() => {
    if (!selecting) {
      if (
        selected &&
        typeof selected === 'object' &&
        'from' in selected &&
        'to' in selected
      ) {
        setFinalRange(selected);
        setBackupRange(selected);
      }
    }
  }, [selected, selecting]);

  /**
   * 날짜 선택 핸들러
   * - 첫 클릭 시 백업 후 진행 모드로 전환하고 임시 선택(tempRange)을 설정
   * - 두번째 클릭 시 범위가 완성되면 최종 선택(finalRange)을 업데이트하고 진행 모드를 종료
   * - 선택 취소(범위가 undefined) 시 백업값으로 복원
   */
  const handleSelect: SelectRangeEventHandler = (range, day, modifiers, e) => {
    if (!selecting && range) {
      // 첫 클릭 시: 기존 최종 선택 값을 백업하고 진행 모드 시작
      setBackupRange(finalRange);
      setSelecting(true);

      // finalRange와 비교하여, range.from 이 finalRange.from 보다 빠르면 range.from을,
      // 그렇지 않으면 range.to를 사용해 tempRange를 설정 (to는 undefined)
      let newStart: Date | undefined;
      if (finalRange?.from && range.from && range.from < finalRange.from) {
        newStart = range.from;
      } else {
        newStart = range.to;
      }
      setTempRange({ from: newStart, to: undefined });
      return;
    }

    // 이미 선택 진행 중인 경우
    if (range) {
      // 만약 range에 to 값이 없는 경우 (즉, from만 있는 경우)이고 tempRange의 from이 존재한다면:
      if (range.from && !range.to && tempRange?.from) {
        let newRange: DateRange;
        if (range.from < tempRange.from) {
          // 새로운 선택값이 tempRange.from 보다 앞선다면, 두 날짜의 순서를 뒤집어 newRange 생성
          newRange = { from: range.from, to: tempRange.from };
        } else {
          // 그렇지 않다면, tempRange.from을 그대로 두고 새로운 날짜를 to로 설정
          newRange = { from: tempRange.from, to: range.from };
        }
        setTempRange(newRange);
        setFinalRange(newRange);
        setSelecting(false);
        setHoveredDate(undefined);
        if (onSelect) {
          onSelect(newRange, day, modifiers, e);
        }
      } else if (range.from && range.to) {
        // 두 날짜가 모두 선택되었으면(최종 선택) 두 날짜의 순서를 보정한 후 확정
        const newRange =
          range.from > range.to ? { from: range.to, to: range.from } : range;
        setTempRange(newRange);
        setFinalRange(newRange);
        setSelecting(false);
        setHoveredDate(undefined);
        if (onSelect) {
          onSelect(newRange, day, modifiers, e);
        }
      } else {
        // 아직 한 날짜만 선택된 경우
        setTempRange(range);
      }
    } else {
      if (onSelect) {
        onSelect(previewRange, day, modifiers, e);
      }

      // 선택 취소 시: 임시 선택을 비우고, 백업된 최종 선택값을 복원
      setTempRange(undefined);
      setSelecting(false);
      setFinalRange(previewRange);
    }
  };

  // 마우스 오버 시, 진행 중 선택에서 첫 날짜가 설정되어 있다면 미리보기 범위 업데이트
  const handleDayMouseEnter = (day: Date) => {
    if (selecting && tempRange && tempRange.from && !tempRange.to) {
      setHoveredDate(day);
    }
  };

  const handleDayMouseLeave = () => {
    setHoveredDate(undefined);
  };

  // 진행 중 선택과 마우스 오버 날짜를 바탕으로 미리보기 범위를 계산 (새 객체 생성)
  const previewRange = React.useMemo(() => {
    if (selecting && tempRange && tempRange.from && hoveredDate) {
      return {
        from: tempRange.from < hoveredDate ? tempRange.from : hoveredDate,
        to: tempRange.from < hoveredDate ? hoveredDate : tempRange.from,
      };
    }
    return undefined;
  }, [selecting, tempRange, hoveredDate]);

  // 달력에 표시할 선택 값: 선택 진행 중이면 미리보기(previewRange) 또는 진행중 임시 선택(tempRange),
  // 아니라면 확정된 최종 선택(finalRange)을 사용
  const displayedRange = selecting ? previewRange || tempRange : finalRange;
  return (
    <DayPicker
      selected={displayedRange}
      onSelect={handleSelect}
      onDayMouseEnter={handleDayMouseEnter}
      onDayMouseLeave={handleDayMouseLeave}
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',
          '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-8 w-8 p-0 font-normal aria-selected:opacity-100'
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside:
          'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn('h-4 w-4', className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn('h-4 w-4', className)} {...props} />
        ),
      }}
      numberOfMonths={props.numberOfMonths}
      mode="range"
      defaultMonth={props.defaultMonth}
      initialFocus={props.initialFocus}
    />
  );
}

CalendarRange.displayName = 'CalendarRange';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  totalItems: number; // 전체 아이템 개수
  pageSize: number; // 각 페이지당 아이템 개수
  currentPage: number; // 현재 페이지
  onPageChange: (page: number) => void; // 페이지 변경 이벤트
  maxPageButtons?: number; // 페이지 번호 최대 표시 개수
};

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  maxPageButtons = 3,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize); // 총 페이지 수
  const startPage = Math.max(
    1,
    Math.min(
      currentPage - Math.floor(maxPageButtons / 2),
      totalPages - maxPageButtons + 1
    )
  );
  const endPage = Math.min(startPage + maxPageButtons - 1, totalPages);

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const itemInfo =
    startItem === endItem
      ? `${endItem} of ${totalItems} items`
      : `${startItem}-${endItem} of ${totalItems} items`;

  const buttonOptions = 'w-[1.875rem] h-[1.875rem] text-zinc-500';

  return (
    <div className="flex items-center justify-between px-5">
      {/* 현재 페이지 정보 */}
      <div className="text-zinc-500">{itemInfo}</div>

      {/* 페이지네이션 컨트롤 */}
      <div className="flex items-center gap-2">
        {/* 왼쪽 버튼 */}
        <Button
          className={buttonOptions}
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft />
        </Button>

        {/* 첫 페이지와 ... */}
        {startPage > 1 && (
          <>
            <Button
              className={buttonOptions}
              variant="outline"
              onClick={() => onPageChange(1)}
            >
              1
            </Button>
            {startPage > 2 && <span>...</span>}
          </>
        )}

        {/* 페이지 번호 */}
        {Array.from({ length: endPage - startPage + 1 }, (_, index) => {
          const page = startPage + index;
          return (
            <Button
              key={page}
              variant="outline"
              onClick={() => onPageChange(page)}
              className={`${buttonOptions} ${
                page === currentPage
                  ? 'text-zinc-950 font-medium bg-zinc-200 pointer-events-none border-2'
                  : ''
              }`}
            >
              {page}
            </Button>
          );
        })}

        {/* 마지막 페이지와 ... */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span>...</span>}
            <Button
              className={buttonOptions}
              variant="outline"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}

        {/* 오른쪽 버튼 */}
        <Button
          className={buttonOptions}
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;

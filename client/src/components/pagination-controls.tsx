import { ButtonHTMLAttributes, FC, ReactNode } from "react";
import {
  MdChevronLeft,
  MdChevronRight,
  MdSkipNext,
  MdSkipPrevious,
} from "react-icons/md";

const LocalButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={`disabled:opacity-50 disabled:cursor-not-allowed ${props.className}`}
      {...props}
    />
  );
};

export const PaginationControls: FC<{
  children?: ReactNode;
  currentPage: number;
  maxPage: number;
  handleNext: () => void;
  handlePrevious: () => void;
  handleFirst: () => void;
  handleLast: () => void;
}> = ({
  children,
  currentPage,
  handleFirst,
  handleLast,
  handleNext,
  handlePrevious,
  maxPage,
}) => {
  const isFirst = currentPage === 1;
  const isLast = currentPage === maxPage;
  return (
    <section
      aria-label="pagination controls"
      className="flex gap-3 items-center"
    >
      <LocalButton type="button" disabled={isFirst} onClick={handleFirst}>
        <MdSkipPrevious size={20} />
      </LocalButton>
      <LocalButton type="button" disabled={isFirst} onClick={handlePrevious}>
        <MdChevronLeft size={20} />
      </LocalButton>
      {children ? children : <p>Page {currentPage}</p>}

      <LocalButton type="button" onClick={handleNext} disabled={isLast}>
        <MdChevronRight size={20} />
      </LocalButton>
      <LocalButton type="button" disabled={isLast}>
        <MdSkipNext size={20} onClick={handleLast} />
      </LocalButton>
    </section>
  );
};

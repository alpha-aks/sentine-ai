import React from 'react';
import { Button } from '@/components/ui/button';
import { AutosaveIndicator } from './AutosaveIndicator';
import { useSubmissionStore } from '@/store/submission-store';
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, FileCheck } from 'lucide-react';

interface SubmissionFooterProps {
  currentQuestionId: string;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onReviewSubmit: () => void;
  disabled?: boolean;
}

export function SubmissionFooter({
  currentQuestionId,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onReviewSubmit,
  disabled
}: SubmissionFooterProps) {
  const markedForReview = useSubmissionStore((s) => s.markedForReview);
  const toggleMarkForReview = useSubmissionStore((s) => s.toggleMarkForReview);

  const isMarked = Boolean(markedForReview[currentQuestionId]);

  return (
    <footer className="border-t border-border bg-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-10 shadow-lg">
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevious || disabled}
          onClick={onPrevious}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => toggleMarkForReview(currentQuestionId)}
          className={isMarked ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 font-semibold' : ''}
        >
          {isMarked ? (
            <>
              <BookmarkCheck className="mr-1.5 h-4 w-4 text-amber-400" /> Marked for Review
            </>
          ) : (
            <>
              <Bookmark className="mr-1.5 h-4 w-4" /> Mark for Review
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <AutosaveIndicator />

        {hasNext ? (
          <Button size="sm" onClick={onNext} disabled={disabled} className="px-6 font-bold">
            Next <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onReviewSubmit}
            disabled={disabled}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6"
          >
            Review & Submit <FileCheck className="ml-1.5 h-4 w-4" />
          </Button>
        )}
      </div>
    </footer>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import { SingleChoiceAnswer } from './question-types/SingleChoiceAnswer';
import { MultipleChoiceAnswer } from './question-types/MultipleChoiceAnswer';
import { TrueFalseAnswer } from './question-types/TrueFalseAnswer';
import { ShortAnswer } from './question-types/ShortAnswer';
import { LongAnswer } from './question-types/LongAnswer';
import { NumericalAnswer } from './question-types/NumericalAnswer';
import { ProgrammingAnswer } from './question-types/ProgrammingAnswer';
import { FileUploadAnswer } from './question-types/FileUploadAnswer';
import { MatchingAnswer } from './question-types/MatchingAnswer';
import { OrderingAnswer } from './question-types/OrderingAnswer';

export interface QuestionData {
  questionId: string;
  type: string;
  text: string;
  options?: string[];
  pairs?: { left: string; rightOptions: string[] }[];
  items?: string[];
}

interface AnswerControllerProps {
  question: QuestionData;
  initialValue?: any;
  onAutosaveDraft: (val: any) => void;
  disabled?: boolean;
}

export function AnswerController({ question, initialValue, onAutosaveDraft, disabled }: AnswerControllerProps) {
  const [value, setValue] = useState<any>(initialValue);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setValue(initialValue);
    isFirstRender.current = true;
  }, [question.questionId, initialValue]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onAutosaveDraft(value);
    }, 1500);

    return () => clearTimeout(timer);
  }, [value, onAutosaveDraft]);

  const handleChange = (newVal: any) => {
    setValue(newVal);
  };

  const renderQuestionInput = () => {
    const qType = question.type.toUpperCase();

    if (qType === 'SINGLE_CHOICE' || qType === 'MULTIPLE_CHOICE_SINGLE') {
      return (
        <SingleChoiceAnswer
          options={question.options || []}
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      );
    }

    if (qType === 'MULTIPLE_CHOICE' || qType === 'MULTIPLE_SELECT') {
      return (
        <MultipleChoiceAnswer
          options={question.options || []}
          value={Array.isArray(value) ? value : []}
          onChange={handleChange}
          disabled={disabled}
        />
      );
    }

    if (qType === 'TRUE_FALSE') {
      return (
        <TrueFalseAnswer
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      );
    }

    if (qType === 'SHORT_ANSWER') {
      return (
        <ShortAnswer
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      );
    }

    if (qType === 'LONG_ANSWER' || qType === 'ESSAY') {
      return (
        <LongAnswer
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      );
    }

    if (qType === 'NUMERICAL') {
      return (
        <NumericalAnswer
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      );
    }

    if (qType === 'PROGRAMMING' || qType === 'CODE') {
      return (
        <ProgrammingAnswer
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      );
    }

    if (qType === 'FILE_UPLOAD') {
      return (
        <FileUploadAnswer
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      );
    }

    if (qType === 'MATCHING') {
      return (
        <MatchingAnswer
          pairs={question.pairs || []}
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      );
    }

    if (qType === 'ORDERING') {
      return (
        <OrderingAnswer
          items={question.items || []}
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      );
    }

    // Default Fallback
    return (
      <ShortAnswer
        value={typeof value === 'string' ? value : JSON.stringify(value || '')}
        onChange={handleChange}
        disabled={disabled}
      />
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-foreground leading-snug">{question.text}</h3>
      <div className="pt-2">{renderQuestionInput()}</div>
    </div>
  );
}

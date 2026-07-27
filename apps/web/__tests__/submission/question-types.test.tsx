import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SingleChoiceAnswer } from '@/components/submission/question-types/SingleChoiceAnswer';
import { TrueFalseAnswer } from '@/components/submission/question-types/TrueFalseAnswer';
import { ShortAnswer } from '@/components/submission/question-types/ShortAnswer';

describe('Question Type Renderers', () => {
  it('renders SingleChoiceAnswer and handles option selection', () => {
    const handleChange = jest.fn();
    render(
      <SingleChoiceAnswer
        options={['Option A', 'Option B']}
        value="Option A"
        onChange={handleChange}
      />
    );

    expect(screen.getByText('Option A')).toBeInTheDocument();
    const radioB = screen.getByDisplayValue('Option B');
    fireEvent.click(radioB);
    expect(handleChange).toHaveBeenCalledWith('Option B');
  });

  it('renders TrueFalseAnswer buttons', () => {
    const handleChange = jest.fn();
    render(<TrueFalseAnswer value={true} onChange={handleChange} />);

    const falseBtn = screen.getByText('FALSE');
    fireEvent.click(falseBtn);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('renders ShortAnswer input and updates text', () => {
    const handleChange = jest.fn();
    render(<ShortAnswer value="Hello" onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Type your short response...');
    fireEvent.change(input, { target: { value: 'Hello World' } });
    expect(handleChange).toHaveBeenCalledWith('Hello World');
  });
});

import React from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

interface MathJaxContentProps {
  content: string;
  className?: string;
}

const MathJaxContent: React.FC<MathJaxContentProps> = ({ content, className }) => {
  const config = {
    loader: { load: ["input/asciimath"] },
    asciimath: {
      delimiters: [["`", "`"], ["$", "$"]]
    }
  };

  return (
    <MathJaxContext config={config}>
      <div className={className}>
        <MathJax inline dynamic>
          <span dangerouslySetInnerHTML={{ __html: content }} />
        </MathJax>
      </div>
    </MathJaxContext>
  );
};

export default MathJaxContent;

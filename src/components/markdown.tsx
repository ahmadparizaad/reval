import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// const preprocessMathMarkdown = (text: string): string => {
//     return text
//       // Fix spacing around \geq, \leq, etc.
//       .replace(/\\geq(?!\s)/g, "\\geq ")
//       .replace(/\\leq(?!\s)/g, "\\leq ")
//       .replace(/\\text\s*\{\s*(.*?)\s*\}/g, "\\text{$1}") // Fix text spacing
//       // Convert ( X ) to proper inline math notation: ( X ) → $X$
//       .replace(/\(\s*([a-zA-Z0-9\\+\-*\/^_{}]+)\s*\)/g, "$$$1$$")
//       // Ensure consistent fractions formatting
//       .replace(/\\frac\s*\{(.*?)\}\s*\{(.*?)\}/g, "\\frac{$1}{$2}")
//       // Convert \dots to \cdots where appropriate
//       .replace(/\\dots/g, "\\cdots")
//       // Ensure block equations inside $...$ become $$...$$
//       .replace(/\$(\s*\\begin\{[^]*?\}[^]*?\\end\{[^]*?\})\$/g, "$$\n$1\n$$");
//   };
  
const MarkdownRenderer = ({ content }: { content: string }) => {
    // const processedContent = preprocessMathMarkdown(content);
  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {content}
    </ReactMarkdown>
  );
};
export default MarkdownRenderer;
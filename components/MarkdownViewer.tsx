import React from 'react';

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none font-serif leading-relaxed text-slate-800 dark:text-slate-200">
      {lines.map((line, index) => {
        // H2
        if (line.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">{line.replace('## ', '')}</h2>;
        }
        // H3
        if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-bold mt-6 mb-3 text-slate-900 dark:text-white">{line.replace('### ', '')}</h3>;
        }
         // H1
         if (line.startsWith('# ')) {
            return <h1 key={index} className="text-3xl font-bold mt-2 mb-8 text-center text-slate-900 dark:text-white uppercase tracking-tight">{line.replace('# ', '')}</h1>;
        }
        // Bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const cleanLine = line.trim().substring(2);
            // Simple bold parser within list items
            const parts = cleanLine.split('**');
            return (
                <li key={index} className="ml-6 list-disc mb-2 pl-2 marker:text-slate-400 dark:marker:text-slate-500">
                    {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-slate-900 dark:text-white">{part}</strong> : part)}
                </li>
            );
        }
        // Numbered list (basic heuristic)
        if (/^\d+\./.test(line.trim())) {
             const parts = line.split('**');
             return (
                 <div key={index} className="ml-6 mb-2 block pl-2">
                     {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-slate-900 dark:text-white">{part}</strong> : part)}
                 </div>
             )
        }
        
        // Empty line
        if (line.trim() === '') {
            return <div key={index} className="h-4"></div>;
        }

        // Standard Paragraph with Bold support
        const parts = line.split('**');
        return (
          <p key={index} className="mb-4 text-justify">
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i} className="font-semibold text-slate-900 dark:text-white">{part}</strong> : part
            )}
          </p>
        );
      })}
    </div>
  );
};
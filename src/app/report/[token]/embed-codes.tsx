'use client';

import { useState } from 'react';

interface ReportEmbedCodesProps {
  name: string;
  layout: string;
  snippet: string;
}

export default function ReportEmbedCodes({ name, layout, snippet }: ReportEmbedCodesProps) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-medium text-gray-900">{name}</span>
          <span className="text-xs text-gray-400 ml-2">{layout}</span>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(snippet);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
        {snippet}
      </pre>
    </div>
  );
}

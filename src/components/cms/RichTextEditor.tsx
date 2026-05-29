
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, List, Link2, Heading1, Heading2,
  Quote, Code, Image, Eye, Edit3, ListOrdered, Sparkles
} from "lucide-react";

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label, value, onChange, placeholder = "Enter content...", rows = 10
}) => {
  const [activeTab, setActiveTab] = useState<string>("write");

  const insertText = (before: string, after: string = '', newLine: boolean = false) => {
    const textarea = document.getElementById('rich-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const prefix = newLine && start > 0 && value[start - 1] !== '\n' ? '\n' : '';
    onChange(value.substring(0, start) + prefix + before + selectedText + after + value.substring(end));
    setTimeout(() => {
      textarea.focus();
      const newStart = start + prefix.length + before.length;
      textarea.setSelectionRange(newStart, newStart + selectedText.length);
    }, 0);
  };

  const renderPreview = (md: string): string => {
    if (!md) return '';
    return md
      .replace(/^### (.*$)/gm, '<h3 style="font-size:1.1rem;font-weight:700;color:#e5e7eb;margin:1.5rem 0 0.5rem">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="font-size:1.3rem;font-weight:700;color:#f3f4f6;margin:2rem 0 0.75rem">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="font-size:1.6rem;font-weight:700;color:#ffffff;margin:2.5rem 0 1rem">$1</h1>')
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color:#d1d5db">$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.85em;color:#a5b4fc">$1</code>')
      .replace(/^> (.*$)/gm, '<blockquote style="border-left:3px solid rgba(255,255,255,0.15);padding-left:1rem;margin:1rem 0;color:rgba(255,255,255,0.5);font-style:italic">$1</blockquote>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:#818cf8;text-decoration:underline">$1</a>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:12px;margin:1rem 0" />')
      .replace(/^- (.*$)/gm, '<li style="color:#d1d5db;margin-left:1.5rem;margin-bottom:4px">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li style="color:#d1d5db;margin-left:1.5rem;margin-bottom:4px">$1</li>')
      .replace(/\n/g, '<br />');
  };

  const toolbarButtons = [
    { icon: Heading1, action: () => insertText('# ', '', true), title: 'Heading 1' },
    { icon: Heading2, action: () => insertText('## ', '', true), title: 'Heading 2' },
    { icon: Bold, action: () => insertText('**', '**'), title: 'Bold' },
    { icon: Italic, action: () => insertText('*', '*'), title: 'Italic' },
    { icon: Quote, action: () => insertText('> ', '', true), title: 'Quote' },
    { icon: Code, action: () => insertText('`', '`'), title: 'Code' },
    { icon: List, action: () => insertText('- ', '', true), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertText('1. ', '', true), title: 'Numbered List' },
    { icon: Link2, action: () => insertText('[', '](url)'), title: 'Link' },
    { icon: Image, action: () => insertText('![alt](', ')'), title: 'Image' },
  ];

  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2">
        <Sparkles className="h-3 w-3 text-yellow-400" />
        {label}
      </Label>

      <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#0d0d0d]">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-0.5 p-2.5 bg-white/3 border-b border-white/5">
          {toolbarButtons.map((btn, i) => (
            <Button key={i} type="button" variant="ghost" size="sm" onClick={btn.action}
              className="h-8 w-8 p-0 text-white/25 hover:text-white hover:bg-white/8 rounded-lg transition-all"
              title={btn.title}>
              <btn.icon className="h-3.5 w-3.5" />
            </Button>
          ))}

          <div className="flex-1" />

          {/* View Toggle */}
          <div className="flex bg-white/5 rounded-xl border border-white/5 p-0.5">
            <Button type="button" variant="ghost" size="sm" onClick={() => setActiveTab("write")}
              className={`h-7 px-3 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === "write" ? "bg-white/10 text-white" : "text-white/25 hover:text-white/50"}`}>
              <Edit3 className="h-3 w-3 mr-1.5" />Write
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setActiveTab("preview")}
              className={`h-7 px-3 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === "preview" ? "bg-white/10 text-white" : "text-white/25 hover:text-white/50"}`}>
              <Eye className="h-3 w-3 mr-1.5" />Preview
            </Button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "write" ? (
          <Textarea
            id="rich-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="border-0 rounded-none bg-transparent text-white/80 focus:ring-0 focus:border-0 font-mono text-sm p-5 resize-none placeholder:text-white/15"
            style={{ minHeight: `${rows * 24}px` }}
          />
        ) : (
          <div
            className="p-6 min-h-[240px] text-white/70 leading-relaxed text-sm"
            dangerouslySetInnerHTML={{
              __html: renderPreview(value) || '<p style="color:rgba(255,255,255,0.15);font-style:italic">Nothing to preview yet...</p>'
            }}
          />
        )}
      </div>

      <div className="flex justify-between items-center px-1.5">
        <p className="text-[8px] font-bold uppercase tracking-widest text-white/20">
          Markdown: # h1, **bold**, *italic*, [link](url), `code`
        </p>
        <p className="text-[8px] font-bold uppercase tracking-widest text-white/20">
          {value.length} chars
        </p>
      </div>
    </div>
  );
};

export default RichTextEditor;

import React, { useRef, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  RemoveFormatting,
  Code,
  Eye,
  Type,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

export const isYouTubeUrl = (str) => {
  if (!str || typeof str !== "string") return false;
  return /(?:youtube\.com|youtu\.be|youtube-nocookie\.com)/i.test(str);
};

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Tuliskan deskripsi lengkap usaha di sini...",
  minHeight = "220px",
  disabled = false,
}) {
  const editorRef = useRef(null);
  const isUpdatingFromPropRef = useRef(false);
  const [isCodeView, setIsCodeView] = useState(false);
  const [rawHtml, setRawHtml] = useState(value || "");
  const [activeFormats, setActiveFormats] = useState({});
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [currentBlockTag, setCurrentBlockTag] = useState("p");
  const [formatDropdownOpen, setFormatDropdownOpen] = useState(false);
  const [hasYouTubeWarning, setHasYouTubeWarning] = useState(false);
  const formatDropdownRef = useRef(null);

  // Helper to count words and chars
  const updateCounts = useCallback((html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html || "";
    const text = tempDiv.textContent || tempDiv.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
    setHasYouTubeWarning(isYouTubeUrl(html));
  }, []);

  // Sync prop value into contentEditable
  useEffect(() => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      if (value !== currentContent) {
        isUpdatingFromPropRef.current = true;
        editorRef.current.innerHTML = value || "";
        setRawHtml(value || "");
        updateCounts(value || "");
        isUpdatingFromPropRef.current = false;
      }
    } else {
      setRawHtml(value || "");
      updateCounts(value || "");
    }
  }, [value, updateCounts]);

  // Outside click for format dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (formatDropdownRef.current && !formatDropdownRef.current.contains(e.target)) {
        setFormatDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check active format commands
  const checkActiveFormats = useCallback(() => {
    if (!editorRef.current || isCodeView) return;
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        justifyFull: document.queryCommandState("justifyFull"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
      });

      const blockVal = (document.queryCommandValue("formatBlock") || "").toLowerCase();
      if (blockVal.includes("h2")) setCurrentBlockTag("h2");
      else if (blockVal.includes("h3")) setCurrentBlockTag("h3");
      else if (blockVal.includes("blockquote")) setCurrentBlockTag("blockquote");
      else setCurrentBlockTag("p");
    } catch (e) {}
  }, [isCodeView]);

  // Handle content changes
  const handleContentChange = () => {
    if (isUpdatingFromPropRef.current || !editorRef.current) return;
    let newHtml = editorRef.current.innerHTML;

    // Check for YouTube links or embeds
    if (isYouTubeUrl(newHtml)) {
      toast.error("Tidak diperbolehkan memasukkan link video YouTube ke dalam deskripsi. Silakan gunakan fitur Galeri Video.", {
        duration: 5000,
        id: "yt-link-prohibited",
      });
      setHasYouTubeWarning(true);
    } else {
      setHasYouTubeWarning(false);
    }

    setRawHtml(newHtml);
    updateCounts(newHtml);
    if (onChange) {
      onChange(newHtml);
    }
    checkActiveFormats();
  };

  // Intercept Paste events to block YouTube URLs
  const handlePaste = (e) => {
    const pasteText = e.clipboardData?.getData("text") || "";
    const pasteHtml = e.clipboardData?.getData("text/html") || "";

    if (isYouTubeUrl(pasteText) || isYouTubeUrl(pasteHtml)) {
      e.preventDefault();
      toast.error("Tidak diperbolehkan memasukkan link video YouTube ke dalam deskripsi. Silakan gunakan fitur Galeri Video.", {
        duration: 5000,
        id: "yt-link-prohibited",
      });

      // Strip YouTube URLs from pasted text
      const cleanText = pasteText
        .replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/|youtube-nocookie\.com\/|m\.youtube\.com\/)[^\s]+/gi, "")
        .replace(/https?:\/\/[^\s]*youtu[^\s]*/gi, "");

      if (cleanText.trim()) {
        document.execCommand("insertText", false, cleanText);
      }
      handleContentChange();
    }
  };

  // Execute formatting command
  const execCmd = (cmd, val = null) => {
    if (disabled || isCodeView) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(cmd, false, val);
    handleContentChange();
    checkActiveFormats();
  };

  // Handle block format change (p, h2, h3, blockquote)
  const handleBlockChange = (tag) => {
    setFormatDropdownOpen(false);
    if (disabled || isCodeView) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    if (tag === "blockquote") {
      document.execCommand("formatBlock", false, "<blockquote>");
    } else if (tag === "h2") {
      document.execCommand("formatBlock", false, "<h2>");
    } else if (tag === "h3") {
      document.execCommand("formatBlock", false, "<h3>");
    } else {
      document.execCommand("formatBlock", false, "<p>");
    }
    setCurrentBlockTag(tag);
    handleContentChange();
  };

  // Handle link insertion with strict YouTube restriction
  const handleInsertLink = () => {
    if (disabled || isCodeView) return;
    const url = prompt("Masukkan URL tautan (contoh: https://instagram.com/usaha):");
    if (url) {
      if (isYouTubeUrl(url)) {
        toast.error("Tidak diperbolehkan memasukkan link video YouTube ke dalam deskripsi. Silakan gunakan fitur Galeri Video.", {
          duration: 5000,
          id: "yt-link-prohibited",
        });
        return;
      }
      const validUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
      execCmd("createLink", validUrl);
    }
  };

  // Handle Code View toggle
  const toggleCodeView = () => {
    if (isCodeView) {
      // Switching from Code to Visual
      if (editorRef.current) {
        editorRef.current.innerHTML = rawHtml;
      }
      setIsCodeView(false);
      if (onChange) onChange(rawHtml);
    } else {
      // Switching from Visual to Code
      if (editorRef.current) {
        setRawHtml(editorRef.current.innerHTML);
      }
      setIsCodeView(true);
    }
  };

  // Raw HTML Code Change handler
  const handleRawHtmlChange = (e) => {
    const val = e.target.value;
    if (isYouTubeUrl(val)) {
      toast.error("Tidak diperbolehkan memasukkan link video YouTube ke dalam deskripsi. Silakan gunakan fitur Galeri Video.", {
        duration: 5000,
        id: "yt-link-prohibited",
      });
      setHasYouTubeWarning(true);
    } else {
      setHasYouTubeWarning(false);
    }
    setRawHtml(val);
    updateCounts(val);
    if (onChange) onChange(val);
  };

  const BLOCK_OPTIONS = [
    { id: "p", label: "Paragraf", sample: "Teks Normal" },
    { id: "h2", label: "Judul Besar (H2)", sample: "Heading 2" },
    { id: "h3", label: "Sub Judul (H3)", sample: "Heading 3" },
    { id: "blockquote", label: "Kutipan (Quote)", sample: "Blockquote" },
  ];

  return (
    <div className="w-full border-[1.5px] border-[#cbd5e1] rounded-2xl bg-white shadow-xs overflow-hidden focus-within:border-[#007570] focus-within:ring-3 focus-within:ring-[#007570]/10 transition-all font-sans text-[#0f172a]">
      {/* ── TINYMCE STYLE TOOLBAR ── */}
      <div className="bg-[#f8fafc] border-b border-[#e2e8f0] px-3 py-2 flex items-center justify-between gap-2 flex-wrap select-none">
        {/* Left Toolbar Items */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Format Block Dropdown */}
          <div className="relative" ref={formatDropdownRef}>
            <button
              type="button"
              disabled={disabled || isCodeView}
              onClick={() => setFormatDropdownOpen(!formatDropdownOpen)}
              className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-white border border-[#cbd5e1] text-[#334155] hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Gaya Paragraf"
            >
              <Type size={13} className="text-[#007570]" />
              <span>{BLOCK_OPTIONS.find((b) => b.id === currentBlockTag)?.label || "Paragraf"}</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {formatDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                {BLOCK_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleBlockChange(opt.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      currentBlockTag === opt.id ? "bg-[#e6f7f5] text-[#007570] font-bold" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

          {/* Inline Formats: Bold, Italic, Underline, Strike */}
          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => execCmd("bold")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeFormats.bold ? "bg-[#007570] text-white" : "text-slate-700 hover:bg-slate-200/70"
            } disabled:opacity-40`}
            title="Tebal (Ctrl+B)"
          >
            <Bold size={15} />
          </button>

          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => execCmd("italic")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeFormats.italic ? "bg-[#007570] text-white" : "text-slate-700 hover:bg-slate-200/70"
            } disabled:opacity-40`}
            title="Miring (Ctrl+I)"
          >
            <Italic size={15} />
          </button>

          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => execCmd("underline")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeFormats.underline ? "bg-[#007570] text-white" : "text-slate-700 hover:bg-slate-200/70"
            } disabled:opacity-40`}
            title="Garis Bawah (Ctrl+U)"
          >
            <Underline size={15} />
          </button>

          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => execCmd("strikeThrough")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeFormats.strikeThrough ? "bg-[#007570] text-white" : "text-slate-700 hover:bg-slate-200/70"
            } disabled:opacity-40`}
            title="Coret Teks"
          >
            <Strikethrough size={15} />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

          {/* Alignments */}
          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => execCmd("justifyLeft")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeFormats.justifyLeft ? "bg-[#007570] text-white" : "text-slate-700 hover:bg-slate-200/70"
            } disabled:opacity-40`}
            title="Rata Kiri"
          >
            <AlignLeft size={15} />
          </button>

          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => execCmd("justifyCenter")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeFormats.justifyCenter ? "bg-[#007570] text-white" : "text-slate-700 hover:bg-slate-200/70"
            } disabled:opacity-40`}
            title="Rata Tengah"
          >
            <AlignCenter size={15} />
          </button>

          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => execCmd("justifyRight")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeFormats.justifyRight ? "bg-[#007570] text-white" : "text-slate-700 hover:bg-slate-200/70"
            } disabled:opacity-40`}
            title="Rata Kanan"
          >
            <AlignRight size={15} />
          </button>

          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => execCmd("justifyFull")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeFormats.justifyFull ? "bg-[#007570] text-white" : "text-slate-700 hover:bg-slate-200/70"
            } disabled:opacity-40`}
            title="Rata Kanan-Kiri"
          >
            <AlignJustify size={15} />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

          {/* Lists */}
          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => execCmd("insertUnorderedList")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeFormats.insertUnorderedList ? "bg-[#007570] text-white" : "text-slate-700 hover:bg-slate-200/70"
            } disabled:opacity-40`}
            title="Daftar Poin (Bullets)"
          >
            <List size={15} />
          </button>

          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => execCmd("insertOrderedList")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeFormats.insertOrderedList ? "bg-[#007570] text-white" : "text-slate-700 hover:bg-slate-200/70"
            } disabled:opacity-40`}
            title="Daftar Nomor"
          >
            <ListOrdered size={15} />
          </button>

          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => handleBlockChange("blockquote")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer disabled:opacity-40"
            title="Kutipan (Blockquote)"
          >
            <Quote size={14} />
          </button>

          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => execCmd("insertHorizontalRule")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer disabled:opacity-40"
            title="Garis Pemisah (Horizontal Line)"
          >
            <Minus size={15} />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

          {/* Link & Clear Format */}
          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={handleInsertLink}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer disabled:opacity-40"
            title="Sisipkan Tautan"
          >
            <LinkIcon size={14} />
          </button>

          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => execCmd("unlink")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer disabled:opacity-40"
            title="Hapus Tautan"
          >
            <Unlink size={14} />
          </button>

          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => execCmd("removeFormat")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer disabled:opacity-40"
            title="Hapus Format"
          >
            <RemoveFormatting size={14} />
          </button>
        </div>

        {/* Right Toolbar Items: Undo, Redo, Source Code View */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => execCmd("undo")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer disabled:opacity-40"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={14} />
          </button>

          <button
            type="button"
            disabled={disabled || isCodeView}
            onClick={() => execCmd("redo")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer disabled:opacity-40"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={14} />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

          {/* HTML Source Toggle Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={toggleCodeView}
            className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isCodeView
                ? "bg-[#007570] text-white"
                : "bg-white border border-[#cbd5e1] text-slate-700 hover:bg-slate-100"
            }`}
            title={isCodeView ? "Beralih ke Tampilan Visual" : "Lihat Kode Sumber HTML"}
          >
            {isCodeView ? <Eye size={13} /> : <Code size={13} />}
            <span>{isCodeView ? "Visual" : "HTML"}</span>
          </button>
        </div>
      </div>

      {/* ── EDITABLE CONTENT AREA ── */}
      {isCodeView ? (
        <textarea
          value={rawHtml}
          onChange={handleRawHtmlChange}
          disabled={disabled}
          placeholder="Tulis kode HTML di sini..."
          style={{ minHeight }}
          className="w-full p-4 font-mono text-xs text-slate-800 bg-[#1e293b] text-emerald-300 outline-none resize-y leading-relaxed border-0"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleContentChange}
          onPaste={handlePaste}
          onKeyUp={checkActiveFormats}
          onMouseUp={checkActiveFormats}
          data-placeholder={placeholder}
          style={{ minHeight }}
          className="w-full p-4 sm:p-5 outline-none text-[0.95rem] text-[#0f172a] leading-relaxed bg-white prose max-w-none focus:outline-none overflow-y-auto [&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-slate-400 [&:empty:before]:pointer-events-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-[#007570] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:my-3 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-[#0f172a] [&_h2]:my-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#0f172a] [&_h3]:my-2 [&_hr]:my-4 [&_hr]:border-slate-200 [&_a]:text-[#007570] [&_a]:underline font-normal"
        />
      )}

      {/* ── YOUTUBE LINK RESTRICTION BANNER ── */}
      {hasYouTubeWarning && (
        <div className="bg-rose-50 border-t border-rose-200 px-4 py-2 flex items-center gap-2 text-rose-700 text-xs font-semibold animate-in fade-in duration-200">
          <AlertCircle size={15} className="shrink-0 text-rose-600" />
          <span>Link video YouTube terdeteksi! Mohon hapus link tersebut. Gunakan fitur Galeri Video pada paket Premium.</span>
        </div>
      )}

      {/* ── TINYMCE STYLE STATUS BAR ── */}
      <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-3.5 py-1.5 flex items-center justify-between text-[11px] text-slate-500 font-medium select-none">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Info.co.id Editor</span>
          <span>&bull;</span>
          <span className="capitalize">{isCodeView ? "Mode Kode HTML" : `Tag: <${currentBlockTag}>`}</span>
        </div>
        <div className="flex items-center gap-3">
          <span><strong>{wordCount}</strong> kata</span>
          <span>&bull;</span>
          <span><strong>{charCount}</strong> karakter</span>
        </div>
      </div>
    </div>
  );
}

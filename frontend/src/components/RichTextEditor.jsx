import { useState } from "react";
import "./RichTextEditor.css";

/**
 * Simple Rich Text Editor component
 */
export default function RichTextEditor({ value = "", onChange, placeholder = "Tulis sesuatu..." }) {
  const [content, setContent] = useState(value);

  const handleChange = (e) => {
    const newValue = e.target.innerHTML;
    setContent(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="rich-text-editor">
      <div 
        className="editor-content"
        contentEditable={true}
        dangerouslySetInnerHTML={{ __html: content || "" }}
        onInput={handleChange}
        onBlur={handleChange}
        data-placeholder={placeholder}
        style={{
          minHeight: "120px",
          padding: "12px",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          outline: "none",
          fontSize: "14px",
          lineHeight: "1.5"
        }}
      />
    </div>
  );
}
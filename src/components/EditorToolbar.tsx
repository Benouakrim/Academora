import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Image,
  Highlighter,
  Type,
  Minus,
  Upload,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { uploadAPI } from '../lib/api';

interface EditorToolbarProps {
  editor: Editor | null;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const fontSizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontSizeRef.current && !fontSizeRef.current.contains(event.target as Node)) {
        setShowFontSize(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      className={`
        p-2.5 rounded-lg transition-all duration-200 ease-in-out
        ${isActive 
          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30 scale-95' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:scale-105'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
        flex items-center justify-center
      `}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-1" />
  );

  const handleSetLink = () => {
    if (linkUrl) {
      // Check if text is selected
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (hasSelection) {
        // Apply link to selected text
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: linkUrl })
          .run();
      } else {
        // Insert link as clickable text
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${linkUrl}">${linkUrl}</a>`)
          .run();
      }
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const handleSetImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const handleImageFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      const result = await uploadAPI.uploadImage(file);
      const fullUrl = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${result.imageUrl}`;
      editor.chain().focus().setImage({ src: fullUrl }).run();
      setShowImageInput(false);
    } catch (err: any) {
      alert(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      // Clear the file input
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = '';
      }
    }
  };

  const fontSizes = [
    { label: 'Small', value: '14px', class: 'text-sm' },
    { label: 'Normal', value: '16px', class: 'text-base' },
    { label: 'Large', value: '18px', class: 'text-lg' },
    { label: 'Extra Large', value: '24px', class: 'text-xl' },
    { label: 'Huge', value: '32px', class: 'text-2xl' },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-md">
      <div className="flex flex-wrap items-center gap-1">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-5 w-5" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Highlight"
        >
          <Highlighter className="h-5 w-5" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-5 w-5" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-5 w-5" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
        >
          <AlignJustify className="h-5 w-5" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Code & Quote */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="h-5 w-5" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run();
              } else {
                setShowLinkInput(!showLinkInput);
                setTimeout(() => linkInputRef.current?.focus(), 100);
              }
            }}
            isActive={editor.isActive('link')}
            title="Insert Link"
          >
            <Link className="h-5 w-5" />
          </ToolbarButton>
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-2 bg-white backdrop-blur-md rounded-lg shadow-xl p-4 w-80 z-20 border border-gray-200 animate-slideDown">
              <label className="block text-xs font-medium text-gray-700 mb-2">Enter URL</label>
              <input
                ref={linkInputRef}
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSetLink();
                  } else if (e.key === 'Escape') {
                    setShowLinkInput(false);
                  }
                }}
                placeholder="https://example.com"
                className="w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleSetLink}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  Insert
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkInput(false)}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-all hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              setShowImageInput(!showImageInput);
              setTimeout(() => imageInputRef.current?.focus(), 100);
            }}
            title="Insert Image"
          >
            <Image className="h-5 w-5" />
          </ToolbarButton>
          {showImageInput && (
            <div className="absolute top-full left-0 mt-2 bg-white backdrop-blur-md rounded-lg shadow-xl p-4 w-80 z-20 border border-gray-200 animate-slideDown">
              <label className="block text-xs font-medium text-gray-700 mb-2">Upload Image</label>
              <input
                ref={imageFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileSelect}
                className="hidden"
                id="toolbar-image-upload"
              />
              <label
                htmlFor="toolbar-image-upload"
                className={`flex items-center justify-center gap-2 w-full px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer mb-3 ${
                  uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Choose File
                  </>
                )}
              </label>
              <div className="text-center text-xs text-gray-500 mb-3">or</div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Enter Image URL</label>
              <input
                ref={imageInputRef}
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSetImage();
                  } else if (e.key === 'Escape') {
                    setShowImageInput(false);
                  }
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleSetImage}
                  disabled={!imageUrl}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Insert
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImageInput(false);
                    setImageUrl('');
                  }}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-all hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <ToolbarDivider />

        {/* Horizontal Rule */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Line"
        >
          <Minus className="h-5 w-5" />
        </ToolbarButton>

        {/* Font Size Dropdown */}
        <div className="relative" ref={fontSizeRef}>
          <button
            type="button"
            onClick={() => setShowFontSize(!showFontSize)}
            onMouseDown={(e) => e.preventDefault()}
            title="Font Size"
            className="p-2.5 rounded-lg transition-all duration-200 ease-in-out text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Type className="h-5 w-5" />
            <span className="text-sm font-medium">Size</span>
          </button>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-2 bg-white backdrop-blur-md rounded-lg shadow-xl py-2 w-44 z-20 border border-gray-200 animate-slideDown">
              {fontSizes.map((size) => (
                <button
                  key={size.label}
                  type="button"
                  onClick={() => {
                    // Apply the font size to the selected text
                    editor.chain().focus().setFontSize(size.value).run();
                    setShowFontSize(false);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`w-full px-4 py-2.5 text-left hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 ${size.class} text-gray-800 font-medium`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const base64ToUint8Array = (base64) => {
  if (!base64 || typeof base64 !== 'string') return new Uint8Array();
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error("YJS DECODE ERROR: Failed to decode base64. Base64 length:", base64?.length, "Snippet:", base64?.substring(0, 30), e);
    return new Uint8Array();
  }
};

const uint8ArrayToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// --- Tiptap Sub-component ---
// This only mounts WHEN ydoc is fully ready, bypassing the useEditor dependency array flaw
const TiptapEditor = ({ ydoc, provider, isSaving, activeUsers }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Required; history bindings handled completely by Yjs internal stack natively. 
      }),
      Collaboration.configure({
        document: ydoc,
        field: 'default', // 🔥 BẮT BUỘC
      })
    ],
    onFocus: () => {
      if (provider) provider.awareness.setLocalStateField('isFocused', true);
    },
    onBlur: () => {
      if (provider) provider.awareness.setLocalStateField('isFocused', false);
    }
  }); 

  if (!editor) {
    return <div style={{ padding: '20px', color: '#5e6c84' }}>Initializing secure editor...</div>;
  }

  return (
    <div className="document-editor" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderRadius: '8px', border: '1px solid #dfe1e6', overflow: 'hidden' }}>
      <style>
        {`
          .tiptap-editor-content .ProseMirror {
            min-height: 400px;
            outline: none;
            line-height: 1.6;
            padding: 0 10px;
          }
          .tiptap-editor-content .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #adb5bd;
            pointer-events: none;
            height: 0;
          }
        `}
      </style>
      <div className="editor-toolbar" style={{ display: 'flex', gap: '8px', padding: '12px', borderBottom: '1px solid #dfe1e6', alignItems: 'center', background: '#f4f5f7', flexWrap: 'wrap' }}>
        <button onClick={() => editor.chain().focus().toggleBold().run()} style={{ ...btnStyle, background: editor.isActive('bold') ? '#e6effc' : 'white' }}><b>B</b></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} style={{ ...btnStyle, background: editor.isActive('italic') ? '#e6effc' : 'white' }}><i>I</i></button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} style={{ ...btnStyle, background: editor.isActive('strike') ? '#e6effc' : 'white' }}><s>S</s></button>

        <div style={dividerStyle} />

        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={{ ...btnStyle, background: editor.isActive('heading', { level: 1 }) ? '#e6effc' : 'white' }}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={{ ...btnStyle, background: editor.isActive('heading', { level: 2 }) ? '#e6effc' : 'white' }}>H2</button>
        <button onClick={() => editor.chain().focus().setParagraph().run()} style={{ ...btnStyle, background: editor.isActive('paragraph') ? '#e6effc' : 'white' }}>P</button>

        <div style={dividerStyle} />

        <button onClick={() => editor.chain().focus().toggleBulletList().run()} style={{ ...btnStyle, background: editor.isActive('bulletList') ? '#e6effc' : 'white' }}>• List</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} style={{ ...btnStyle, background: editor.isActive('orderedList') ? '#e6effc' : 'white' }}>1. List</button>

        <div style={dividerStyle} />

        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} style={{ ...btnStyle, opacity: editor.can().undo() ? 1 : 0.5 }}>↺ Undo</button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} style={{ ...btnStyle, opacity: editor.can().redo() ? 1 : 0.5 }}>↻ Redo</button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* Active Users Avatars */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {activeUsers.map((u, i) => (
              <div key={i} title={`${u.name} ${u.isFocused ? '(Typing...)' : ''}`} style={{ position: 'relative' }}>
                 <div style={{ width: 28, height: 28, borderRadius: '50%', background: u.color || '#0052cc', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', boxShadow: u.isFocused ? `0 0 0 2px white, 0 0 0 3px ${u.color}` : 'none', transition: 'box-shadow 0.2s' }}>
                    {u.name.charAt(0).toUpperCase()}
                 </div>
                 {u.isFocused && (
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: '#36b37e', border: '2px solid white' }} title="Typing!" />
                 )}
              </div>
            ))}
          </div>

          <div style={{ fontSize: '13px', color: isSaving ? '#ff991f' : '#36b37e', fontWeight: 'bold', display: 'flex', alignItems: 'center', borderLeft: '1px solid #dfe1e6', paddingLeft: '16px' }}>
            {isSaving ? '⏳ Saving...' : '✓ Saved'}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <EditorContent editor={editor} className="tiptap-editor-content" />
      </div>
    </div>
  );
};

const DocumentEditor = ({ documentId, initialContent, onChange, isSaving }) => {
  const [ydoc, setYdoc] = useState(null);
  const [provider, setProvider] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);

  // Cache the onChange handler into a ref to avert closure staleness and infinite re-renders
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Hook strictly managing the Yjs lifecycle
  const initializedFlag = useRef(false);

  useEffect(() => {
    if (!documentId) return;

    // Reset flag for new document
    initializedFlag.current = false;
    const doc = new Y.Doc();

    // Parse the encoded state directly from Base64 mapping to byte[]
    console.log("LOAD DOCUMENT INIT: payload type:", typeof initialContent, "value excerpt:", typeof initialContent === 'string' ? initialContent.substring(0, 50) : initialContent);

    if (initialContent) {
      try {
        let update;
        if (typeof initialContent === 'string') {
          // Detect if Jackson serialized a faulty array or object as a string (legacy data)
          const trimmed = initialContent.trim();
          if (trimmed.startsWith('[')) {
            update = new Uint8Array(JSON.parse(trimmed));
          } else if (trimmed.startsWith('{')) {
            update = new Uint8Array(Object.values(JSON.parse(trimmed)));
          } else {
            // Standard Base64 path
            update = base64ToUint8Array(trimmed);
          }
        } else if (Array.isArray(initialContent) || initialContent instanceof ArrayBuffer) {
          update = new Uint8Array(initialContent);
        } else if (typeof initialContent === 'object') {
          // Fallback for JS Object iterations {"0": 1, "1": 2} -> [1, 2]
          update = new Uint8Array(Object.values(initialContent));
        }

        if (update && update.length > 0) {
          console.log("LOAD DOCUMENT: applying valid YJS update of byte-length:", update.length);
          Y.applyUpdate(doc, update);
        } else {
          console.log("LOAD DOCUMENT: decoded update array is empty");
        }
      } catch (e) {
        console.error("LOAD DOCUMENT ERROR: Yjs execution crashed", e);
      }
    } else {
      console.log("LOAD DOCUMENT: No initialContent presented from Backend API.");
    }

    // Connect to Yjs Demo WebSocket server based on exact document ID
    const wsProvider = new WebsocketProvider(
      'wss://demos.yjs.dev/ws',
      documentId.toString(),
      doc
    );

    // Initialize User session in Awareness API
    const currentUser = {
      name: sessionStorage.getItem('username') || sessionStorage.getItem('email') || 'Anonymous',
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      isFocused: false
    };

    wsProvider.awareness.setLocalStateField('user', currentUser);
    wsProvider.awareness.setLocalStateField('isFocused', false);

    const updateAwareness = () => {
      const states = Array.from(wsProvider.awareness.getStates().values());
      const users = states.filter(state => state.user).map(state => ({
        ...state.user,
        isFocused: state.isFocused || false
      }));
      setActiveUsers(users);
    };

    wsProvider.awareness.on('change', updateAwareness);
    updateAwareness(); // Initial populate

    // Bật cờ cho phép update lưu dữ liệu SAU KHI khởi tạo thành công
    initializedFlag.current = true;

    // Event listener properly registering triggers on user input
    doc.on('update', (update, origin) => {
      // Prevent capturing our own initialization loop as a trigger
      if (!initializedFlag.current) return;

      // Encode back to Base64 to seamlessly map back into Spring Boot byte[] arrays without Array.from corruption
      const stateUpdate = Y.encodeStateAsUpdate(doc);
      // Callback to fire the API call
      onChangeRef.current(uint8ArrayToBase64(stateUpdate));
    });

    setYdoc(doc);
    setProvider(wsProvider);

    // Proper Lifecycle Teardown
    return () => {
      wsProvider.disconnect();
      wsProvider.destroy();
      doc.destroy();
    };
  }, [documentId]); // Must only re-run if we navigate to an entirely new task ID

  if (!ydoc) {
    return <div style={{ padding: '20px', color: '#5e6c84' }}>Initializing secure editor...</div>;
  }

  return <TiptapEditor ydoc={ydoc} provider={provider} isSaving={isSaving} activeUsers={activeUsers} />;
};

const btnStyle = {
  padding: '6px 12px',
  border: '1px solid #dfe1e6',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#172b4d',
  transition: 'background 0.2s',
};

const dividerStyle = {
  width: '1px',
  height: '24px',
  background: '#dfe1e6',
  margin: '0 4px',
};

export default DocumentEditor;

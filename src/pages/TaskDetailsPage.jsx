import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DocumentEditor from '../components/DocumentEditor';
import { getTasks } from '../api/tasksApi';
import { getDocumentByTaskId, updateDocument } from '../api/documentApi';
import { sendComment, getCommentInTask } from '../api/commentApi';
import websocketService from '../socket/websocketService';
import '../styles/dashboard.css';

const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [documentObj, setDocumentObj] = useState(null);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError('');
      try {
        const [tasksData, docResponse] = await Promise.all([
          getTasks(),
          getDocumentByTaskId(taskId).catch(() => null) // Suppress errors if document doesn't exist yet
        ]);

        let foundTask = null;
        if (Array.isArray(tasksData)) {
          foundTask = tasksData.find(t => String(t.task_id || t.id) === String(taskId));
        }

        if (!foundTask) {
          setError('Task not found.');
        } else {
          setTask(foundTask);
        }

        // docResponse format based on plan: { data: { id, title, content, created_at }}
        if (docResponse && docResponse.data) {
          setDocumentObj(docResponse.data);
        } else if (docResponse && docResponse.id) {
          setDocumentObj(docResponse);
        }

        // Fetch comments
        const commentData = await getCommentInTask(taskId).catch(() => []);
        setComments(Array.isArray(commentData) ? commentData : []);
      } catch (err) {
        console.error('Failed to load task details', err);
        setError('Failed to load task details.');
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchAllData();
    }
  }, [taskId]);

  // WebSocket for comments
  useEffect(() => {
    if (!taskId) return;

    const unsubscribe = websocketService.subscribe(`/topic/tasks/${taskId}/comments`, (receivedComment) => {
      setComments((prevComments) => {
        if (prevComments.find(c => c.id === receivedComment.id)) return prevComments;
        return [receivedComment, ...prevComments];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [taskId]);

  const handleSaveComment = async () => {
    if (!commentText.trim()) return;
    const newComment = {
      task_id: taskId,
      commenter_id: sessionStorage.getItem('user_id') || '1',
      content: commentText
    };

    await sendComment(newComment);
    setCommentText('');
  };

  const handleDocumentChange = (newContent) => {
    if (!documentObj) return; // Cannot save if document doesn't exist

    setIsSaving(true);

    // Debounce save logic (1000ms delay)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateDocument(documentObj.id, newContent);
        console.log("Updating document")
      } catch (err) {
        console.error('Failed to save document', err);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Loading details...</h2>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <div className="dashboard-error">{error || 'Task not found'}</div>
          <button onClick={() => navigate('/my-tasks')} className="btn-primary" style={{ marginTop: '20px' }}>
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  const dueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    : 'No due date';

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '0', background: '#f4f5f7' }}>

        {/* Header Section */}
        <div style={{ padding: '24px 32px', background: 'white', borderBottom: '1px solid #dfe1e6', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span
              onClick={() => navigate(-1)}
              style={{ color: '#5e6c84', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}
            >
              ← Back to tasks
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#172b4d' }}>{task.title}</h1>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span className="badge" style={{ background: '#0052cc', color: 'white' }}>{task.status || 'todo'}</span>
                <span className="badge" style={{ background: '#ff991f', color: '#172b4d' }}>{task.priority || 'normal'}</span>
                <span className="badge" style={{ background: '#dfe1e6', color: '#172b4d' }}>Due: {dueDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section Split */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '24px 32px', gap: '24px' }}>

          {/* Main Document Editor */}
          <div style={{ flex: 3, display: 'flex', flexDirection: 'column', minWidth: '0' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#172b4d' }}>Document Requirements</h3>
            <div style={{ flex: 1, minHeight: 0 }}>              {documentObj ? (
              <DocumentEditor
                documentId={documentObj.id}
                initialContent={documentObj.content}
                onChange={handleDocumentChange}
                isSaving={isSaving}
              />
            ) : (
              <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #dfe1e6', color: '#5e6c84' }}>
                No document attached to this task.
              </div>
            )}
            </div>
          </div>

          {/* Comments Sidebar */}
          <div style={{ flex: 1, minWidth: '300px', maxWidth: '400px', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '8px', border: '1px solid #dfe1e6' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #dfe1e6', fontWeight: 'bold' }}>
              💬 Comments ({comments.length})
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {comments.length === 0 ? (
                <div style={{ color: '#5e6c84', textAlign: 'center', marginTop: '20px' }}>No comments yet.</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} style={{ padding: '12px', background: '#f4f5f7', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                      <strong>{comment.commenter || `User ${comment.commenter_id}`}</strong>
                      <small style={{ color: '#5e6c84' }}>{new Date(comment.created_at).toLocaleString()}</small>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid #dfe1e6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #dfe1e6', borderRadius: '4px', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
              />
              <button
                className="btn-primary"
                onClick={handleSaveComment}
                disabled={!commentText.trim()}
                style={{ padding: '8px 16px', alignSelf: 'flex-end', opacity: !commentText.trim() ? 0.5 : 1 }}
              >
                Send
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;

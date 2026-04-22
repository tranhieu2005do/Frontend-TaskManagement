import React, { useEffect, useState } from 'react';
import '../styles/dashboard.css';
import { sendComment, getCommentInTask } from '../api/commentApi';
import websocketService from '../socket/websocketService';

const TaskDetailModal = ({ task, isOpen, onClose, onUpdate }) => {
  const [comments, setComments] = useState(task?.comments || []);
  const [commentText, setCommentText] = useState('');
  const [localTask, setLocalTask] = useState(task);

  useEffect(() => {
    if (!isOpen || !task?.task_id) return;

    const unsubscribe = websocketService.subscribe(`/topic/tasks/${task.task_id}/comments`, (receivedComment) => {
      setComments((prevComments) => {
        if (prevComments.find(c => c.id === receivedComment.id)) return prevComments;
        return [receivedComment, ...prevComments];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [task?.task_id, isOpen]);

  const handleSaveComment = async () => {
    if (!commentText.trim()) return;
    const newComment = {
      task_id: task.task_id,
      commenter_id: sessionStorage.getItem('user_id'),
      content: commentText
    };

    await sendComment(newComment);
    setCommentText('');
  };

  useEffect(() => {
    if (task && (!localTask || task.task_id !== localTask.task_id)) {
      setLocalTask(task);
    }
  }, [task?.task_id]);

  useEffect(() => {
    if (!task) return;

    const fetchComments = async () => {
      const commentData = await getCommentInTask(task.task_id);
      console.log("Comment data", commentData);
      setComments(commentData);
    };

    fetchComments();
  }, [task]);

  if (!isOpen || !task) return null;

  // const handleSaveComment = async () => {
  //   if (!commentText.trim()) return;
  //   const newComment = {
  //     task_id: task.task_id,
  //     commenter_id: sessionStorage.getItem('user_id'),
  //     content: commentText
  //   };

  //   await sendComment(newComment);

  //   // Refresh comments sau khi gửi
  //   const updatedComments = await getCommentInTask(task.task_id);
  //   setComments(updatedComments);
  //   setCommentText('');
  // };

  const dueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    : 'No due date';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Task Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="task-detail-header">
            <h3>{localTask?.title}</h3>
            <div className="task-detail-tags">
              <span className="badge">{localTask?.status}</span>
              <span className="badge">{localTask?.priority || 'normal'}</span>
              <span className="badge">Due: {dueDate}</span>
            </div>
          </div>
          <p>{localTask?.description || 'No description available.'}</p>

          <div className="comments-section">
            <div className="comments-header">
              <h4>💬 Comments ({comments.length})</h4>
            </div>
            <div className="add-comment">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
              />
              <button
                className="btn-primary"
                onClick={handleSaveComment}
                disabled={!commentText.trim()}
              >
                Send
              </button>
            </div>
            <div className="comments-list">
              {comments.length === 0 ? (
                <div className="empty-state">No comments yet.</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-meta">
                      <strong>{comment.commenter}</strong>
                      <small>{new Date(comment.created_at).toLocaleString()}</small>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
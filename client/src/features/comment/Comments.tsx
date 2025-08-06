import { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { updateComment, deleteComment } from '../../api/commentApi'
import Button from '../../ui/Button';
import { getUserInitials } from '../../utils/userInitials';
import type { CommentProps } from './type';
import { useAuth } from '../auth/AuthContext';
import { toast } from "react-toastify"; // <-- ייבוא חדש

const Comment = ({ comment, onCommentUpdated, onCommentDeleted }: CommentProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth();


    const handleUpdate = async () => {
        if (!editContent.trim()) return;

        setLoading(true);
        try {
            const updatedComment = await updateComment(comment.id, editContent);
            onCommentUpdated(updatedComment);
            setIsEditing(false);
            toast.success("התגובה עודכנה בהצלחה!");
        } catch (error) {
            console.error('Error updating comment:', error);
            toast.error('עדכון התגובה נכשל');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        setLoading(true);
        try {
            await deleteComment(comment.id);
            onCommentDeleted(comment.id);
            toast.success("התגובה נמחקה בהצלחה!");
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('מחיקת התגובה נכשלה');
        } finally {
            setLoading(false);
        }
    };


    const isOwner = currentUser?.id === comment.user_id;

    return (
        <div className="flex gap-3 p-3 border-b border-gray-100 last:border-b-0">
            <div className="flex-shrink-0">
                {comment.profile_image ? (
                    <img
                        src={comment.profile_image}
                        alt="User avatar"
                        className="w-8 h-8 rounded-full border border-gray-300"
                    />
                ) : (
                    
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-blueLight to-brand-blue flex items-center justify-center text-white text-xs font-bold">
                       {comment ? getUserInitials(comment.user_firstname, comment.user_lastname) : "?"}
                    </div>

                )}
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900">
                        {comment.user_firstname} {comment.user_lastname}
                    </span>
                    <span className="text-xs text-gray-500">
                        {new Date(comment.created_at || '').toLocaleDateString()}
                    </span>

                    {isOwner && (
                        <div className="flex gap-1 ml-auto">
                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                variant="icon"
                                icon={<FaEdit size={12} />}
                                className="text-blue-500 hover:text-blue-700"
                                disabled={loading}
                            />
                            <Button
                                onClick={handleDelete}
                                variant="icon"
                                icon={<FaTrash size={12} />}
                                className="text-red-500 hover:text-red-700"
                                disabled={loading}
                            />
                        </div>
                    )}
                </div>

                {/* Comment text or edit input */}
                {isEditing ? (
                    <div className="space-y-2">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 text-sm border border-gray-300 rounded-lg resize-none"
                            rows={2}
                            disabled={loading}
                            required
                        />
                        <div className="flex gap-2">
                            <Button
                                text={loading ? 'Saving...' : 'Save'}
                                onClick={handleUpdate}
                                variant="blue"
                                className="text-xs px-3 py-1"
                                disabled={loading || !editContent.trim()}
                            />
                            <Button
                                text="Cancel"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditContent(comment.content);
                                }}
                                variant="google"
                                className="text-xs px-3 py-1"
                                disabled={loading}
                            />
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {comment.content}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Comment;
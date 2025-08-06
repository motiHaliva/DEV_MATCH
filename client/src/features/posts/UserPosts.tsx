import { useState } from 'react';
import { FaTrash, FaEdit, FaCalendarAlt } from 'react-icons/fa';
import type { Post } from './type';
import Button from '../../ui/Button';
import type { UserPostsProps } from './type';



const UserPosts = ({ posts, loading, onDelete, onUpdate, isOwnProfile }: UserPostsProps) => {
    const [editingPost, setEditingPost] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Post>>({});

    const handleEditClick = (post: Post) => {
        setEditingPost(post.id);
        setEditForm({
            content: post.content,
            image_url: post.image_url,
            post_type: post.post_type
        });
    };

    const handleSaveEdit = async (postId: number) => {
        if (onUpdate) {
            await onUpdate(postId, editForm);
            setEditingPost(null);
            setEditForm({});
        }
    };

    const handleCancelEdit = () => {
        setEditingPost(null);
        setEditForm({});
    };

    if (loading) {
        return (
            <div className="p-8 bg-white rounded-2xl shadow-md border border-gray-100 text-center">
                <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading posts...</p>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="p-8 bg-white rounded-2xl shadow-md border border-gray-100 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">My Posts</h2>
                <p className="text-gray-500">You haven’t posted anything yet.</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Posts ({posts.length})</h2>
            <div className="space-y-6">
                {posts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        {editingPost === post.id ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <textarea
                                        value={editForm.content || ''}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Post Type</label>
                                    <select
                                        value={editForm.post_type || ''}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, post_type: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="freelancer">Freelancer</option>
                                        <option value="client">Client</option>
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        text="Save"
                                        variant="blue"
                                        onClick={() => handleSaveEdit(post.id)}
                                        className="w-auto px-6"
                                    />
                                    <Button
                                        text="Cancel"
                                        variant="text"
                                        onClick={handleCancelEdit}
                                        className="w-auto px-6"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-800 mb-4">{post.content}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt />
                                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <span className="capitalize">Type: {post.post_type}</span>
                                    </div>
                                    {isOwnProfile && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                icon={<FaEdit />}
                                                variant="icon"
                                                onClick={() => handleEditClick(post)}
                                                className="text-blue-600"
                                            />
                                            {onDelete && (
                                                <Button
                                                    icon={<FaTrash />}
                                                    variant="icon"
                                                    onClick={() => onDelete(post.id)}
                                                    className="text-red-600"
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserPosts;

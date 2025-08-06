

import { FaPaperPlane } from 'react-icons/fa';
import Button from '../../ui/Button';
import { getUserInitials } from '../../utils/userInitials';
import type { FormCommentsProps } from './type';



const FormComments = ({
    currentUser,
    newComment,
    setNewComment,
    submitting,
    onSubmit
}: FormCommentsProps) => {



    return (
        <form onSubmit={onSubmit} className="mb-4 h-12">
            <div className="flex gap-3 items-center">
                <div className="flex-shrink-0">
                    {currentUser?.profile_image ? (
                        <img
                            src={currentUser.profile_image}
                            alt="Your avatar"
                            className="w-8 h-8 rounded-full border border-gray-300"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-blueLight to-brand-blue flex items-center justify-center text-white text-xs font-bold">
                            {currentUser ? getUserInitials(currentUser.firstname, currentUser.lastname) : "?"}
                        </div>
                    )}

                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 ">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 p-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                            rows={2}
                            disabled={submitting}
                            required
                        />
                        <Button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            variant="blue"
                            className="flex items-center gap-1 px-0 py-2 w-20"
                            text={submitting ? 'Posting...' : 'Post'}
                            icon={<FaPaperPlane size={12} />}
                        />

                    </div>
                </div>
            </div>
        </form>
    );
};

export default FormComments;
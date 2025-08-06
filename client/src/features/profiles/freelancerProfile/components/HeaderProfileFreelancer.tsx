import Button from '../../../../ui/Button'
import { FaCamera, FaEdit, FaPlus } from 'react-icons/fa'
import { AiTwotoneHome } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import type { HeaderProfilePropsFreelance } from '../../type';
import { useImageUpload } from '../../../../hooks/useImageUpload'; 
const HeaderProfileFreelancer = ({
    profile,
    setProfile,
    editMode,
    setEditMode,
    isOwnProfile,
    hasFreelancerProfile,
    currentUser,
}: HeaderProfilePropsFreelance) => {

    const navigate = useNavigate();

    const { imageLoading, imageError, handleImageUpload } = useImageUpload({
        maxSize: 5 * 1024 * 1024, 
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        onSuccess: (imageData) => {
            setProfile(prev => ({ ...prev, profile_image: imageData }));
        },
        onError: (error) => {
            console.error('Image upload error:', error);
        }
    });

    const getButtonConfig = () => {
        if (!isOwnProfile) return null;

        if (!hasFreelancerProfile) {
            return {
                text: "Create Profile",
                variant: "green" as const,
                icon: <FaPlus />,
                action: () => setEditMode(true)
            };
        }

        return {
            text: editMode ? "Cancel Edit" : "Edit Profile",
            variant: "blue" as const,
            icon: <FaEdit />,
            action: () => setEditMode(!editMode)
        };
    };

    const buttonConfig = getButtonConfig();

    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="h-32 relative">
                <div className="absolute inset-0 bg-black/10">
                    <div className="inline-block">
                        <Button
                            onClick={() => navigate('/projects')}
                            icon={<AiTwotoneHome className="text-xl" />}
                            variant="icon"
                            className="absolute right-14 top-5 bg-gradient-to-r from-brand-blueLight to-brand-blue text-white p-2 rounded-md shadow-md transition duration-200 hover:scale-105"
                        />
                    </div>
                </div>
            </div>

            <div className="relative px-8 pb-8">
                <div className="flex justify-between items-start -mt-16 mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-xl border-4 border-white">
                            {imageLoading ? (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : profile.profile_image ? (
                                <img
                                    src={profile.profile_image}
                                    alt={`${profile.firstname} ${profile.lastname} profile picture`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <FaCamera className="text-gray-400 text-4xl" />
                                </div>
                            )}
                        </div>

                        {(editMode && isOwnProfile) && (
                            <label className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all duration-200 hover:scale-105">
                                <FaCamera className="text-sm" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={imageLoading}
                                    aria-label="Upload profile image"
                                />
                            </label>
                        )}
                    </div>

                    <div className="flex justify-end w-full p-2">
                        {buttonConfig && (
                            <Button
                                text={buttonConfig.text}
                                variant={buttonConfig.variant}
                                icon={buttonConfig.icon}
                                onClick={buttonConfig.action}
                            />
                        )}
                    </div>
                </div>

                {imageError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{imageError}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            {profile.firstname} {profile.lastname}
                        </h1>
                        <p className="text-gray-600 text-lg font-medium">
                            {profile.email}
                        </p>
                       
                            <p className="text-gray-600 text-lg font-medium capitalize">
                                Freelancer
                            </p>
                    
                    </div>

                    {profile.created_at && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            Joined {new Date(profile.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HeaderProfileFreelancer;
import { Alert } from '~/components/Alert';
import { Button } from '~/components/Button';
import { Card } from '~/components/Card';
import { Container } from '~/components/Container';
import { getUserProfile } from '~/models/user.server';
import { Modal } from '~/components/Modal';
import { Paths } from '~/constants';
import { profileUpdateSchema, type ProfileUpdateData } from '~/lib/validations';
import { requireUser } from '~/lib/session.server';
import { Textarea } from '~/components/Textarea';
import { TextInput } from '~/components/TextInput';
import { useFetcher } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { useValidatedForm } from '~/lib/form-hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Route } from './+types/profile';

// Loader: Fetch profile data
export async function loader({ request }: Route.LoaderArgs) {
    const user = await requireUser(request);

    const profile = await getUserProfile(user.id);

    if (!profile) {
        throw new Response('Profile not found', { status: 404 });
    }

    return { profile };
}

export default function Profile({ loaderData }: Route.ComponentProps) {
    const fetcher = useFetcher();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const prevStateRef = useRef(fetcher.state);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useValidatedForm<ProfileUpdateData>({
        resolver: zodResolver(profileUpdateSchema),
        errors: fetcher.data?.errors,
        defaultValues: {
            name: loaderData.profile?.name || '',
            bio: loaderData.profile?.bio || '',
            website: loaderData.profile?.website || '',
            location: loaderData.profile?.location || '',
            phoneNumber: loaderData.profile?.phoneNumber || ''
        }
    });

    const onSubmit = (formData: ProfileUpdateData) => {
        const formDataObj = new FormData();
        formDataObj.append('name', formData.name);
        if (formData.bio) formDataObj.append('bio', formData.bio);
        if (formData.website) formDataObj.append('website', formData.website);
        if (formData.location)
            formDataObj.append('location', formData.location);
        if (formData.phoneNumber)
            formDataObj.append('phoneNumber', formData.phoneNumber);

        fetcher.submit(formDataObj, {
            method: 'PUT',
            action: Paths.PROFILE_API
        });
    };

    const handleDelete = () => {
        fetcher.submit(null, {
            method: 'DELETE',
            action: Paths.PROFILE_API
        });
    };

    const isLoading =
        fetcher.state === 'submitting' || fetcher.state === 'loading';

    // Exit edit mode and reset form on successful update
    useEffect(() => {
        const justCompleted =
            prevStateRef.current !== 'idle' && fetcher.state === 'idle';

        if (justCompleted && fetcher.data?.success && isEditing) {
            setIsEditing(false);
            if (fetcher.data.profile) {
                reset({
                    name: fetcher.data.profile.name || '',
                    bio: fetcher.data.profile.bio || '',
                    website: fetcher.data.profile.website || '',
                    location: fetcher.data.profile.location || '',
                    phoneNumber: fetcher.data.profile.phoneNumber || ''
                });
            }
        }

        prevStateRef.current = fetcher.state;
    }, [
        fetcher.state,
        fetcher.data?.success,
        fetcher.data?.profile,
        isEditing,
        reset
    ]);

    return (
        <>
            <title>Profile - TWS Foundations</title>
            <meta
                name="description"
                content="Manage your personal details and account preferences."
            />
            <Container>
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Your Profile</h1>
                        {!isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                size="sm"
                            >
                                Edit Profile
                            </Button>
                        )}
                    </div>

                    {/* Success Alert */}
                    {fetcher.data?.success && fetcher.data?.message && (
                        <Alert status="success" className="mb-4">
                            {fetcher.data.message}
                        </Alert>
                    )}

                    {/* Error Alert */}
                    {fetcher.data?.error && (
                        <Alert status="error" className="mb-4">
                            {fetcher.data.error}
                        </Alert>
                    )}

                    {isEditing ? (
                        <fetcher.Form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <TextInput
                                {...register('name')}
                                label="Name"
                                error={errors.name?.message}
                                required
                            />

                            <div>
                                <p className="text-sm font-medium mb-1">
                                    Email
                                    <span className="text-base-content/70 ml-2 font-normal text-xs">
                                        (Read-only)
                                    </span>
                                </p>
                                <input
                                    type="email"
                                    value={loaderData.profile?.email}
                                    disabled
                                    className="input input-md w-full opacity-60 cursor-not-allowed"
                                />
                            </div>

                            <Textarea
                                {...register('bio')}
                                label="Bio"
                                error={errors.bio?.message}
                                helperText="Tell us a bit about yourself (max 500 characters)"
                                rows={4}
                            />

                            <TextInput
                                {...register('website')}
                                label="Website"
                                type="url"
                                placeholder="https://example.com"
                                error={errors.website?.message}
                            />

                            <TextInput
                                {...register('location')}
                                label="Location"
                                placeholder="City, Country"
                                error={errors.location?.message}
                            />

                            <TextInput
                                {...register('phoneNumber')}
                                label="Phone Number"
                                type="tel"
                                placeholder="+1234567890"
                                error={errors.phoneNumber?.message}
                                helperText="International format (e.g., +1234567890)"
                            />

                            <div className="flex gap-2 justify-end pt-4">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        reset();
                                    }}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" loading={isLoading}>
                                    Save Changes
                                </Button>
                            </div>
                        </fetcher.Form>
                    ) : (
                        <div className="space-y-4">
                            {/* Display-only view */}
                            <div>
                                <p className="text-sm font-medium text-base-content/70">
                                    Name
                                </p>
                                <p className="text-base mt-1">
                                    {loaderData.profile?.name || 'Not provided'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-base-content/70">
                                    Email
                                </p>
                                <p className="text-base mt-1">
                                    {loaderData.profile?.email}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-base-content/70">
                                    Bio
                                </p>
                                <p className="text-base mt-1 whitespace-pre-wrap">
                                    {loaderData.profile?.bio || 'Not provided'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-base-content/70">
                                    Website
                                </p>
                                {loaderData.profile?.website ? (
                                    <a
                                        href={loaderData.profile.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-base mt-1 text-primary hover:underline"
                                    >
                                        {loaderData.profile.website}
                                    </a>
                                ) : (
                                    <p className="text-base mt-1">
                                        Not provided
                                    </p>
                                )}
                            </div>

                            <div>
                                <p className="text-sm font-medium text-base-content/70">
                                    Location
                                </p>
                                <p className="text-base mt-1">
                                    {loaderData.profile?.location ||
                                        'Not provided'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-base-content/70">
                                    Phone Number
                                </p>
                                <p className="text-base mt-1">
                                    {loaderData.profile?.phoneNumber ||
                                        'Not provided'}
                                </p>
                            </div>

                            {/* Danger Zone */}
                            <div className="pt-6 mt-6 border-t border-error/20">
                                <h2 className="text-lg font-bold text-error mb-2">
                                    Danger Zone
                                </h2>
                                <p className="text-sm text-base-content/70 mb-4">
                                    Once you delete your account, there is no
                                    going back. Please be certain.
                                </p>
                                <Button
                                    status="error"
                                    variant="outline"
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </Container>

            {/* Delete Confirmation Modal */}
            <Modal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Account"
            >
                <p className="mb-4">
                    Are you sure you want to delete your account? This action
                    cannot be undone and all your data will be permanently
                    removed.
                </p>
                <div className="flex gap-2 justify-end">
                    <Button
                        variant="ghost"
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        status="error"
                        onClick={handleDelete}
                        loading={isLoading}
                    >
                        Delete Permanently
                    </Button>
                </div>
            </Modal>
        </>
    );
}

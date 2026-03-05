import { useState } from "react";
import toast from "react-hot-toast";

export default function VideoUpload({ onUploadSuccess, existingVideo }) {
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	// Cloudinary configuration - using environment variables
	const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "your_cloud_name";
	const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "course_videos";

	const handleVideoUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("video/")) {
			toast.error("Please select a valid video file");
			return;
		}

		// Validate file size (max 100MB)
		if (file.size > 100 * 1024 * 1024) {
			toast.error("Video size should be less than 100MB");
			return;
		}

		setUploading(true);
		setUploadProgress(0);

		const formData = new FormData();
		formData.append("file", file);
		formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
		formData.append("resource_type", "video");

		try {
			const xhr = new XMLHttpRequest();

			xhr.upload.addEventListener("progress", (event) => {
				if (event.lengthComputable) {
					const progress = Math.round(
						(event.loaded / event.total) * 100
					);
					setUploadProgress(progress);
				}
			});

			xhr.addEventListener("load", () => {
				if (xhr.status === 200) {
					const response = JSON.parse(xhr.responseText);
					onUploadSuccess({
						url: response.secure_url,
						publicId: response.public_id,
						duration: response.duration,
					});
					setUploading(false);
					setUploadProgress(0);
					toast.success("Video uploaded successfully!");
				} else {
					throw new Error("Upload failed");
				}
			});

			xhr.addEventListener("error", () => {
				toast.error("Upload failed. Please try again.");
				setUploading(false);
				setUploadProgress(0);
			});

			xhr.open(
				"POST",
				`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`
			);
			xhr.send(formData);
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Upload failed. Please try again.");
			setUploading(false);
			setUploadProgress(0);
		}
	};

	return (
		<div className='space-y-4'>
			<label className='block text-white mb-2 text-sm'>
				Course Video
			</label>

			{existingVideo && !uploading && (
				<div className='bg-gray-900 rounded-lg p-4 mb-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-3'>
							<svg
								className='w-10 h-10 text-green-500'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'
								/>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
								/>
							</svg>
							<div>
								<div className='text-sm text-green-400'>
									Video uploaded successfully
								</div>
								<div className='text-xs text-gray-400'>
									{existingVideo.substring(0, 50)}...
								</div>
							</div>
						</div>
						<a
							href={existingVideo}
							target='_blank'
							rel='noopener noreferrer'
							className='text-blue-400 hover:text-blue-300 text-sm'>
							View
						</a>
					</div>
				</div>
			)}

			{uploading ? (
				<div className='bg-gray-900 rounded-lg p-6'>
					<div className='flex items-center justify-between mb-2'>
						<span className='text-white text-sm'>
							Uploading video...
						</span>
						<span className='text-blue-400 text-sm font-bold'>
							{uploadProgress}%
						</span>
					</div>
					<div className='w-full bg-gray-700 rounded-full h-2'>
						<div
							className='bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300'
							style={{ width: `${uploadProgress}%` }}></div>
					</div>
					<p className='text-xs text-gray-400 mt-2'>
						Please don't close this window while uploading
					</p>
				</div>
			) : (
				<div>
					<label className='block w-full cursor-pointer'>
						<div className='border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition duration-200'>
							<svg
								className='w-12 h-12 mx-auto mb-4 text-gray-400'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
								/>
							</svg>
							<p className='text-white mb-2'>
								{existingVideo
									? "Replace video"
									: "Click to upload video"}
							</p>
							<p className='text-sm text-gray-400'>
								MP4, MOV, AVI (Max 100MB)
							</p>
						</div>
						<input
							type='file'
							accept='video/*'
							onChange={handleVideoUpload}
							className='hidden'
						/>
					</label>
				</div>
			)}
		</div>
	);
}

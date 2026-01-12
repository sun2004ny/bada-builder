/**
 * Compresses an image file using browser Canvas API.
 * @param {File} file - The original image file.
 * @param {number} [maxWidth=1920] - Maximum width of the output image.
 * @param {number} [quality=0.7] - JPEG quality (0 to 1).
 * @returns {Promise<File>} - A promise that resolves to the compressed File object.
 */
export const compressImage = async (file, maxWidth = 1920, quality = 0.7) => {
    // If not an image, return original
    if (!file.type.startsWith('image/')) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target.result;
        };

        reader.onerror = (err) => reject(err);

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'));
                        return;
                    }
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = (err) => reject(err);

        reader.readAsDataURL(file);
    });
};

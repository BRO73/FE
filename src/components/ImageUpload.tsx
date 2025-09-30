import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
    uploadUrl: string;
    onUpload: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ uploadUrl, onUpload }) => {
    const [preview, setPreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        const formData = new FormData();
        formData.append("file", file);

        setIsUploading(true);
        try {
            const res = await fetch(uploadUrl, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            const url = data.url as string;
            setPreview(url);
            onUpload(url);
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Hidden input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Button to trigger input */}
            <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
            >
                {isUploading ? "Uploading..." : "Choose Image"}
            </Button>

            {/* Preview */}
            {preview && (
                <div className="mt-2">
                    <img
                        src={`http://localhost:8082${preview}`}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border"
                    />
                    <p className="text-sm">{preview}</p>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;

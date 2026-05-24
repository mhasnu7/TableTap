'use client'

import { useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { Loader2, Upload } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

export default function ImageUpload({ 
  onUpload, 
  currentImage, 
  folder = 'images' 
}: { 
  onUpload: (url: string) => void, 
  currentImage?: string,
  folder?: string
}) {
  const [uploading, setUploading] = useState(false)
  const { showToast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setUploading(true)
    try {
      console.log('Uploading file:', file.name, 'to folder:', folder)
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      console.log('Upload complete, getting download URL...')
      const url = await getDownloadURL(storageRef)
      console.log('Download URL obtained:', url)
      onUpload(url)
      showToast('Image uploaded successfully!')
    } catch (error) {
      console.error('Upload failed:', error)
      showToast('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {currentImage && <img src={currentImage} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />}
      <label className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg">
        {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
        <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
      </label>
    </div>
  )
}

# Image Upload Guide for Articles

This guide explains how to use the new image upload functionality in the AcademOra article editor.

## Features Added

✅ **Image Upload Component**
- Drag & drop or click to upload images
- Support for JPG, PNG, GIF, WebP formats
- 5MB file size limit
- Image preview with remove option
- Fallback to URL input for external images

✅ **Backend API**
- `/api/upload/image` - Upload images to server
- Images stored in `public/uploads/` directory
- Served via `/uploads/` endpoint
- Admin-only access (authentication required)

✅ **Frontend Integration**
- Replaced URL inputs with upload components
- Real-time image preview
- Error handling and validation
- Progress indicators during upload

## How to Use

### In the Article Editor

1. **Featured Image**
   - Click "Upload Image" button or drag & drop
   - Select image from your computer
   - Image appears in preview after upload
   - Click "X" to remove and upload different image
   - Or paste external image URL in the text field

2. **OG Image (Social Media)**
   - Located in SEO Settings section
   - Same upload functionality as featured image
   - Used when articles are shared on social media
   - Falls back to featured image if not set

### Supported Formats

- **JPEG/JPG** - Best for photographs
- **PNG** - Best for graphics with transparency
- **GIF** - For simple animations
- **WebP** - Modern format with better compression

### Recommended Specifications

- **File Size**: Under 5MB (automatic limit)
- **Dimensions**: 1200x630px for optimal display
- **Aspect Ratio**: 16:9 for featured images
- **Quality**: High enough for web viewing

## Technical Details

### File Storage

```
AcademOra/
├── public/
│   └── uploads/           # Uploaded images stored here
│       ├── abc123.jpg     # Unique filename generated
│       └── def456.png
├── server/
│   ├── routes/
│   │   └── upload.js      # Upload API endpoints
│   └── index.js           # Static file serving
```

### API Endpoints

```javascript
// Upload image
POST /api/upload/image
Headers: Authorization: Bearer <token>
Body: FormData with 'image' file
Response: { imageUrl: '/uploads/filename.jpg', ... }

// Delete image (optional)
DELETE /api/upload/image/:filename
Headers: Authorization: Bearer <token>
```

### Frontend Components

```javascript
// ImageUpload component usage
<ImageUpload
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  placeholder="https://example.com/image.jpg"
/>
```

## Security Features

- **Authentication Required**: Only admin users can upload
- **File Type Validation**: Only image files accepted
- **Size Limits**: 5MB maximum file size
- **Unique Filenames**: Prevents overwriting existing files
- **Sanitized Paths**: Prevents directory traversal attacks

## Troubleshooting

### Upload Fails

1. **Check file size**: Must be under 5MB
2. **Check file type**: Must be an image file
3. **Check authentication**: Must be logged in as admin
4. **Check server**: Backend must be running

### Images Not Displaying

1. **Check server restart**: After adding upload routes
2. **Check file permissions**: Ensure `public/uploads/` is writable
3. **Check URL format**: Should be `/uploads/filename.ext`
4. **Check browser cache**: Hard refresh (Ctrl+F5)

### Common Errors

- "Only image files are allowed" → Upload a valid image format
- "Image size must be less than 5MB" → Compress or resize image
- "Failed to upload image" → Check server console for details
- "Authentication required" → Log in as admin user

## Development Notes

### Environment Variables

No additional environment variables required. Uses existing API configuration.

### Database Changes

No database schema changes needed. Images stored as URLs in existing `featured_image` and `og_image` fields.

### Production Considerations

1. **Disk Space**: Monitor upload directory size
2. **Backup**: Include `public/uploads/` in backups
3. **CDN**: Consider using CDN for better performance
4. **Image Optimization**: Add compression if needed

## Future Enhancements

- Image compression and optimization
- Multiple image uploads per article
- Image gallery component
- Alt text and accessibility features
- Image editing capabilities
- Cloud storage integration (S3, Cloudinary)

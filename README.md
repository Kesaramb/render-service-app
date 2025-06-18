# Canvasmatic Render Service

This is the standalone backend render service for Canvasmatic. It uses Fabric.js and node-canvas to generate images from JSON templates and uploads them to Firebase Storage.

## Features
- Express.js API for rendering images
- Fabric.js and node-canvas for server-side rendering
- Firebase Storage integration
- Health check endpoint

## Usage
- Build and run with Docker
- Deployable to Google Cloud Run or other container platforms

## Development
1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Start: `npm start`

## Endpoints
- `POST /render` — Render an image from a Fabric.js JSON template
- `GET /health` — Health check

---

For deployment and configuration, see the Dockerfile and environment variable documentation.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Main App      │    │  Render Service  │    │   Firebase      │
│  (App Hosting)  │◄──►│  (Cloud Run)     │◄──►│   Storage       │
│                 │    │                  │    │                 │
│ - UI            │    │ - Image Gen      │    │ - Templates     │
│ - Auth          │    │ - Heavy Compute  │    │ - Images        │
│ - Templates     │    │ - Scalable       │    │ - Logs          │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## API Endpoints

### POST /render
Renders a Fabric.js canvas to an image.

**Request Body:**
```json
{
  "fabricData": {
    "objects": [...],
    "background": "#ffffff"
  },
  "width": 800,
  "height": 600,
  "format": "png",
  "quality": 0.9,
  "transparent": false
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://storage.googleapis.com/...",
  "filename": "render_1234567890.png"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "canvasmatic-render-service",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

## Local Development

### Prerequisites
- Node.js 18+
- Docker (optional)
- Firebase project setup

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp env.example .env
   # Edit .env with your Firebase configuration
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

### Docker Development

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

## Deployment

### Automatic Deployment (GitHub Actions)

The service automatically deploys to Google Cloud Run when changes are pushed to the `main` branch.

### Manual Deployment

1. **Set up Google Cloud:**
   ```bash
   gcloud auth login
   gcloud config set project canvascraft-us3rv
   ```

2. **Create secret for Firebase private key:**
   ```bash
   echo "YOUR_PRIVATE_KEY" | gcloud secrets create RENDER_SERVICE_FIREBASE_ADMIN_PRIVATE_KEY --data-file=-
   ```

3. **Deploy using script:**
   ```bash
   ./scripts/deploy.sh
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Service port | No (default: 8081) |
| `NODE_ENV` | Environment | No (default: production) |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_CLIENT_EMAIL` | Service account email | Yes |
| `FIREBASE_PRIVATE_KEY` | Service account private key | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket | Yes |
| `ALLOWED_ORIGINS` | CORS origins | No |

## Monitoring

### Health Checks
- **Endpoint:** `GET /health`
- **Expected:** 200 OK with service status

### Logs
View logs in Google Cloud Console:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=canvasmatic-render-service"
```

### Metrics
Monitor in Google Cloud Console:
- Request count
- Response time
- Error rate
- Memory usage
- CPU usage

## Troubleshooting

### Common Issues

1. **Canvas rendering fails:**
   - Check if all required system dependencies are installed
   - Verify Fabric.js data format
   - Check memory limits

2. **Firebase connection fails:**
   - Verify service account credentials
   - Check project ID and permissions
   - Ensure secret is properly configured

3. **Docker build fails:**
   - Check if all system dependencies are in Dockerfile
   - Verify Node.js version compatibility

### Debug Mode

Set `NODE_ENV=development` to get detailed error messages.

## Contributing

1. Make changes in the `render-service` directory
2. Test locally with `npm run dev`
3. Push to trigger automatic deployment
4. Monitor deployment in GitHub Actions

## License

Part of the Canvasmatic project. 
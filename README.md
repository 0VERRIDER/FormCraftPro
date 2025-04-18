# Form Builder System

A modern, extensible form builder system with drag-and-drop interface, webhook integration, and mobile-friendly design.

## Features

- Drag-and-drop form builder interface
- Real-time form preview
- Webhook integrations with retry mechanism
- Form activation toggle
- Mobile-friendly responsive design
- PostgreSQL database for persistent storage
- Authentication system
- Form submission analytics
- Customizable form themes

## Docker Setup

This application can be run using Docker and Docker Compose, which makes it easy to set up and deploy.

### Prerequisites

- Docker
- Docker Compose

### Running with Docker Compose

1. Clone the repository:
```bash
git clone https://github.com/yourusername/form-builder.git
cd form-builder
```

2. Build and start the containers:
```bash
docker-compose up -d
```

This will:
- Build the application image
- Start a PostgreSQL database container
- Run database migrations
- Start the application on port 5000

3. Access the application at http://localhost:5000

### Environment Variables

You can customize the application by setting environment variables in the `docker-compose.yml` file:

- `NODE_ENV`: Set to `production` for production environment
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption (change this in production)

### Production Deployment

For production deployment, make sure to:

1. Change the `SESSION_SECRET` to a secure random string
2. Use a proper database password
3. Consider setting up HTTPS with a reverse proxy like Nginx

## Development

### Local Development Setup

1. Install dependencies:
```bash
npm install
```

2. Set up the environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:
```bash
npm run dev
```

### Database Migrations

Database migrations are handled automatically using Drizzle ORM. To manually run migrations:

```bash
npm run db:push
```

## License

MIT
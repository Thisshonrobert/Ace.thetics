# Ace.thetics - Celebrity Fashion Discovery Platform

Ace.thetics is a modern web application that helps users discover and shop for fashion items worn by celebrities. The platform features virtual try-on capabilities, wishlist management, and an admin dashboard for content management.

## 🚀 Features

### Core Features
- **Celebrity Fashion Discovery**: Browse fashion posts featuring celebrities and their outfits
- **Product Shopping**: Direct links to purchase products from various e-commerce platforms
- **Virtual Try-On**: AI-powered virtual try-on feature using user photos and product images
- **Wishlist Management**: Save and manage favorite products
- **User Authentication**: Google OAuth integration for secure user access
- **Responsive Design**: Mobile-first design with smooth animations

### Admin Features
- **Content Management**: Add celebrities, posts, and products
- **Image Upload**: Integrated with ImageKit for efficient image handling
- **Category Management**: Dynamic category system for products


### Technical Features
- **Real-time Updates**: Server-side rendering with Next.js 14
- **Database Management**: PostgreSQL with Prisma ORM
- **Image Optimization**: Advanced image processing and optimization with imagekit.io
- **SEO Optimized**: Meta tags, Open Graph, and structured data
- **Performance**: Optimized loading and smooth scrolling

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Image Management**: ImageKit integration
- **State Management**: Recoil for client-side state
- **UI Components**: Radix UI with custom components

### Project Structure
```
Ace.thetics/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication components
│   ├── celebrity/         # Celebrity profile pages
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── MyComponent/       # Main application components
│   ├── post/              # Post detail pages
│   ├── product/           # Product detail pages
│   ├── store/             # Recoil state management
│   ├── virtual-tryon/     # Virtual try-on feature
│   └── wishlist/          # Wishlist pages
├── components/            # Shared UI components
├── constants/             # Application constants
├── hooks/                 # Global hooks
├── lib/                   # Utility functions and actions
├── prisma/                # Database schema and migrations
└── public/                # Static assets
```

## 🗄️ Database Schema

### Core Models
- **Celebrity**: Stores celebrity information (name, profile image, social media ID, gender, profession, country)
- **Product**: Product details (brand, category, shop, description, image, purchase link)
- **Post**: Celebrity posts with images and associated products
- **User**: User accounts with authentication data
- **Account/Session**: NextAuth.js authentication models

### Relationships
- Celebrities have multiple posts
- Posts can have multiple products (many-to-many)
- Users can like posts and add products to wishlist
- Products are categorized by shop and category

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials
- ImageKit account
- RapidAPI account (for virtual try-on)

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/acethetics"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXT_PUBLIC_ADMIN_EMAIL="admin@example.com"

# ImageKit
NEXT_PUBLIC_URL_ENDPOINT="your-imagekit-url"
NEXT_PUBLIC_PUBLIC_KEY="your-imagekit-public-key"
IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"

# Virtual Try-On (RapidAPI)
RAPIDAPI_KEY="your-rapidapi-key"

# Email (EmailJS)
EMAILJS_SERVICE_ID="your-emailjs-service-id"
EMAILJS_TEMPLATE_ID="your-emailjs-template-id"
EMAILJS_PUBLIC_KEY="your-emailjs-public-key"
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ace.thetics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### For Users

1. **Browse Fashion Posts**
   - Visit the homepage to see celebrity fashion posts
   - Scroll through posts featuring different celebrities
   - Click on posts to view details

2. **Discover Products**
   - Browse products associated with each post
   - Click on products to view details and purchase links
   - Add products to your wishlist (requires authentication)

3. **Virtual Try-On**
   - Click the "Try On" button on any product
   - Upload your photo or take one with the camera
   - Get AI-generated results showing you wearing the product
   - Limited to 3 tries per day

4. **Manage Wishlist**
   - Sign in with Google to access your account
   - Add/remove products from your wishlist
   - View all saved products in the wishlist section

### For Admins

1. **Access Admin Dashboard**
   - Navigate to `/admin` (requires admin email)
   - Sign in with your Google account

2. **Add Content**
   - Add new celebrities with profile images
   - Create posts with celebrity images
   - Add products with purchase links
   - Manage categories and shops

3. **Content Management**
   - Update existing celebrities and posts
   - Delete content as needed
   - Monitor user engagement

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/posts` - Fetch all posts
- `GET /api/posts/[id]` - Fetch specific post
- `GET /api/celebrities` - Fetch celebrities
- `GET /api/products` - Fetch products

### Protected Endpoints
- `POST /api/posts/[id]/like` - Like/unlike a post
- `POST /api/products/[id]/wishlist` - Add/remove from wishlist
- `GET /api/auth/[...nextauth]` - Authentication routes

### Admin Endpoints
- `POST /api/admin/create-celebrity` - Create celebrity
- `POST /api/admin/update-celebrity` - Update celebrity
- `DELETE /api/admin/delete-celebrity` - Delete celebrity
- `POST /api/admin/clear-db` - Clear database (development)

## 🎨 UI Components

### Core Components
- **Post**: Displays celebrity posts with images and products
- **ProductCard**: Product display with wishlist functionality
- **ImageComponent**: Optimized image loading with ImageKit
- **NavBar**: Navigation with search and user menu
- **ShareDialog**: Social media sharing functionality

### Admin Components
- **AdminPageClient**: Main admin interface
- **AuthDialog**: Authentication prompts
- **CameraCapture**: Photo capture for virtual try-on

### Styling
- Custom Tailwind CSS configuration
- Framer Motion animations
- Responsive design patterns
- Dark mode support

## 🔒 Security Features

- **Authentication**: Google OAuth with NextAuth.js
- **Authorization**: Role-based access control for admin
- **Input Validation**: Server-side validation for all inputs
- **Image Security**: Secure image upload with ImageKit
- **Rate Limiting**: Virtual try-on limits per user
- **CORS Protection**: Configured for production

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database Migration
```bash
npx prisma migrate deploy
```

### Build Commands
```bash
npm run build
npm start
```

## 📊 Performance Optimizations

- **Image Optimization**: Next.js Image component with ImageKit
- **Lazy Loading**: Components and images load on demand
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Strategic caching for static content
- **Bundle Analysis**: Optimized bundle sizes

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Commands
```bash
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes
npx prisma migrate dev # Create and apply migrations
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under a Custom Non-Commercial License. 

**What's Allowed:**
- ✅ Personal projects and learning
- ✅ Educational purposes and academic research
- ✅ Non-profit research and development
- ✅ Portfolio projects (non-commercial)
- ✅ Individual development and experimentation

**What's NOT Allowed:**
- ❌ Commercial use or business applications
- ❌ Selling the software or derivative works
- ❌ Using in commercial products or services
- ❌ Generating revenue from the software
- ❌ Creating competing products or services

For commercial licensing inquiries, please contact the development team.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

**Ace.thetics** - Decoding celebrity fashion, one post at a time.

grafana charts dashboard : ![grafana](image.png)

prometheus dashboard :![prometheus](image-1.png) 

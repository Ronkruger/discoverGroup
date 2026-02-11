# Promotional Banner Management System

## Overview
A comprehensive promotional banner management system that allows administrators to create, manage, and display promotional banners on the client website. This system replaces the previously hardcoded promo banner with a fully dynamic and configurable solution.

## Features

### Admin Panel Features
- **Create/Edit Banners**: Full CRUD operations for promotional banners
- **Live Preview**: See how banners will look before publishing
- **Enable/Disable Toggle**: Instantly activate or deactivate banners
- **Tour Assignment**: Apply discounts to specific tours or all tours
- **Color Customization**: Custom background and text colors with color picker
- **Date Scheduling**: Set start and end dates for time-limited promotions
- **Discount Management**: Set discount percentages and track which tours are affected

### Client-Side Features
- **Automatic Display**: Active banners automatically appear in the header
- **Animated Effects**: Smooth animations and gradient effects
- **Date Range Respect**: Banners only show within configured date ranges
- **CTA Integration**: Customizable call-to-action buttons with navigation

## Database Schema

### PromoBanner Model
```typescript
{
  isEnabled: Boolean,           // Enable/disable status
  title: String,                // Banner title (e.g., "Limited Time Offer")
  message: String,              // Banner message (e.g., "Up to 30% off on European Tours!")
  ctaText: String,              // CTA button text (e.g., "Book Now")
  ctaLink: String,              // CTA button link (e.g., "/deals")
  backgroundColor: String,      // Hex color code
  textColor: String,            // Hex color code
  discountPercentage: Number,   // 0-100
  discountedTours: [String],    // Array of tour slugs (empty = all tours)
  startDate: Date,              // Optional: promotion start date
  endDate: Date,                // Optional: promotion end date
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Public Endpoint
```
GET /api/promo-banners/active
```
Returns the currently active promo banner (if any). Respects date ranges and enabled status.

**Response:**
```json
{
  "banner": {
    "_id": "...",
    "isEnabled": true,
    "title": "Limited Time Offer",
    "message": "Up to 30% off on European Tours!",
    "ctaText": "Book Now",
    "ctaLink": "/deals",
    "backgroundColor": "#1e40af",
    "textColor": "#ffffff",
    "discountPercentage": 30,
    "discountedTours": ["route-a-preferred", "route-b-alternative"],
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.999Z"
  }
}
```

### Admin Endpoints

#### Get All Banners
```
GET /api/promo-banners
```
Returns all promo banners sorted by creation date (newest first).

#### Get Single Banner
```
GET /api/promo-banners/:id
```
Returns a specific banner by ID.

#### Create Banner
```
POST /api/promo-banners
Content-Type: application/json

{
  "title": "Limited Time Offer",
  "message": "Up to 30% off on European Tours!",
  "ctaText": "Book Now",
  "ctaLink": "/deals",
  "backgroundColor": "#1e40af",
  "textColor": "#ffffff",
  "discountPercentage": 30,
  "discountedTours": [],
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

#### Update Banner
```
PUT /api/promo-banners/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "message": "Updated message"
}
```

#### Toggle Banner Status
```
PATCH /api/promo-banners/:id/toggle
```
Toggles the `isEnabled` status. When enabling a banner, automatically disables all other banners (only one active at a time).

#### Delete Banner
```
DELETE /api/promo-banners/:id
```
Permanently deletes a banner.

## Usage Guide

### For Administrators

#### Creating a New Banner
1. Navigate to **Admin Panel → Promo Banners**
2. Click **"Create Banner"** button
3. Fill in the form:
   - **Banner Title**: Short, attention-grabbing title
   - **Banner Message**: Detailed offer description
   - **Button Text**: CTA text (e.g., "Book Now", "View Deals")
   - **Button Link**: Where users go when clicking (e.g., `/deals`)
   - **Discount Percentage**: 0-100%
   - **Background Color**: Use color picker or enter hex code
   - **Text Color**: Use color picker or enter hex code
   - **Start Date** (optional): When promotion begins
   - **End Date** (optional): When promotion ends
4. **Select Tours** (optional): Choose specific tours or leave empty for all tours
5. Preview the banner in the live preview section
6. Click **"Create Banner"**

#### Managing Existing Banners
- **Enable/Disable**: Click the power button to toggle status
- **Edit**: Click the edit button to modify banner details
- **Delete**: Click the delete button to permanently remove
- **View Tours**: See which tours are included in the promotion

#### Best Practices
1. **One Active Banner**: Only one banner should be enabled at a time (enforced automatically)
2. **Clear CTAs**: Use action-oriented button text ("Book Now", "View Deals")
3. **Contrasting Colors**: Ensure text is readable against background
4. **Date Ranges**: Set specific dates for limited-time offers
5. **Tour Selection**: Target specific tours for focused promotions

### For Developers

#### Client Integration
The Header component automatically fetches and displays active banners:

```tsx
// Fetched on component mount
const [promoBanner, setPromoBanner] = useState<PromoBanner | null>(null);

useEffect(() => {
  fetch(`${API_BASE}/api/promo-banners/active`)
    .then(res => res.json())
    .then(data => setPromoBanner(data.banner));
}, []);

// Displayed above main navigation
{promoBanner && (
  <div style={{ 
    backgroundColor: promoBanner.backgroundColor,
    color: promoBanner.textColor 
  }}>
    {/* Banner content */}
  </div>
)}
```

#### Adding New Banner Features
1. **Update Model**: Modify `apps/api/src/models/PromoBanner.ts`
2. **Update Routes**: Modify `apps/api/src/routes/promoBanner.ts`
3. **Update Admin UI**: Modify `apps/admin/src/pages/PromoBannerManagement.tsx`
4. **Update Client**: Modify `src/components/Header.tsx`

## File Structure
```
apps/
  api/
    src/
      models/
        PromoBanner.ts          # MongoDB model
      routes/
        promoBanner.ts          # API endpoints
      index.ts                  # Route registration
  admin/
    src/
      pages/
        PromoBannerManagement.tsx  # Admin UI
      App.tsx                   # Route definition
      components/
        Sidebar.tsx             # Navigation item
src/
  components/
    Header.tsx                  # Client display
```

## Security Considerations

1. **Admin Access Only**: All management endpoints should require admin authentication
2. **Input Validation**: Validate colors, dates, and percentages
3. **XSS Prevention**: Sanitize all text inputs
4. **Rate Limiting**: Protect API endpoints from abuse
5. **CORS**: Ensure proper CORS configuration for API access

## Future Enhancements

Potential features for future implementation:
- [ ] Banner analytics (impressions, clicks)
- [ ] A/B testing for multiple banner variants
- [ ] Scheduling system for banner rotation
- [ ] Banner templates library
- [ ] Multi-language support
- [ ] Image upload for banner backgrounds
- [ ] Animation customization
- [ ] Target audience segmentation
- [ ] Banner performance metrics
- [ ] Auto-expire based on tour availability

## Troubleshooting

### Banner Not Showing on Client
1. Check if banner is enabled in admin panel
2. Verify date range (if set) includes current date
3. Check browser console for API errors
4. Ensure API_BASE URL is correct in client

### API Errors
1. Verify MongoDB connection
2. Check PromoBanner model is imported in API
3. Ensure routes are registered in `index.ts`
4. Check CORS configuration

### Admin Panel Issues
1. Clear browser cache
2. Check browser console for errors
3. Verify admin user has proper permissions
4. Ensure API endpoint is accessible

## Related Documentation
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - General system overview
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment instructions
- [IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md) - Feature history

## Support
For issues or questions, contact the development team or refer to the main README.md.

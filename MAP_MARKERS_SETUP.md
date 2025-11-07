# Map Markers Management Setup Guide

## Overview
This guide will help you set up the Map Markers management system that allows admins to add, edit, and delete map location markers displayed on the client homepage "Explore Europe at a Glance" section.

## Features
- ✅ **Admin Panel CRUD Interface**: Full Create, Read, Update, Delete operations
- ✅ **Supabase Storage**: Map markers stored in Supabase database
- ✅ **Dynamic Map Display**: Client homepage fetches markers in real-time
- ✅ **Active/Inactive Toggle**: Control marker visibility without deletion
- ✅ **Tour Linking**: Optional tour_slug to link markers to specific tours
- ✅ **Position Control**: Set marker positions using CSS values (%, px)

## Setup Steps

### 1. Create Supabase Table
Run the SQL script in your Supabase SQL Editor:

```bash
# File location: supabase-map-markers-setup.sql
```

**Steps:**
1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase-map-markers-setup.sql`
5. Click **Run** to execute the SQL

This will:
- ✅ Create `map_markers` table with proper schema
- ✅ Set up auto-update timestamp trigger
- ✅ Insert 4 initial markers (Paris, Rome, Lucerne, Florence)
- ✅ Enable Row Level Security (RLS)
- ✅ Create policies for public read and authenticated write access
- ✅ Create index for performance

### 2. Verify Supabase Connection
Make sure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://izrwpdbmgphfnizhbgoc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Access Admin Panel
1. Navigate to your admin panel: `https://admin--discovergrp.netlify.app/map-markers`
2. Or locally: `http://localhost:5174/map-markers` (admin app)
3. You should see the **Map Markers Management** page in the sidebar

**Required Permissions:**
- Administrator
- Web Developer
- Super Admin

### 4. Test CRUD Operations

#### Add New Marker
1. Click **"Add New Marker"** button
2. Fill in the form:
   - **City** (required): e.g., "Barcelona"
   - **Country** (optional): e.g., "Spain"
   - **Top Position** (required): CSS value, e.g., "50%" or "200px"
   - **Left Position** (required): CSS value, e.g., "25%" or "150px"
   - **Description** (optional): Brief description shown on hover
   - **Tour Slug** (optional): Link to specific tour, e.g., "barcelona-city-break"
   - **Active Status**: Toggle to show/hide on client page
3. Click **Save Marker**

#### Edit Existing Marker
1. Find the marker in the table
2. Click the **Edit** button (pencil icon)
3. Update the fields as needed
4. Click **Save Marker**

#### Toggle Active/Inactive
1. Find the marker in the table
2. Click the **eye icon** to toggle visibility
3. Inactive markers won't show on the client page but remain in the database

#### Delete Marker
1. Find the marker in the table
2. Click the **Delete** button (trash icon)
3. Confirm deletion in the dialog
4. Marker is permanently removed from the database

### 5. Verify on Client Page
1. Go to the client homepage: `https://discovergrp.netlify.app/`
2. Or locally: `http://localhost:5173/`
3. Scroll down to **"Explore Europe at a Glance"** section
4. Your map markers should appear as blue dots
5. Hover over dots to see city name and description

## Files Modified

### Client Files
- ✅ `src/pages/Home.tsx` - Updated to fetch markers from Supabase
- ✅ `src/lib/supabase-map-markers.ts` - Supabase client for CRUD operations

### Admin Files
- ✅ `apps/admin/src/pages/MapMarkersManagement.tsx` - Admin UI component
- ✅ `apps/admin/src/App.tsx` - Added `/map-markers` route
- ✅ `apps/admin/src/components/Sidebar.tsx` - Added "Map Markers" menu item

### Database Files
- ✅ `supabase-map-markers-setup.sql` - SQL setup script

## Map Marker Schema

```typescript
interface MapMarker {
  id: number;                    // Auto-generated
  city: string;                  // Required - City name
  country?: string;              // Optional - Country name
  top: string;                   // Required - CSS top position (%, px)
  left: string;                  // Required - CSS left position (%, px)
  description?: string;          // Optional - Hover description
  tour_slug?: string;            // Optional - Link to tour
  is_active: boolean;            // Required - Visibility toggle
  created_at: string;            // Auto-generated
  updated_at: string;            // Auto-updated
}
```

## Position Guide

### Finding Map Positions
1. Open browser DevTools on the client page
2. Right-click on the map image → Inspect
3. Use the element picker to hover over desired locations
4. Note the percentage or pixel values relative to the map container

### Position Examples
- **Percentage** (responsive): `top: "40%"`, `left: "35%"`
- **Pixels** (fixed): `top: "200px"`, `left: "150px"`
- **Mix**: `top: "50%"`, `left: "300px"`

### Tips
- Use **percentages** for responsive positioning
- Test on different screen sizes
- Blue dots are 16px × 16px (w-4 h-4 in Tailwind)
- Hover tooltips appear 24px to the right of the dot

## Troubleshooting

### Markers Not Showing on Client Page
1. Check Supabase table exists: `SELECT * FROM map_markers;`
2. Verify `is_active = true` for markers
3. Check browser console for errors
4. Verify Supabase credentials in `.env`
5. Clear browser cache and reload

### Admin Panel Not Accessible
1. Check user role (must be Administrator, Web Developer, or Super Admin)
2. Verify route is registered in `apps/admin/src/App.tsx`
3. Check Sidebar menu for "Map Markers" link
4. Verify Supabase RLS policies allow authenticated access

### CRUD Operations Failing
1. Check Supabase RLS policies are set correctly
2. Verify authenticated user has proper permissions
3. Check browser console for Supabase errors
4. Test with Supabase SQL Editor: `SELECT * FROM map_markers;`

### Map Markers in Wrong Positions
1. Use browser DevTools to inspect map container
2. Adjust top/left values in admin panel
3. Remember: position is relative to the map image container
4. Test on different screen sizes for responsive positions

## API Reference

### Supabase Client Functions

```typescript
// Fetch all active markers
const markers = await fetchMapMarkers();

// Create new marker
const newMarker = await createMapMarker({
  city: "Barcelona",
  country: "Spain",
  top: "50%",
  left: "25%",
  description: "Beautiful coastal city",
  tour_slug: "barcelona-city-break",
  is_active: true
});

// Update existing marker
await updateMapMarker(markerId, {
  description: "Updated description",
  top: "55%"
});

// Delete marker
await deleteMapMarker(markerId);

// Toggle active status
await toggleMapMarkerStatus(markerId, false);
```

## Security Notes

### Row Level Security (RLS)
- **Public (anon)**: Can only SELECT active markers (`is_active = true`)
- **Authenticated**: Full CRUD access to all markers
- **Service Role**: Full access (use carefully in admin operations)

### Recommendations
1. Keep Supabase anon key in `.env` (already done)
2. Never expose service role key in client code
3. Consider adding role-based policies for finer control
4. Audit marker changes regularly
5. Limit admin access to trusted users only

## Future Enhancements

### Potential Features
- 📍 **Drag & Drop Positioning**: Visual map editor for easier positioning
- 🖼️ **Custom Icons**: Upload custom marker icons per location
- 🔗 **Direct Tour Linking**: Click marker → Navigate to tour page
- 📊 **Analytics**: Track which markers get the most hovers
- 🌍 **Multiple Maps**: Support different map regions
- 🎨 **Color Coding**: Different colors for different tour types
- 📱 **Mobile Optimization**: Better mobile hover/tap interactions

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review browser console errors
3. Check Supabase logs in dashboard
4. Verify all files are properly deployed
5. Test locally before deploying to production

## Deployment Checklist

Before deploying to production:

- [ ] Supabase table created and seeded
- [ ] `.env` files have correct Supabase credentials
- [ ] Admin route accessible to authorized users
- [ ] Client page shows markers correctly
- [ ] CRUD operations work in admin panel
- [ ] RLS policies are properly configured
- [ ] Mobile view tested
- [ ] Initial markers migrated from hardcoded values

---

**Last Updated**: January 2025  
**Version**: 1.0.0

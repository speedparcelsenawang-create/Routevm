# Overview

This full-stack web application provides a robust data management system for tabular data. It features a drag-and-drop interface for creating, editing, and organizing table rows and columns with support for various data types (text, numbers, currency, images). Key capabilities include real-time statistics, an image gallery with lightbox functionality, and comprehensive CRUD operations for both table structure and content. The project aims to deliver a highly interactive and visually appealing data management solution with a focus on user experience and expandability.

## Application Modes

The application operates in three distinct modes:

1. **Table View Mode** (Default)
   - Read-only view of the data table
   - Search and filter functionality
   - View images and media in gallery
   - Access to route optimization and sharing features
   - Default mode when application loads

2. **Edit Mode**
   - Full editing capabilities for table data
   - Add, update, and delete rows and columns
   - Drag-and-drop reordering of rows and columns
   - Customizable column settings
   - Activated via edit button in navigation

3. **Route Management Mode**
   - Interactive Google Maps integration
   - Optimized route calculation for deliveries
   - Distance and toll price calculations
   - Traffic-aware routing for lorry/truck vehicles
   - Fullscreen map view with route filtering
   - Accessed via Route Optimization button

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React with TypeScript (Vite for build)
- **UI**: Shadcn/ui (Radix UI primitives), Tailwind CSS for styling
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation
- **Drag & Drop**: @hello-pangea/dnd

## Backend
- **Runtime**: Node.js with Express.js (TypeScript, ES modules)
- **API**: RESTful, Zod for validation
- **Storage**: In-memory (development), Drizzle ORM with PostgreSQL schema definitions
- **Development**: Hot reload with Vite integration

## Data Storage
- **Current**: In-memory using JavaScript Maps
- **Schema**: Drizzle ORM with PostgreSQL
- **Database**: Neon Database (serverless PostgreSQL)
- **Migrations**: Drizzle Kit

## Authentication and Authorization
- **Current State**: No authentication implemented
- **Session Management**: Basic middleware with connect-pg-simple
- **Security**: CORS configuration

## UI/UX & Features
- **Design**: Premium UI components, deep black dark theme, gradient backgrounds, blue accents.
- **Table Management**: Drag-and-drop rows/columns, editable "No" column for sorting, per-user layout preferences.
- **Data Types**: Support for text, numbers, currency, images, and videos.
- **Media**: Enhanced media upload system supporting various image/video formats from gallery or URL, large file support (base64 data URLs), comprehensive video playback.
- **Mapping**: Google Maps API integration with lorry-optimized route calculation (distance, toll prices, traffic-aware optimal routing), color-coded route markers, enhanced fullscreen map view.
- **Tutorial System**: Interactive, context-aware tutorial with premium UI.
- **Header Content**: Multi-page carousel for dynamic header content with CRUD operations.
- **Calculations**: AI generator row (Totals) dynamically calculates based on visible filtered/searched data.
- **Animations**: Smooth page transition animations.
- **Compatibility**: Safari/iPad compatibility fixes for backdrop-blur effects.
- **Performance**: Optimized marker sizes for map visualization.

# External Dependencies

- **Database**: Neon Database (`@neondatabase/serverless`)
- **Image Gallery**: LightGallery (with zoom and thumbnail plugins)
- **Mapping**: Google Maps API (Routes API)
- **Fonts**: Google Fonts (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)
- **Development**: Replit-specific plugins (runtime error handling, cartographer)
- **UI Utilities**: clsx, class-variance-authority
- **Date Management**: Date-fns

# Recent Changes

- **Navigation Date/Time Display**: Added real-time clock to navigation header
  - Live date and time displayed below "Route Management" or "Edit Mode" text
  - Updates every second for accurate time tracking
  - Small, subtle styling that complements the navigation design
  - Helps users track session time and current date/time context
- **Route Management Help Guide**: Added help guide button to route optimization modal
  - Tutorial button now visible in route management/optimization page
  - Users can access help and guidance while optimizing routes
  - Consistent help experience across all application modes
- **Info Modal Border Color**: Changed border to midnight blue in light mode
  - Dialog border, header, and footer use midnight blue (blue-900) in light mode
  - Dark mode retains cyan accent color for consistency
- **Footer URL Support**: Added optional URL field to footer company name
  - Users can now add a website URL to the company name in the footer
  - Company name becomes clickable link when URL is provided
  - URL field is optional in footer edit dialog
  - Opens in new tab with security (noopener, noreferrer)
  - Stored in global settings as footerCompanyUrl
- **Kilometer Column Fix**: Fixed kilometer column calculation dependency
  - Added missing rows dependency to useMemo for distance calculations
  - Ensures distances update correctly when data changes
- **QL Kitchen Capitalization Fix**: Renamed "QL kitchen" to "QL Kitchen" throughout the application
  - Updated all code references to use consistent capitalization
  - Affects display, logic, filtering, and storage operations
  - Maintains special row behavior (infinity icon, top position, distance calculations)
- **Info Column Visibility**: Modified info column and button behavior for cleaner UI
  - Info column now only displays in edit mode
  - Info column hidden from customize modal to prevent user confusion
  - Info button moved to action column and always visible (read-only view)
  - Info button has transparent background and border for minimal design
  - Users can access row information from action column in both edit and view modes
  - Provides cleaner table layout in view mode while maintaining full functionality

- **Active/Inactive Row Toggle**: Added row activation control with visual feedback
  - Power button in action column to toggle row active/inactive state
  - Green color when active, red color when inactive for clear visual status
  - Power button uses transparent background and border for minimal design
  - Power button only functional in edit mode (disabled in view mode)
  - Inactive rows automatically sorted to bottom of table
  - Inactive rows displayed with gray background and 50% opacity
  - Active state persists in database with boolean field
  - Visual distinction helps users identify disabled/archived entries
- **Drag Handle Icon with Cursor Animation**: Added visual drag handle in action column
  - GripVertical icon appears in action column for drag and drop
  - Cursor changes from hand (cursor-grab) to grabbing hand (cursor-grabbing) when dragging
  - Visible in both edit and viewer modes for consistent UI
  - Drag functionality isolated to specific handle area instead of entire row
- **UI Reorganization**: Removed screenshot feature and reorganized action buttons
  - Removed screenshot button and ScreenshotDialog component entirely
  - Moved Share button from top navigation to table footer beside Route Optimization button
  - Cleaned up Navigation component by removing unused imports and props
  - Share functionality now easily accessible in the same location as other table actions
- **Shared View Tutorial Hide**: Hidden help guide button in shared table view
  - Tutorial/help guide button no longer appears in read-only shared table views
  - Conditional rendering based on isAuthenticated prop (false in shared views)
  - Improves shared view user experience by removing unnecessary UI elements
- **Shortened Share URLs**: Reduced share link length for easier sharing
  - Share IDs shortened from 8 characters to 6 characters
  - More compact URLs like `/share/a1b2c3` instead of longer IDs
  - Maintains uniqueness while improving user experience
- **Loading Text Duplication Fix**: Fixed duplicated "Loading" text in loading overlay
  - Removed redundant text content from loading-dots-text span element
  - CSS animation already generates animated "Loading..." text via ::after pseudo-element
  - Prevents "LoadingLoading..." duplication in loading launcher
- **Trip Column Renamed to Delivery**: Comprehensive rename of "Trip" column to "Delivery" throughout application (October 19, 2025)
  - Database column renamed from "trip" to "delivery" in table_rows schema
  - Updated all frontend components: data-table, column-header, column-customization-modal, route-optimization-modal, tutorial, share-dialog
  - Changed all filter variables from tripFilters/tripFilterValue to deliveryFilters/deliveryFilterValue
  - Updated storage interfaces and API routes to use delivery terminology
  - Modified UI text from "Trip" to "Delivery" for consistency with business domain
  - Maintains backward compatibility with existing data through database column rename
- **Optimized Table Cell Spacing**: Reduced left/right spacing for more compact table layout (October 20, 2025)
  - Changed column headers and table cells from w-10/12 (83%) to w-11/12 (92%) to w-[98%] for minimal spacing
  - Content now uses 98% of available width with only 1% margin on each side
  - Reduced cell padding from px-10 to px-6 for more compact width
  - Provides more space for data display while maintaining centered alignment
  - Applied to both column-header.tsx and data-table.tsx components
- **Page Deletion Confirmation & Carousel Start Position** (October 20, 2025)
  - Added confirmation dialog before deleting carousel pages
  - Premium red-themed confirmation dialog with page title display
  - Prevents accidental page deletion with explicit user confirmation
  - Carousel now automatically starts at first page (index 0) on load
  - Ensures consistent user experience with predictable starting position
- **Action Buttons Spacing Optimization** (October 20, 2025)
  - Reverted action buttons spacing to gap-2 for compact layout
  - Applied to Customize, Route Optimization, and Share buttons in table footer
  - Maintains consistent spacing with modern Flexbox gap utilities
- **Vercel Deployment Configuration** (October 20, 2025)
  - Added vercel.json for seamless Vercel deployment
  - Configured routes for API and static assets
  - Set up SPA rewrites for client-side routing
  - Node.js 20.x runtime with 30s max duration
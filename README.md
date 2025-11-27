# Bizta Owner Dashboard

A comprehensive web dashboard for business owners to monitor and manage their Bizta AI assistant conversations.

## Features

### 📊 Overview Dashboard
- **Real-time metrics**: Total conversations, new customers, human attention required, pending followups
- **Top customer intents**: See what customers are asking about most
- **Quick actions**: Jump to conversations needing attention

### 💬 Conversations Management
- **List view**: Browse all customer conversations with pagination
- **Filtering**: View conversations requiring human attention
- **Conversation details**: Full message history with AI/human attribution
- **Manual replies**: Send human responses directly to customers

### 🔐 Authentication
- JWT-based authentication using existing NestJS backend
- Secure token storage and automatic session management
- Protected routes with automatic redirect

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- TanStack Query (React Query)
- Axios

**Backend:**
- NestJS Dashboard API module
- PostgreSQL with Prisma ORM
- JWT authentication

## Project Structure

```
bizta-web/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── conversations/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx        # Conversation detail + reply
│   │   │   │   └── page.tsx            # Conversations list
│   │   │   ├── layout.tsx              # Dashboard layout with nav
│   │   │   └── page.tsx                # Overview dashboard
│   │   ├── login/
│   │   │   └── page.tsx                # Login page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Redirect to dashboard
│   │   └── providers.tsx               # React Query + Auth providers
│   ├── components/
│   │   └── AuthProvider.tsx            # Auth context and guards
│   └── lib/
│       ├── api-client.ts               # Axios client with interceptors
│       ├── auth.ts                     # Auth utilities
│       └── hooks/
│           └── useDashboard.ts         # TanStack Query hooks
├── .env.local                          # Environment variables
└── package.json
```

## Backend API Endpoints

The dashboard consumes these endpoints from the NestJS backend:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/login` | POST | Login with email/password |
| `/api/v1/dashboard/summary/today` | GET | Today's summary statistics |
| `/api/v1/dashboard/conversations` | GET | List conversations (paginated) |
| `/api/v1/dashboard/conversations/:id` | GET | Get conversation details |
| `/api/v1/dashboard/conversations/:id/reply` | POST | Send human reply |

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Backend API running on `http://localhost:3000`
- Valid user account in the system

### Installation

1. **Install dependencies:**
   ```bash
   cd "d:\New folder\bizta-web"
   npm install
   ```

2. **Configure environment:**
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   ```

3. **Development mode:**
   ```bash
   npm run dev
   ```
   
   Dashboard will be available at `http://localhost:3001`

4. **Production build:**
   ```bash
   npm run build
   npm start
   ```

## Usage

### Login
1. Navigate to `http://localhost:3001`
2. You'll be redirected to `/login`
3. Enter your email and password (use existing backend user credentials)
4. On successful login, you'll be redirected to the dashboard

### Overview Dashboard
- View today's key metrics at a glance
- See top customer intents
- Click "Requires Human" card to jump to conversations needing attention
- Click "All Conversations" to browse all interactions

### Managing Conversations
1. Go to "Conversations" tab
2. Browse paginated list of all conversations
3. Filter by "Requires Human" status via URL parameter
4. Click any conversation to view details

### Conversation Details
- View full message history (AI vs Human responses highlighted)
- See customer info, intent, lead score, followup status
- Send manual reply using the form at the bottom
- Reply is sent via WhatsApp and saved to database

### Logout
Click "Sign Out" in the top-right corner

## Data Refresh

- **Overview metrics**: Auto-refresh every 30 seconds
- **Conversations list**: Refresh on page navigation
- **Conversation detail**: Auto-refreshes after sending reply
- All queries cached for 1 minute (staleTime)

## Type Safety

The dashboard uses TypeScript throughout with full type definitions for:
- API request/response payloads
- React component props
- TanStack Query hooks
- Form data

## Error Handling

- **401 Unauthorized**: Automatic logout and redirect to login
- **Network errors**: Displayed in UI with retry capability
- **Form validation**: Client-side validation before submission

## Styling

- Clean, minimal design with Tailwind CSS
- Desktop-first responsive layout
- Color coding:
  - Blue: AI responses, informational
  - Green: Human responses, positive actions
  - Orange: Requires attention
  - Purple: Scheduled followups

## Development Tips

### Adding New Dashboard Features

1. **Add backend endpoint** in `bizta-api/src/modules/dashboard/`
2. **Create TypeScript types** in `useDashboard.ts`
3. **Add TanStack Query hook** in `useDashboard.ts`
4. **Create UI component** in `src/app/dashboard/`
5. **Wire up hook** in component

### Debugging

- Check browser console for API errors
- Inspect Network tab for failed requests
- Verify JWT token in localStorage
- Check backend logs for API issues

### API Client Configuration

The axios client (`src/lib/api-client.ts`) automatically:
- Adds JWT token to all requests
- Handles 401 responses (logout + redirect)
- Sets proper Content-Type headers

## Backend Module

The dashboard backend module is located at:
```
bizta-api/src/modules/dashboard/
├── dto/
│   ├── dashboard-summary.dto.ts
│   ├── conversation-list.dto.ts
│   ├── conversation-detail.dto.ts
│   └── send-reply.dto.ts
├── dashboard.service.ts
├── dashboard.controller.ts
└── dashboard.module.ts
```

## Future Enhancements

Potential additions:
- [ ] Real-time updates via WebSockets
- [ ] Export conversations to CSV
- [ ] Advanced filtering (date range, intent, lead score)
- [ ] Conversation search
- [ ] Bulk actions on conversations
- [ ] Analytics charts and trends
- [ ] Mobile responsive design
- [ ] Dark mode support

## Troubleshooting

### Cannot connect to API
- Ensure backend is running on port 3000
- Check `.env.local` has correct API URL
- Verify CORS is enabled in backend

### Login fails
- Verify user exists in database
- Check password is correct
- Inspect backend logs for auth errors

### Conversations not loading
- Ensure JWT token is valid (check localStorage)
- Verify user has `orgId` assigned
- Check backend dashboard endpoints are working

### Build fails
- Clear `.next` folder: `Remove-Item -Recurse .next`
- Delete `node_modules` and reinstall
- Check for TypeScript errors: `npm run build`

## Support

For issues or questions:
1. Check backend logs in `bizta-api`
2. Check browser console for frontend errors
3. Verify database has conversation data
4. Test API endpoints directly with curl/Postman

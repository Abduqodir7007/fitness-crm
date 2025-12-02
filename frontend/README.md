# Fitness CRM Frontend

React + Vite + Tailwind CSS frontend for the Fitness CRM application.

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` to point to your backend API:

```
VITE_API_URL=http://localhost:8000/api
```

### 3. Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and will proxy `/api` requests to `http://localhost:8000`.

## Project Structure

```
src/
├── components/      # Reusable React components
├── pages/          # Page components (full routes)
├── api/            # API service modules (auth.js, users.js, etc)
├── hooks/          # Custom React hooks (useAuth, useFetch, etc)
├── App.jsx         # Main app component with routing
├── main.jsx        # React entry point
└── index.css       # Tailwind CSS imports
```

## Scripts

-   `npm run dev` - Start dev server with hot reload
-   `npm run build` - Build for production
-   `npm run preview` - Preview production build locally
-   `npm run lint` - Check code with ESLint
-   `npm run lint:fix` - Fix linting issues automatically

## API Integration

All API calls use the Axios client from `src/api/client.js`. This client:

-   Sets base URL from `VITE_API_URL` env variable
-   Automatically includes JWT token in `Authorization` header
-   Redirects to login if 401 Unauthorized

### Example API Module Structure

```javascript
// src/api/users.js
import client from "./client";

export const usersAPI = {
    getAll: async () => {
        const response = await client.get("/users");
        return response.data;
    },
};
```

### Using in Components

```javascript
import { useState, useEffect } from "react";
import { usersAPI } from "../api/users";

function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        usersAPI
            .getAll()
            .then((data) => {
                setUsers(data);
                setLoading(false);
            })
            .catch((err) => console.error("Error:", err));
    }, []);

    if (loading) return <div>Loading...</div>;
    return <div>{/* Render users */}</div>;
}
```

## Tailwind CSS

All Tailwind classes are available in components. See `tailwind.config.js` for customization.

Example:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900">Card Title</h3>
    </div>
</div>
```

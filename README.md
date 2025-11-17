## Next.js Auth App – Theory to Practice

This project is a **Next.js (App Router) authentication demo** that takes you from theory to a working full‑stack implementation. It shows how to build signup/login flows, protect routes using JWTs in HTTP‑only cookies, and connect everything to a MongoDB database using Mongoose.

---

## Tech Stack

- **Framework**: Next.js (App Router, `app` directory)
- **Language**: TypeScript (for routes and pages)
- **Database**: MongoDB with **Mongoose**
- **Auth**:
  - JSON Web Tokens (**JWT**) stored in **HTTP‑only cookies**
  - Password hashing with **bcryptjs**
- **Client HTTP**: Axios
- **UI**: Tailwind CSS‑style classes
- **Notifications**: `react-hot-toast`

---

## Project Structure (Auth‑related)

- `app/signup/page.tsx` – Signup form UI and client logic
- `app/login/page.tsx` – Login form UI and client logic
- `app/profile/page.tsx` – Protected profile page that loads the logged‑in user
- `app/api/users/signup/route.ts` – API route for creating a new user
- `app/api/users/login/route.ts` – API route for logging a user in and setting the JWT cookie
- `app/api/users/me/route.ts` – API route for reading the current user from the JWT
- `app/api/users/logout/route.ts` – API route for logging out (clears cookie)
- `helpers/getDataFromToken.ts` – Helper to read & verify JWT from cookies
- `models/userModel.js` – Mongoose user schema & model

---

## How This Project Was Created

- **Step 1 – Bootstrap Next.js App**
  - Created a new Next.js project with the App Router (`app` directory).
  - Added TypeScript support.

- **Step 2 – Configure Database**
  - Created a MongoDB database.
  - Added a connection helper (e.g. `db/config`) and imported it in API routes with `connect()`.
  - Defined a `User` model in `models/userModel.js` using Mongoose with fields like `fullName`, `email`, `password`, `isAdmin`, `isVerified`, and token‑related fields.

- **Step 3 – Implement Signup API**
  - Implemented `POST /api/users/signup`:
    - Validates if a user with the same email already exists.
    - Hashes the password with **bcryptjs** (`genSalt` + `hash`).
    - Saves the new user in MongoDB.

- **Step 4 – Implement Login API**
  - Implemented `POST /api/users/login`:
    - Looks up the user by `email`.
    - Validates the password using `bcryptjs.compare`.
    - Creates a JWT with `id`, `username`/`fullName`, and `email`.
    - Signs JWT with `process.env.TOKEN_SECRET` and `expiresIn: '1d'`.
    - Sets the JWT as an **HTTP‑only cookie** named `token`.

- **Step 5 – Implement “Me” and Logout APIs**
  - `GET /api/users/me`:
    - Uses `getDataFromToken` to read the `token` cookie.
    - Verifies the token and extracts `userId`.
    - Fetches the user by ID and returns it without sensitive fields (`-password -_id -__v`).
  - `GET /api/users/logout`:
    - Returns a response that sets a `token` cookie with an expired date to effectively delete it.

- **Step 6 – Build Client Pages**
  - `signup` and `login` pages:
    - Use React `useState` to control form data.
    - Send requests via Axios to `/api/users/signup` and `/api/users/login`.
    - Show success/error using `react-hot-toast`.
  - `profile` page:
    - On mount, calls `/api/users/me` to load current user data.
    - Shows the user’s `fullName`.
    - Provides a logout button that calls `/api/users/logout` and redirects to `/login`.

---

## How Authentication & Security Work

### 1. User Signup Flow

- **Route**: `POST /api/users/signup`
- **File**: `app/api/users/signup/route.ts`
- **Process**:
  - Reads `fullName`, `email`, `password` from `request.json()`.
  - Checks if a user with the same `email` already exists:
    - If yes, returns `400` with `user already exists`.
  - Generates a salt and hashes the password with **bcryptjs**:
    - Only the **hashed password** is saved, never the raw password.
  - Creates and saves a new `User` document in MongoDB.
  - Returns a success message and status `201`.

**Security aspects**:
- Passwords are **never stored in plain text**.
- bcryptjs with a salt provides resistance against rainbow table attacks.
- Email uniqueness prevents duplicate accounts on the same email.

### 2. User Login Flow

- **Route**: `POST /api/users/login`
- **File**: `app/api/users/login/route.ts`
- **Process**:
  - Reads `email`, `password` from the request body.
  - Finds the user by `email`.
  - Checks the password using `bcryptjs.compare(password, user.password)`.
  - If the password is invalid, returns `401` with `Invalid Password`.
  - If valid, builds `tokenData` with:
    - `id`: MongoDB `_id`
    - `username`/`fullName`
    - `email`
  - Signs a JWT:
    - `jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: '1d' })`
  - Sends back a JSON response with a success message and sets a **cookie**:
    - Name: `token`
    - Value: JWT string
    - Options: `{ httpOnly: true }`

**Security aspects**:
- **Hashed password check**: The API compares the provided password against the hashed password stored in the DB.
- **JWT**:
  - Signed with a secret (`TOKEN_SECRET`).
  - Contains only necessary claims (`id`, `username`, `email`).
  - Has an **expiration time** (`1d`).
- **HTTP‑only cookie**:
  - Cookie is marked `httpOnly`, so it **cannot be read from JavaScript** in the browser, which helps mitigate XSS‑based token theft.

### 3. Storing Auth State – HTTP‑Only JWT Cookie

- The token is stored only on the server set‑cookie header and becomes an **HTTP‑only cookie**.
- On every request to your Next.js API routes under the same domain, the browser automatically includes the `token` cookie.
- Because it is `httpOnly`, client‑side code cannot access or modify the token directly.

### 4. Reading the Logged‑in User (`/me` route)

- **Route**: `GET /api/users/me`
- **Files**:
  - `app/api/users/me/route.ts`
  - `helpers/getDataFromToken.ts`

**Flow**:
- `getDataFromToken(request)`:
  - Reads the `token` cookie from `request.cookies`.
  - Verifies it with `jwt.verify(token, process.env.TOKEN_SECRET)`.
  - Returns the `decodedToken.id` (user ID).
- `GET /api/users/me`:
  - Calls `getDataFromToken` to get `userId`.
  - Uses Mongoose `User.findById(userId).select("-password -_id -__v")`.
  - Returns the user object (without password and internal fields) in JSON.

**Security aspects**:
- **JWT verification** ensures that:
  - The token was signed with the correct secret.
  - The token is not expired.
  - The payload has not been tampered with.
- Sensitive fields like `password` are **excluded** from the response.

### 5. Logout Flow

- **Route**: `GET /api/users/logout`
- **File**: `app/api/users/logout/route.ts`

**Flow**:
- Returns a JSON response with logout success.
- Sets the `token` cookie to an empty string and sets `expires` to a date in the past:
  - This tells the browser to remove the cookie.

**Security aspects**:
- After logout, the browser no longer sends the JWT cookie, so requests to `/api/users/me` will fail token verification (or be unauthenticated).

### 6. Protected Pages on the Client (`/profile`)

- **File**: `app/profile/page.tsx`

**Flow**:
- On mount (`useEffect`), calls `GET /api/users/me` using Axios.
- If successful:
  - Stores user data in React state and shows `user.fullName` in the UI.
- Logout:
  - Button trigger calls `GET /api/users/logout`.
  - On success, shows a toast and then redirects to `/login`.

**Security aspects**:
- The profile data comes from the secure `/me` endpoint which validates JWT from an HTTP‑only cookie.
- If someone does not have a valid JWT (not logged in or cookie removed), the `/me` route will fail and you can handle that on the client (e.g., redirect to `/login`).

---

## Environment Variables

You will need at least the following environment variables (e.g. in `.env.local`):

- **`MONGODB_URI`**: Connection string for MongoDB.
- **`TOKEN_SECRET`**: Secret key for signing JWTs.

Make sure **never to commit** actual secrets to version control.

---

## Running the Project

1. **Install dependencies**

```bash
npm install
```

2. **Set environment variables**

Create `.env.local` in the project root with your `MONGODB_URI` and `TOKEN_SECRET`.

3. **Run dev server**

```bash
npm run dev
```

4. Open the app in the browser (default `http://localhost:3000`).

---

## Notes and Possible Improvements

- Add **server‑side route protection** for pages like `profile` using middleware or server components.
- Implement **email verification** using the `verifyToken` and `verifyTokenExpiry` fields in `userModel`.
- Implement **password reset flow** using `forgotPasswordToken` and `forgotPasswordTokenExpiry`.
- Consider enabling **`secure`** flag on cookies in production (HTTPS only).

This README should give you a clear picture of how the project is structured, how it was created, and how the authentication/security flow works end to end.
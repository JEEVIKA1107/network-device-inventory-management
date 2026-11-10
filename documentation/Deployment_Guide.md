# NetTrack DFA — Complete Cloud Deployment Guide (Render, Vercel & MongoDB Atlas)

> **Document Version:** 1.0.0  
> **Target Systems:** Render (Backend API), Vercel (Frontend React SPA), MongoDB Atlas (Cloud Database)  
> **GitHub Repository:** [https://github.com/JEEVIKA1107/network-device-inventory-management](https://github.com/JEEVIKA1107/network-device-inventory-management)

---

## 1. Production Architecture Overview

```
                      +------------------------------------------+
                      |         End User / IT Auditor            |
                      |   (Browser: Chrome, Firefox, Edge, Safari)|
                      +--------------------+---------------------+
                                           |
                                  HTTPS GET / POST
                                           |
                                           v
    +-----------------------------------------------------------------------------+
    |                             VERCEL EDGE CLOUD                               |
    |  - Hosted Single Page Application (React 18 + Vite)                         |
    |  - Static Assets CDN (HTML, CSS, JS, SVG Automata Diagrams)                 |
    |  - SPA Client-Side Routing Rewrites via vercel.json                         |
    |  - Environment: VITE_API_URL=https://nettrack-dfa-backend.onrender.com/api  |
    +--------------------------------------+--------------------------------------+
                                           |
                              REST API Calls (JSON / JWT)
                                           |
                                           v
    +-----------------------------------------------------------------------------+
    |                            RENDER CLUSTER                                   |
    |  - Web Service: Node.js 18+ & Express.js Engine                             |
    |  - Dual IPv4 Engine: Canonical Regex + Hopcroft Minimized DFA (O(n))        |
    |  - Subnet Scope Conflict Resolver & JWT RBAC Auth                           |
    |  - TCP Socket Reachability Probing Engine                                   |
    |  - Health Endpoint: /api/health                                             |
    +--------------------------------------+--------------------------------------+
                                           |
                             Mongoose Driver / TLS (27017)
                                           |
                                           v
    +-----------------------------------------------------------------------------+
    |                         MONGODB ATLAS (Cloud DB)                            |
    |  - Free M0 Shared Cluster (AWS/GCP/Azure)                                   |
    |  - Database: nettrack_dfa                                                   |
    |  - Collections: users, devices, networkscopes, networkconnections,          |
    |                 validationhistories, connectivityhistories, activitylogs    |
    |  - Network Whitelist: 0.0.0.0/0 (Allows Render dynamic cloud IPs)           |
    +-----------------------------------------------------------------------------+
```

---

## 2. Step 1: MongoDB Atlas Setup (Free Cloud Database)

### 2.1 Create Free M0 Cluster
1. Navigate to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign in (or create a free account).
2. Click **Create** to deploy a new database:
   - Select **M0 Free** (Shared).
   - Choose your preferred cloud provider and closest region (e.g., AWS / Mumbai `ap-south-1` or Singapore `ap-southeast-1`).
   - Cluster Name: `Cluster0` (default) or `NetTrackCluster`.
   - Click **Create Deployment**.

### 2.2 Configure Database Security & User
1. Under **Database Access** (left sidebar):
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: e.g., `nettrack_admin`.
   - Password: Choose a strong password (e.g., `NetTrackSecure2026!`). *Make sure to save this password!*
   - Database User Privileges: **Read and write to any database** (or Atlas Admin).
   - Click **Add User**.

### 2.3 Configure Network Whitelist
1. Under **Network Access** (left sidebar):
   - Click **Add IP Address**.
   - Click **Allow Access From Anywhere** (`0.0.0.0/0`).
   - *Note: This is required because Render cloud services use dynamic outgoing IP addresses.*
   - Click **Confirm**.

### 2.4 Obtain the Connection String
1. Return to the **Database** tab and click **Connect**.
2. Select **Drivers** (Node.js).
3. Copy the SRV connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=NetTrackCluster
   ```
4. Replace `<username>` and `<password>` with your credentials, and specify the database name `nettrack_dfa`:
   ```
   mongodb+srv://nettrack_admin:NetTrackSecure2026!@cluster0.xxxx.mongodb.net/nettrack_dfa?retryWrites=true&w=majority
   ```

### 2.5 Seed the Cloud Database with Demo Data
You can seed MongoDB Atlas directly from your local terminal:
```powershell
# In PowerShell:
$env:MONGODB_URI="mongodb+srv://nettrack_admin:NetTrackSecure2026!@cluster0.xxxx.mongodb.net/nettrack_dfa?retryWrites=true&w=majority"
npm run seed
```
This pre-populates:
- 3 User accounts (`admin@nettrack.edu`, `staff@nettrack.edu`, `viewer@nettrack.edu` with password `Password@123`)
- 2 Network scopes (`Campus Core Backbone` 192.168.1.0/24, `Computer Lab 1 Subnet` 10.0.1.0/24)
- 7 Network devices (Core Router, Switch, Web Server, Lab PCs, Wi-Fi AP, Laser Printer)
- 6 Inter-device topology connections
- 15 Validation audit traces

---

## 3. Step 2: Deploy Backend on Render

The repository includes a ready-to-use [`render.yaml`](../render.yaml) specification file.

### 3.1 Option A: One-Click Blueprint Deployment (Recommended)
1. Go to [dashboard.render.com](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New +** and select **Blueprint**.
3. Connect your repository: `JEEVIKA1107/network-device-inventory-management`.
4. Render will detect `render.yaml` and configure:
   - Service Name: `nettrack-dfa-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check: `/api/health`
5. Under Environment Variables:
   - Provide your `MONGODB_URI` from Step 1.4.
6. Click **Apply**.

### 3.2 Option B: Manual Web Service Setup
1. Go to [dashboard.render.com](https://dashboard.render.com/) -> **New +** -> **Web Service**.
2. Connect `JEEVIKA1107/network-device-inventory-management`.
3. Fill in the following fields:
   | Setting | Value |
   | :--- | :--- |
   | **Name** | `nettrack-dfa-backend` |
   | **Region** | Singapore or closest region |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free |

4. Scroll down to **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | `mongodb+srv://nettrack_admin:NetTrackSecure2026!@cluster0.xxxx.mongodb.net/nettrack_dfa?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `nettrack_dfa_super_secret_jwt_key_2026_academic_production` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CORS_ORIGIN` | `*` (Update with Vercel domain once frontend is deployed) |
   | `ENABLE_LIVE_NETWORK_CHECKS` | `true` |
   | `NETWORK_CHECK_TIMEOUT_MS` | `2000` |

5. Under **Advanced Settings**, set **Health Check Path** to `/api/health`.
6. Click **Deploy Web Service**.
7. In ~2 minutes, Render will output:
   `Your service is live at: https://nettrack-dfa-backend.onrender.com`

### 3.3 Verify Backend Deployment
Test the live health endpoint in terminal or browser:
```bash
curl -s https://nettrack-dfa-backend.onrender.com/api/health
```
Expected JSON Response:
```json
{
  "status": "online",
  "service": "NetTrack DFA API",
  "timestamp": "2026-11-10T05:30:00.000Z",
  "environment": "production"
}
```

---

## 4. Step 3: Deploy Frontend on Vercel

### 4.1 Import Repository in Vercel
1. Log in to [vercel.com](https://vercel.com/) with GitHub.
2. Click **Add New...** -> **Project**.
3. Locate `network-device-inventory-management` in your GitHub repository list and click **Import**.

### 4.2 Configure Build & Output Settings
1. **Framework Preset:** Vite
2. **Root Directory:** Click **Edit** and choose `frontend`.
3. **Build Command:** `npm run build` (default).
4. **Output Directory:** `dist` (default).
5. **Install Command:** `npm install` (default).

### 4.3 Configure Environment Variable
In the **Environment Variables** section, add:
| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://nettrack-dfa-backend.onrender.com/api` |

*(Note: The frontend code automatically normalizes the URL whether or not you include the trailing `/api`)*

### 4.4 Deploy
1. Click **Deploy**.
2. Vercel builds the React application in ~30 seconds.
3. Your live application will be available at:
   `https://network-device-inventory-management.vercel.app` (or similar custom sub-domain).

---

## 5. Step 4: Final CORS Origin Locking

Once your Vercel URL is generated (e.g. `https://network-device-inventory-management.vercel.app`):
1. Go back to Render Dashboard -> **nettrack-dfa-backend** -> **Environment**.
2. Change `CORS_ORIGIN` to:
   ```
   https://network-device-inventory-management.vercel.app
   ```
3. Click **Save Changes**. Render will automatically redeploy with the strict origin whitelist.

---

## 6. Step 5: Verification & End-to-End Testing

Once both services are deployed, perform the following verification workflow:

1. **Authentication:**
   - Open your Vercel URL in your browser.
   - You will see the NetTrack DFA login screen.
   - Enter `admin@nettrack.edu` and `Password@123`.
   - Verify redirect to `/dashboard` with session token stored in `localStorage`.

2. **Metrics & Charts:**
   - Confirm the 10 real-time MongoDB statistic cards display non-zero values.
   - Verify Category Distribution (Doughnut) and Reachability Status (Pie) render properly.

3. **IPv4 Automata Validation:**
   - Navigate to `/validator`.
   - Input `192.168.1.1` $\to$ Confirm Accepted (Green badge, canonical match).
   - Input `192.168.001.1` $\to$ Confirm Rejected (Disallowed leading zero).
   - Input `256.0.0.1` $\to$ Confirm Rejected (Exceeds maximum 255).

4. **DFA Interactive Simulator:**
   - Navigate to `/simulator`.
   - Enter `172.16.254.1`.
   - Click **Step Forward** to step through the tape. Observe active state highlighting and transition rule display $\delta(q, a)$.

5. **Device Inventory CRUD:**
   - Navigate to `/devices`.
   - Click **Add Device**.
   - Enter `Test-Switch-02`, category `Switch`, IP `192.168.1.25`, MAC `00:1A:2B:3C:4D:5E`.
   - Verify real-time dual-engine IPv4 validation and scope duplicate checking.
   - Save and verify the new entry in the inventory table.

6. **Network Topology Graph:**
   - Navigate to `/topology`.
   - Verify the hierarchical layout (Routers at top, Switches in middle, Workstations/Servers at bottom).
   - Test adding a connection between two devices.

7. **Audit & Report Export:**
   - Navigate to `/reports`.
   - Click **Export CSV** and verify the downloaded file contains the devices with their IP addresses, MACs, scopes, and statuses.

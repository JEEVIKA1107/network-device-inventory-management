# NetTrack DFA — REST API Documentation

Base Endpoint: `/api`

All authenticated endpoints require an HTTP header:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Registers a new user account.
- **Access:** Public
- **Request Body:** `{ name, email, password, role, department }`
- **Response (201):** `{ success: true, token, user }`

### `POST /api/auth/login`
Authenticates email and password.
- **Access:** Public
- **Request Body:** `{ email, password }`
- **Response (200):** `{ success: true, token, user }`

### `GET /api/auth/me`
Retrieves currently logged-in user profile.
- **Access:** Private (Bearer Token)
- **Response (200):** `{ success: true, user }`

---

## 2. Device Inventory Endpoints (`/api/devices`)

### `GET /api/devices`
Fetches paginated device inventory with search, multi-field filtering and sorting.
- **Query Params:** `search`, `deviceType`, `connectionStatus`, `department`, `laboratory`, `networkScopeId`, `sortBy`, `order`, `page`, `limit`
- **Response (200):** `{ success: true, count, total, totalPages, currentPage, devices }`

### `GET /api/devices/check-duplicate`
Checks whether an IP address is already registered within a given network scope.
- **Query Params:** `ip`, `scopeId`, `excludeDeviceId`
- **Response (200):** `{ success: true, isDuplicate: boolean, conflictingDevice, message }`

### `POST /api/devices`
Validates IPv4 format using DFA, checks for duplicate IP within scope, and registers new device.
- **Access:** Admin, Faculty / IT Staff
- **Request Body:** `{ deviceName, deviceType, ipAddress, macAddress, department, building, laboratory, location, manufacturer, model, networkScopeId, description }`
- **Response (201):** `{ success: true, message, device }`
- **Error (400):** Invalid IPv4 Address format with DFA diagnostics
- **Error (409):** Duplicate IP detected with conflicting device details

### `PUT /api/devices/:id`
Updates existing device record with format re-validation.
- **Access:** Admin, Faculty / IT Staff
- **Response (200):** `{ success: true, message, device }`

### `DELETE /api/devices/:id`
Deletes device and cascades deletion of its network topology connections.
- **Access:** Admin only
- **Response (200):** `{ success: true, message }`

---

## 3. IPv4 Validation & DFA Endpoints (`/api/validation`)

### `POST /api/validation/ipv4`
Executes dual-engine verification (Regex + DFA).
- **Request Body:** `{ ipAddress: "192.168.1.1" }`
- **Response (200):** `{ success: true, validation: { isValid, regexMatch, dfaAccepted, isEquivalent, errorReason, invalidOctet, finalState, totalSteps, timestamp } }`

### `POST /api/validation/dfa/simulate`
Executes step-by-step character-by-character DFA trace.
- **Request Body:** `{ ipAddress: "192.168.1.1" }`
- **Response (200):** `{ success: true, simulation: { isValid, trace: { startState, finalState, steps: [...] } } }`

### `GET /api/validation/dfa/metadata`
Returns formal 5-tuple, state map, alphabet, transition table, and Mermaid diagram.
- **Response (200):** `{ success: true, metadata }`

### `GET /api/validation/history`
Audit history of evaluated addresses.
- **Query Params:** `status`, `page`, `limit`
- **Response (200):** `{ success: true, count, total, history }`

---

## 4. Monitoring Endpoints (`/api/monitoring`)

### `GET /api/monitoring/status`
Returns network health statistics and recent socket probes.
- **Response (200):** `{ success: true, metrics: { totalDevices, onlineCount, offlineCount, unknownCount, healthPercentage, isCloudEnvironment }, recentChecks }`

### `POST /api/monitoring/check/:deviceId`
Triggers real-time TCP socket probe for a registered device.
- **Response (200):** `{ success: true, result: { deviceId, status, responseTime, lastCheckedAt } }`

### `POST /api/monitoring/check-all`
Batch probes all registered hosts.
- **Access:** Admin only
- **Response (200):** `{ success: true, message, results }`

---

## 5. Topology Endpoints (`/api/topology`)

### `GET /api/topology`
Returns graph nodes (devices) and edges (interconnections).
- **Response (200):** `{ success: true, nodes, edges, stats }`

### `POST /api/topology/connections`
Establishes network link between two devices.
- **Request Body:** `{ sourceDeviceId, targetDeviceId, connectionType, bandwidth, port }`
- **Response (201):** `{ success: true, connection }`

---

## 6. Reports Endpoints (`/api/reports`)

### `GET /api/reports/dashboard`
Aggregates 10 core metrics and chart distribution data from MongoDB.
- **Response (200):** `{ success: true, summary, charts, recentActivities, recentConnectivityLogs }`

### `GET /api/reports/analytics`
Departmental and laboratory breakdowns.
- **Response (200):** `{ success: true, departmentBreakdown, laboratoryBreakdown, typeBreakdown }`

### `GET /api/reports/export/devices`
Streams complete device inventory as a downloadable CSV spreadsheet.
- **Response (200):** `text/csv` stream attachment.

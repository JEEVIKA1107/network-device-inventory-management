# NetTrack DFA — Database Design

## 1. MongoDB Schema Specifications

### 1.1 Users Collection
Stores system user credentials, departmental affiliation and Role-Based Access Control (RBAC) levels.
- `_id`: ObjectId (Primary Key)
- `name`: String (Required, trimmed, max 100 chars)
- `email`: String (Required, unique, lowercase, regex validated)
- `passwordHash`: String (Bcrypt hashed with salt rounds = 10)
- `role`: String (Enum: `Admin`, `Faculty / IT Staff`, `Viewer`, default: `Viewer`)
- `department`: String (Default: 'Information Technology')
- `isActive`: Boolean (Default: true)
- `createdAt`, `updatedAt`: Date (Timestamps)

### 1.2 Devices Collection
Core network inventory records.
- `_id`: ObjectId (Primary Key)
- `deviceId`: String (Required, unique, uppercase, e.g. `DEV-ROU-001`)
- `deviceName`: String (Required, trimmed)
- `deviceType`: String (Enum: `Router`, `Switch`, `Computer`, `Server`, `Printer`, `Wireless Access Point`)
- `ipAddress`: String (Required, DFA validated)
- `macAddress`: String (Optional, uppercase hex format)
- `department`: String (Required)
- `building`: String (Required)
- `laboratory`: String (Required)
- `location`: String (e.g. 'Rack 1 - Slot 2')
- `manufacturer`: String
- `model`: String
- `networkScopeId`: ObjectId (Ref: `NetworkScope`)
- `connectionStatus`: String (Enum: `Online`, `Offline`, `Unknown`, default: `Unknown`)
- `lastCheckedAt`: Date
- `lastSeenAt`: Date
- `description`: String
- `createdAt`, `updatedAt`: Date (Timestamps)
- **Compound Index:** `{ ipAddress: 1, networkScopeId: 1 }` (Facilitates sub-millisecond duplicate IP conflict queries within managed network scopes).

### 1.3 NetworkScopes Collection
Defines CIDR network pools across campus departments and VLANs.
- `_id`: ObjectId (Primary Key)
- `name`: String (Required, unique)
- `cidr`: String (Required, e.g. `192.168.1.0/24`)
- `description`: String
- `isDefault`: Boolean
- `createdAt`, `updatedAt`: Date (Timestamps)

### 1.4 NetworkConnections Collection
Represents inter-device topology graph edges.
- `_id`: ObjectId (Primary Key)
- `sourceDeviceId`: ObjectId (Ref: `Device`, Required)
- `targetDeviceId`: ObjectId (Ref: `Device`, Required)
- `connectionType`: String (Enum: `Ethernet`, `Fiber`, `Wireless`, `Uplink`)
- `bandwidth`: String (e.g. `1 Gbps`, `10 Gbps`)
- `port`: String (e.g. `GigabitEthernet 1/0/24`)
- `createdAt`, `updatedAt`: Date (Timestamps)

### 1.5 ValidationHistory Collection
Audit log of all evaluated IPv4 strings.
- `_id`: ObjectId (Primary Key)
- `inputAddress`: String (Required)
- `isValid`: Boolean (Required)
- `regexMatch`: Boolean
- `dfaAccepted`: Boolean
- `errorMessage`: String
- `validationMethod`: String (Default: 'DFA and Regex Hybrid')
- `invalidOctet`: Number (1, 2, 3, or 4)
- `finalState`: String (e.g. `O4_1`, `TRAP_DEAD`)
- `totalSteps`: Number
- `validatedBy`: ObjectId (Ref: `User`)
- `createdAt`, `updatedAt`: Date (Timestamps)

### 1.6 ConnectivityHistory Collection
Telemetry logs from socket pings.
- `_id`: ObjectId (Primary Key)
- `deviceId`: ObjectId (Ref: `Device`, Required)
- `deviceIp`: String (Required)
- `status`: String (Enum: `Online`, `Offline`, `Unknown`)
- `responseTime`: Number (Latency in ms)
- `errorMessage`: String
- `checkedAt`: Date
- `checkedBy`: ObjectId (Ref: `User`)

### 1.7 ActivityLogs Collection
System-wide audit trail of administrator actions.
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (Ref: `User`)
- `userName`: String
- `userRole`: String
- `action`: String (e.g. `DEVICE_CREATE`, `DEVICE_DELETE`, `TOPOLOGY_CONNECT`)
- `description`: String
- `targetId`: String
- `timestamp`: Date

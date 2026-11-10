/**
 * NetTrack DFA - Safe Database Seed Script
 * Pre-populates:
 * 1. Demo User Accounts (Admin, Faculty/Staff, Viewer)
 * 2. Network Scopes
 * 3. Required Sample Devices (Router 01, Switch 01, Lab PCs, Server, Printer, Wi-Fi AP)
 * 4. Inter-device Network Topology Connections
 * 5. Sample Valid & Invalid Validation History
 * 6. Initial Activity Logs
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const NetworkScope = require('../models/NetworkScope');
const Device = require('../models/Device');
const NetworkConnection = require('../models/NetworkConnection');
const ValidationHistory = require('../models/ValidationHistory');
const ConnectivityHistory = require('../models/ConnectivityHistory');
const ActivityLog = require('../models/ActivityLog');
const { validateIPv4Address } = require('../automata/dfaEngine');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nettrack_dfa';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      NetworkScope.deleteMany({}),
      Device.deleteMany({}),
      NetworkConnection.deleteMany({}),
      ValidationHistory.deleteMany({}),
      ConnectivityHistory.deleteMany({}),
      ActivityLog.deleteMany({})
    ]);

    console.log('1. Creating demo user accounts...');
    const demoPassword = 'Password@123';
    const passwordHash = await User.hashPassword(demoPassword);

    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@nettrack.edu',
      passwordHash,
      role: 'Admin',
      department: 'Central IT Services'
    });

    const staffUser = await User.create({
      name: 'Prof. Ramesh Kumar',
      email: 'staff@nettrack.edu',
      passwordHash,
      role: 'Faculty / IT Staff',
      department: 'Computer Science & Engineering'
    });

    const viewerUser = await User.create({
      name: 'Lab Assistant (Guest)',
      email: 'viewer@nettrack.edu',
      passwordHash,
      role: 'Viewer',
      department: 'Information Technology'
    });

    console.log('2. Creating Network Scopes...');
    const campusScope = await NetworkScope.create({
      name: 'Campus Backbone Scope (192.168.1.0/24)',
      cidr: '192.168.1.0/24',
      description: 'Central IT core network for routing and server infrastructure',
      isDefault: true
    });

    const csLabScope = await NetworkScope.create({
      name: 'CSE Lab 2 VLAN (10.10.2.0/24)',
      cidr: '10.10.2.0/24',
      description: 'Student workstation pool in CSE Software Lab',
      isDefault: false
    });

    console.log('3. Registering required sample devices...');
    const sampleDevicesData = [
      {
        deviceId: 'DEV-ROU-001',
        deviceName: 'Router 01',
        deviceType: 'Router',
        ipAddress: '192.168.1.1',
        macAddress: '00:1A:2B:3C:4D:01',
        department: 'Central IT Services',
        building: 'Main Academic Block',
        laboratory: 'Server Room A',
        location: 'Rack 1 - Slot 1',
        manufacturer: 'Cisco',
        model: 'ISR 4331',
        connectionStatus: 'Online',
        networkScopeId: campusScope._id,
        description: 'Core Gateway Router for College Campus'
      },
      {
        deviceId: 'DEV-SWI-001',
        deviceName: 'Switch 01',
        deviceType: 'Switch',
        ipAddress: '192.168.1.2',
        macAddress: '00:1A:2B:3C:4D:02',
        department: 'Information Technology',
        building: 'Main Academic Block',
        laboratory: 'Network Distribution Room',
        location: 'Rack 1 - Slot 3',
        manufacturer: 'Cisco',
        model: 'Catalyst 3850 48-Port',
        connectionStatus: 'Online',
        networkScopeId: campusScope._id,
        description: 'Core Layer-3 Switch connecting labs'
      },
      {
        deviceId: 'DEV-PC-001',
        deviceName: 'Lab PC 01',
        deviceType: 'Computer',
        ipAddress: '192.168.1.10',
        macAddress: 'A4:BB:6D:11:22:01',
        department: 'Computer Science & Engineering',
        building: 'Tech Block 2',
        laboratory: 'FLAT & Networks Lab',
        location: 'Row 1 - Bench 1',
        manufacturer: 'Dell',
        model: 'OptiPlex 7090',
        connectionStatus: 'Online',
        networkScopeId: campusScope._id,
        description: 'Student Workstation for FLAT Lab Practicals'
      },
      {
        deviceId: 'DEV-PC-002',
        deviceName: 'Lab PC 02',
        deviceType: 'Computer',
        ipAddress: '192.168.1.11',
        macAddress: 'A4:BB:6D:11:22:02',
        department: 'Computer Science & Engineering',
        building: 'Tech Block 2',
        laboratory: 'FLAT & Networks Lab',
        location: 'Row 1 - Bench 2',
        manufacturer: 'Dell',
        model: 'OptiPlex 7090',
        connectionStatus: 'Offline',
        networkScopeId: campusScope._id,
        description: 'Student Workstation'
      },
      {
        deviceId: 'DEV-SRV-001',
        deviceName: 'Lab Server',
        deviceType: 'Server',
        ipAddress: '192.168.1.20',
        macAddress: '00:25:90:88:99:A1',
        department: 'Information Technology',
        building: 'Main Academic Block',
        laboratory: 'Data Center',
        location: 'Rack 2 - U10',
        manufacturer: 'HP Enterprise',
        model: 'ProLiant DL380 Gen10',
        connectionStatus: 'Online',
        networkScopeId: campusScope._id,
        description: 'MERN Stack & Linux Evaluation Server'
      },
      {
        deviceId: 'DEV-PRN-001',
        deviceName: 'Network Printer',
        deviceType: 'Printer',
        ipAddress: '192.168.1.30',
        macAddress: '3C:52:82:11:00:55',
        department: 'Information Technology',
        building: 'Main Academic Block',
        laboratory: 'Staff Lounge',
        location: 'Desk A',
        manufacturer: 'HP',
        model: 'LaserJet Pro M404dn',
        connectionStatus: 'Online',
        networkScopeId: campusScope._id,
        description: 'High-speed Departmental Laser Printer'
      },
      {
        deviceId: 'DEV-WAP-001',
        deviceName: 'Wi-Fi AP 01',
        deviceType: 'Wireless Access Point',
        ipAddress: '192.168.1.40',
        macAddress: 'E8:40:40:99:88:77',
        department: 'Campus Wi-Fi',
        building: 'Library Block',
        laboratory: 'Digital Library Wing',
        location: 'Ceiling Mount - Zone 1',
        manufacturer: 'Aruba Networks',
        model: 'AP-505 Wi-Fi 6',
        connectionStatus: 'Online',
        networkScopeId: campusScope._id,
        description: 'Gigabit 802.11ax Access Point'
      }
    ];

    const insertedDevices = await Device.insertMany(sampleDevicesData);
    const devMap = {};
    insertedDevices.forEach((d) => {
      devMap[d.deviceName] = d;
    });

    console.log('4. Creating Topology Interconnections...');
    // Router 01 -> Switch 01 (Uplink)
    // Switch 01 -> Lab PC 01, Lab PC 02, Lab Server, Printer, Wi-Fi AP 01
    await NetworkConnection.insertMany([
      {
        sourceDeviceId: devMap['Router 01']._id,
        targetDeviceId: devMap['Switch 01']._id,
        connectionType: 'Fiber',
        bandwidth: '10 Gbps',
        port: 'SFP+ 1/1'
      },
      {
        sourceDeviceId: devMap['Switch 01']._id,
        targetDeviceId: devMap['Lab PC 01']._id,
        connectionType: 'Ethernet',
        bandwidth: '1 Gbps',
        port: 'GigabitEthernet 1/0/1'
      },
      {
        sourceDeviceId: devMap['Switch 01']._id,
        targetDeviceId: devMap['Lab PC 02']._id,
        connectionType: 'Ethernet',
        bandwidth: '1 Gbps',
        port: 'GigabitEthernet 1/0/2'
      },
      {
        sourceDeviceId: devMap['Switch 01']._id,
        targetDeviceId: devMap['Lab Server']._id,
        connectionType: 'Ethernet',
        bandwidth: '10 Gbps',
        port: 'GigabitEthernet 1/0/24'
      },
      {
        sourceDeviceId: devMap['Switch 01']._id,
        targetDeviceId: devMap['Network Printer']._id,
        connectionType: 'Ethernet',
        bandwidth: '100 Mbps',
        port: 'FastEthernet 1/0/30'
      },
      {
        sourceDeviceId: devMap['Switch 01']._id,
        targetDeviceId: devMap['Wi-Fi AP 01']._id,
        connectionType: 'Wireless',
        bandwidth: '1.2 Gbps',
        port: 'PoE+ Port 1/0/48'
      }
    ]);

    console.log('5. Seeding Validation History (Valid and Invalid test cases)...');
    const testCases = [
      { ip: '192.168.1.1', desc: 'Valid Gateway IP' },
      { ip: '10.0.0.1', desc: 'Valid Class A Private IP' },
      { ip: '172.16.0.10', desc: 'Valid Class B Private IP' },
      { ip: '255.255.255.255', desc: 'Valid Broadcast IP' },
      { ip: '0.0.0.0', desc: 'Valid Default Route' },
      { ip: '8.8.8.8', desc: 'Valid Public DNS' },
      { ip: '256.168.1.1', desc: 'Octet 1 > 255' },
      { ip: '192.168.1.300', desc: 'Octet 4 > 255' },
      { ip: '192.168.1', desc: 'Fewer than 4 octets' },
      { ip: '192.168.1.1.1', desc: '5 octets' },
      { ip: '192.168..1', desc: 'Empty octet' },
      { ip: '192.168.1.abc', desc: 'Non-numeric octet' },
      { ip: '192.168.001.1', desc: 'Disallowed leading zero' },
      { ip: '-192.168.1.1', desc: 'Negative value' },
      { ip: '999.999.999.999', desc: 'All octets exceed 255' }
    ];

    for (const item of testCases) {
      const res = validateIPv4Address(item.ip);
      await ValidationHistory.create({
        inputAddress: item.ip,
        isValid: res.isValid,
        regexMatch: res.regexMatch,
        dfaAccepted: res.dfaAccepted,
        errorMessage: res.errorReason,
        validationMethod: 'DFA and Regex Hybrid',
        invalidOctet: res.invalidOctet,
        finalState: res.finalState,
        totalSteps: res.totalSteps,
        validatedBy: adminUser._id
      });
    }

    console.log('6. Seeding initial Connectivity Logs and Activity...');
    for (const d of insertedDevices) {
      await ConnectivityHistory.create({
        deviceId: d._id,
        deviceIp: d.ipAddress,
        status: d.connectionStatus,
        responseTime: d.connectionStatus === 'Online' ? Math.floor(1 + Math.random() * 15) : 0,
        errorMessage: d.connectionStatus === 'Offline' ? 'Connection timed out' : null,
        checkedAt: new Date(),
        checkedBy: adminUser._id
      });
    }

    await ActivityLog.create({
      userId: adminUser._id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'SYSTEM_SEED',
      description: 'Seeded initial academic demo inventory, users, network scopes and validation traces',
      targetId: 'INIT'
    });

    console.log('================================================================');
    console.log('DATABASE SEEDED SUCCESSFULLY!');
    console.log('----------------------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('  Admin User  : admin@nettrack.edu  / Password@123');
    console.log('  Staff User  : staff@nettrack.edu  / Password@123');
    console.log('  Viewer User : viewer@nettrack.edu / Password@123');
    console.log('Total Devices Seeded: ' + insertedDevices.length);
    console.log('Validation Test Cases: ' + testCases.length);
    console.log('================================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();

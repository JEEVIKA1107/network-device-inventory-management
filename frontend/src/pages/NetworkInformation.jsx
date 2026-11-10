import React, { useState } from 'react';
import {
  Globe,
  ShieldCheck,
  Layers,
  HelpCircle,
  Network,
  CheckCircle,
  AlertCircle,
  Search,
  BookOpen
} from 'lucide-react';
import { CANONICAL_IPV4_REGEX } from '../api/axiosClient';

export default function NetworkInformation() {
  const [testIp, setTestIp] = useState('192.168.1.1');

  // Classification logic helper
  const classifyIP = (ip) => {
    const trimmed = ip.trim();
    const regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;

    if (!regex.test(trimmed)) {
      return {
        isValid: false,
        classification: 'Invalid IPv4 Format',
        scope: 'None',
        description: 'Input does not conform to the canonical 4-octet IPv4 syntax (0-255 per octet, no leading zeros).'
      };
    }

    const [o1, o2, o3, o4] = trimmed.split('.').map(Number);

    // Loopback
    if (o1 === 127) {
      return {
        isValid: true,
        classification: 'Loopback / Host-Local',
        scope: '127.0.0.0/8',
        rfc: 'RFC 1122',
        isPrivate: true,
        description: 'Used for host internal communication and software testing. Packets do not leave the host NIC.'
      };
    }

    // Default route / This host
    if (o1 === 0 && o2 === 0 && o3 === 0 && o4 === 0) {
      return {
        isValid: true,
        classification: 'Default Route / Current Network',
        scope: '0.0.0.0/8',
        rfc: 'RFC 1122',
        isPrivate: false,
        description: 'Represents an unassigned or default route in routing tables and DHCP negotiation.'
      };
    }

    // Broadcast
    if (o1 === 255 && o2 === 255 && o3 === 255 && o4 === 255) {
      return {
        isValid: true,
        classification: 'Limited Broadcast',
        scope: '255.255.255.255/32',
        rfc: 'RFC 919',
        isPrivate: false,
        description: 'Broadcast address to all devices on the local physical network segment.'
      };
    }

    // Class A Private: 10.0.0.0/8
    if (o1 === 10) {
      return {
        isValid: true,
        classification: 'Private IPv4 (Class A)',
        scope: '10.0.0.0/8 (10.0.0.0 - 10.255.255.255)',
        rfc: 'RFC 1918',
        isPrivate: true,
        description: 'Large enterprise private network pool. 16,777,216 host addresses.'
      };
    }

    // Class B Private: 172.16.0.0/12
    if (o1 === 172 && o2 >= 16 && o2 <= 31) {
      return {
        isValid: true,
        classification: 'Private IPv4 (Class B)',
        scope: '172.16.0.0/12 (172.16.0.0 - 172.31.255.255)',
        rfc: 'RFC 1918',
        isPrivate: true,
        description: 'Medium-sized organization private network pool. 1,048,576 host addresses.'
      };
    }

    // Class C Private: 192.168.0.0/16
    if (o1 === 192 && o2 === 168) {
      return {
        isValid: true,
        classification: 'Private IPv4 (Class C)',
        scope: '192.168.0.0/16 (192.168.0.0 - 192.168.255.255)',
        rfc: 'RFC 1918',
        isPrivate: true,
        description: 'Standard LAN / Departmental subnet pool. 65,536 host addresses.'
      };
    }

    // Link-Local (APIPA): 169.254.0.0/16
    if (o1 === 169 && o2 === 254) {
      return {
        isValid: true,
        classification: 'Link-Local (APIPA)',
        scope: '169.254.0.0/16',
        rfc: 'RFC 3927',
        isPrivate: true,
        description: 'Automatically configured when DHCP server is unreachable. Non-routable.'
      };
    }

    // Multicast (Class D): 224.0.0.0 - 239.255.255.255
    if (o1 >= 224 && o1 <= 239) {
      return {
        isValid: true,
        classification: 'Multicast (Class D)',
        scope: '224.0.0.0/4',
        rfc: 'RFC 5771',
        isPrivate: false,
        description: 'Reserved for one-to-many communication groups (e.g. OSPF, RIPv2, audio streaming).'
      };
    }

    // Reserved (Class E): 240.0.0.0 - 254.255.255.255
    if (o1 >= 240 && o1 <= 254) {
      return {
        isValid: true,
        classification: 'Reserved / Experimental (Class E)',
        scope: '240.0.0.0/4',
        rfc: 'RFC 1112',
        isPrivate: false,
        description: 'Reserved for experimental usage and future research.'
      };
    }

    // Standard Globally Routable Public Address
    return {
      isValid: true,
      classification: 'Globally Routable Public Host Address',
      scope: 'Public Internet Addressing Pool',
      rfc: 'IANA Global Unicast',
      isPrivate: false,
      description: 'Globally unique IPv4 address directly routable across the public Internet backbone.'
    };
  };

  const currentClass = classifyIP(testIp);

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
          Computer Networks — IPv4 Architecture &amp; Classification
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Academic curriculum reference (22ITT52 Unit 1 &amp; Unit 3): 32-bit addressing, octet structure, RFC 1918 allocations and subnetting
        </p>
      </div>

      {/* Interactive Classification Card */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#142D4E', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={18} color="#2563EB" />
          <span>Interactive IPv4 Range Classifier</span>
        </h3>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            value={testIp}
            onChange={(e) => setTestIp(e.target.value)}
            placeholder="Type any IPv4 (e.g. 10.0.0.1, 172.16.1.1, 8.8.8.8, 127.0.0.1)"
            className="form-input mono"
            style={{ fontSize: '1.05rem', padding: '10px 14px' }}
          />
        </div>

        {/* Dynamic Classification Output */}
        <div
          style={{
            background: currentClass.isValid ? '#F8FAFC' : '#FEF2F2',
            border: `1px solid ${currentClass.isValid ? '#E2E8F0' : '#FECACA'}`,
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {currentClass.isValid ? (
                <CheckCircle size={20} color={currentClass.isPrivate ? '#2563EB' : '#16A34A'} />
              ) : (
                <AlertCircle size={20} color="#DC2626" />
              )}
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#142D4E' }}>
                {currentClass.classification}
              </span>
            </div>
            {currentClass.isValid && (
              <span className={`badge ${currentClass.isPrivate ? 'badge-info' : 'badge-success'}`}>
                {currentClass.isPrivate ? 'Private Range' : 'Public Range'}
              </span>
            )}
          </div>

          <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
            {currentClass.description}
          </div>

          {currentClass.scope && currentClass.scope !== 'None' && (
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
              Allocated Block: <strong className="mono">{currentClass.scope}</strong> • Standard: <strong>{currentClass.rfc}</strong>
            </div>
          )}
        </div>
      </div>

      {/* RFC 1918 Private Address Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <ShieldCheck size={18} color="#2563EB" />
            <span>RFC 1918 — Private IPv4 Address Allocations</span>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>CIDR Prefix</th>
                <th>Starting IP</th>
                <th>Ending IP</th>
                <th>Total Usable Hosts</th>
                <th>Typical Campus Deployment</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Class A</strong></td>
                <td><span className="mono badge badge-info">10.0.0.0/8</span></td>
                <td><span className="mono">10.0.0.0</span></td>
                <td><span className="mono">10.255.255.255</span></td>
                <td>16,777,214 hosts</td>
                <td>University Backbone, Multi-campus WAN</td>
              </tr>
              <tr>
                <td><strong>Class B</strong></td>
                <td><span className="mono badge badge-info">172.16.0.0/12</span></td>
                <td><span className="mono">172.16.0.0</span></td>
                <td><span className="mono">172.31.255.255</span></td>
                <td>1,048,574 hosts</td>
                <td>Departmental VLANs &amp; Labs</td>
              </tr>
              <tr>
                <td><strong>Class C</strong></td>
                <td><span className="mono badge badge-info">192.168.0.0/16</span></td>
                <td><span className="mono">192.168.0.0</span></td>
                <td><span className="mono">192.168.255.255</span></td>
                <td>65,534 hosts</td>
                <td>Classroom LAN, Wi-Fi AP subnets</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* IPv4 Architecture Fundamentals Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#142D4E', marginBottom: '10px' }}>
            1. 32-Bit Decimal Structure
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
            An IPv4 address consists of 32 binary bits divided into four 8-bit fields known as <strong>octets</strong>. Each octet is represented in human-readable base-10 decimal format (0 to 255) separated by period delimiters (e.g. <code>192.168.1.1</code>).
          </p>
        </div>

        <div className="card">
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#142D4E', marginBottom: '10px' }}>
            2. Network vs. Host Portions
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
            Every IP address is divided into a <strong>Network ID</strong> and a <strong>Host ID</strong> determined by the subnet mask. In Classless Inter-Domain Routing (CIDR), prefix length notation (e.g. <code>/24</code>) defines the continuous binary 1s of the mask.
          </p>
        </div>

        <div className="card">
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#142D4E', marginBottom: '10px' }}>
            3. Reserved Non-Host Addresses
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
            Within every subnet:
            <br />• <strong>Network Address:</strong> All host bits = 0 (identifies subnet).
            <br />• <strong>Directed Broadcast:</strong> All host bits = 1 (broadcasts to subnet).
            <br />Neither address can be assigned to an active host device.
          </p>
        </div>
      </div>
    </div>
  );
}

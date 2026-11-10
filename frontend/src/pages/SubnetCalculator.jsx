import React, { useState } from 'react';
import {
  Calculator,
  Network,
  Cpu,
  Layers,
  CheckCircle,
  HelpCircle,
  Hash,
  ArrowRight
} from 'lucide-react';

export default function SubnetCalculator() {
  const [ipInput, setIpInput] = useState('192.168.1.10');
  const [cidrPrefix, setCidrPrefix] = useState(24);

  // Helper to convert IP to 32-bit unsigned integer
  const ipToInt = (ip) => {
    return (
      ip
        .split('.')
        .reduce((acc, oct) => ((acc << 8) + parseInt(oct, 10)) >>> 0, 0) >>> 0
    );
  };

  // Helper to convert 32-bit integer back to dotted decimal string
  const intToIp = (int) => {
    return [
      (int >>> 24) & 255,
      (int >>> 16) & 255,
      (int >>> 8) & 255,
      int & 255
    ].join('.');
  };

  // Helper to convert integer to binary string
  const intToBinary = (int) => {
    return (int >>> 0).toString(2).padStart(32, '0');
  };

  const calculateSubnet = () => {
    const regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;
    if (!regex.test(ipInput.trim())) {
      return null;
    }

    const ipNum = ipToInt(ipInput.trim());
    const maskNum = cidrPrefix === 0 ? 0 : (~0 << (32 - cidrPrefix)) >>> 0;
    const wildcardNum = ~maskNum >>> 0;

    const networkNum = (ipNum & maskNum) >>> 0;
    const broadcastNum = (networkNum | wildcardNum) >>> 0;

    const totalHosts = Math.pow(2, 32 - cidrPrefix);
    const usableHosts = cidrPrefix >= 31 ? (cidrPrefix === 31 ? 2 : 1) : Math.max(0, totalHosts - 2);

    let firstUsable = 'N/A';
    let lastUsable = 'N/A';

    if (cidrPrefix === 32) {
      firstUsable = intToIp(networkNum);
      lastUsable = intToIp(networkNum);
    } else if (cidrPrefix === 31) {
      firstUsable = intToIp(networkNum);
      lastUsable = intToIp(broadcastNum);
    } else {
      firstUsable = intToIp(networkNum + 1);
      lastUsable = intToIp(broadcastNum - 1);
    }

    const binaryIp = intToBinary(ipNum);
    const binaryMask = intToBinary(maskNum);

    return {
      ip: ipInput.trim(),
      cidr: cidrPrefix,
      subnetMask: intToIp(maskNum),
      wildcardMask: intToIp(wildcardNum),
      networkAddress: intToIp(networkNum),
      broadcastAddress: intToIp(broadcastNum),
      firstUsable,
      lastUsable,
      totalHosts,
      usableHosts,
      binaryIp,
      binaryMask
    };
  };

  const subnet = calculateSubnet();

  const presets = [
    { label: '/24 Class C LAN (254 Hosts)', cidr: 24 },
    { label: '/26 Subnet (62 Hosts)', cidr: 26 },
    { label: '/28 Subnet (14 Hosts)', cidr: 28 },
    { label: '/30 Point-to-Point Uplink (2 Hosts)', cidr: 30 },
    { label: '/16 Enterprise VLAN (65,534 Hosts)', cidr: 16 }
  ];

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
          CIDR Subnet Calculator
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Compute network boundaries, broadcast IDs, wildcard masks and usable host address blocks
        </p>
      </div>

      {/* Inputs Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Host or Network IPv4 Address:</label>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="e.g. 192.168.1.10"
              className="form-input mono"
              style={{ fontSize: '1.05rem', padding: '10px 14px' }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Subnet Mask / Prefix Length:</label>
            <select
              value={cidrPrefix}
              onChange={(e) => setCidrPrefix(Number(e.target.value))}
              className="form-select mono"
              style={{ fontSize: '1.05rem', padding: '10px 14px' }}
            >
              {Array.from({ length: 33 }, (_, i) => i).map((prefix) => (
                <option key={prefix} value={prefix}>
                  /{prefix} — {prefix === 0 ? '0.0.0.0' : intToIp((~0 << (32 - prefix)) >>> 0)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, alignSelf: 'center' }}>Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setCidrPrefix(p.cidr)}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Display */}
      {subnet ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Subnet Parameters Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ borderLeft: '4px solid #2563EB' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Network Address</div>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#142D4E', marginTop: '6px' }}>
                {subnet.networkAddress}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#2563EB', marginTop: '4px' }}>Subnet Identification</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #DC2626' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Broadcast Address</div>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#DC2626', marginTop: '6px' }}>
                {subnet.broadcastAddress}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#991B1B', marginTop: '4px' }}>Subnet Directed Broadcast</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Usable Host Pool</div>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981', marginTop: '6px' }}>
                {subnet.usableHosts.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '4px' }}>Assignable IP addresses</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #8B5CF6' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Subnet Mask</div>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8B5CF6', marginTop: '6px' }}>
                {subnet.subnetMask}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6D28D9', marginTop: '4px' }}>/{subnet.cidr} CIDR Prefix</div>
            </div>
          </div>

          {/* Detailed Range Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Addressing Boundary Details</div>
              <span className="mono badge badge-info">{subnet.networkAddress}/{subnet.cidr}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Usable Host Range</span>
                <span className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', display: 'block', marginTop: '4px' }}>
                  {subnet.firstUsable} <span style={{ color: '#2563EB' }}>—</span> {subnet.lastUsable}
                </span>
              </div>

              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Wildcard Mask (ACL Inverse)</span>
                <span className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', display: 'block', marginTop: '4px' }}>
                  {subnet.wildcardMask}
                </span>
              </div>

              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Total Allocated Addresses</span>
                <span className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', display: 'block', marginTop: '4px' }}>
                  {subnet.totalHosts.toLocaleString()} Addresses
                </span>
              </div>
            </div>
          </div>

          {/* 32-Bit Binary Decomposition */}
          <div className="card" style={{ background: '#0F172A', color: '#FFFFFF', border: 'none' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', marginBottom: '14px' }}>
              32-Bit Binary Octet Decomposition
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px' }}>IP Address Binary (32 bits):</div>
                <div className="mono" style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}>
                  <span style={{ color: '#60A5FA' }}>{subnet.binaryIp.slice(0, subnet.cidr)}</span>
                  <span style={{ color: '#4ADE80' }}>{subnet.binaryIp.slice(subnet.cidr)}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px' }}>Subnet Mask Binary (32 bits):</div>
                <div className="mono" style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}>
                  <span style={{ color: '#60A5FA' }}>{subnet.binaryMask.slice(0, subnet.cidr)}</span>
                  <span style={{ color: '#4ADE80' }}>{subnet.binaryMask.slice(subnet.cidr)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#60A5FA', borderRadius: '2px' }} />
                  <span style={{ color: '#93C5FD' }}>Network Bits ({subnet.cidr})</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#4ADE80', borderRadius: '2px' }} />
                  <span style={{ color: '#86EFAC' }}>Host Bits ({32 - subnet.cidr})</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '36px', color: '#DC2626' }}>
          Please enter a valid canonical IPv4 address to calculate subnet parameters.
        </div>
      )}
    </div>
  );
}

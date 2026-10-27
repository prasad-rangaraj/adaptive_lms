"""
Comprehensive Computer Networks & Protocols Knowledge Base
Source: NETWORKS & PROTOCOLS - A Detailed 20-Page Study Guide
Covering 20 Core Chapters from Fundamentals to Advanced Design.
"""

CHAPTERS = [
    {
        "chapter": 1,
        "title": "Introduction to Computer Networks",
        "keywords": ["network", "fundamentals", "devices", "media", "components", "copper", "fiber", "switch", "router", "packets"],
        "content": """Chapter 1: Introduction to Computer Networks
Core concept: A computer network is a collection of connected devices that exchange data using agreed rules. Devices may include laptops, phones, servers, sensors, printers, switches, routers and industrial controllers. A connection can use copper cable, optical fibre, radio waves or a combination of media. The important point is not simply that devices are connected: they must share addressing rules, message formats and procedures so that data sent by one system can be interpreted by another.
Why networks matter: Networks enable resource sharing, communication, distributed applications, cloud services, remote monitoring and collaborative work. Office networks emphasize cost and convenience, while industrial networks prioritize predictable timing, availability and resistance to harsh conditions.
Basic components: End devices create or consume information. Network interface cards (NICs) connect devices to a medium. Switches forward frames within a local network. Routers forward packets between IP networks. Access points connect wireless clients. Firewalls enforce traffic policies. Servers provide services such as web pages, name resolution, file storage and authentication.
Simple example: When opening a website, the device needs a physical/wireless connection, an IP configuration, and the server's IP address. Packets travel through routers to the server, and the response is reconstructed by the browser across cooperating protocols."""
    },
    {
        "chapter": 2,
        "title": "Network Types and Topologies",
        "keywords": ["topology", "topologies", "pan", "lan", "wlan", "man", "wan", "internet", "star", "bus", "ring", "mesh"],
        "content": """Chapter 2: Network Types and Topologies
Network Scopes:
- PAN (Personal Area Network): Connects devices around one person, often via Bluetooth.
- LAN (Local Area Network): Covers a room, building or campus.
- WLAN (Wireless LAN): Provides LAN access over Wi-Fi (IEEE 802.11).
- MAN (Metropolitan Area Network): Spans a city or large urban area.
- WAN (Wide Area Network): Links distant geographic locations.
- Internet: A global interconnection of independently operated networks.
Common Topologies:
- Star Topology: Endpoints connect to a central switch or access point; easy to isolate faults, but the central node is a single point of failure.
- Bus Topology: Shares one backbone cable; vulnerable to backbone breaks and collisions in legacy designs.
- Ring Topology: Connects nodes in a loop; resilience depends on token-passing or ring protection protocols.
- Mesh Topology: Multiple redundant paths between nodes; provides high fault tolerance at increased cost and complexity.
Physical vs Logical Topology: Physical topology describes actual cables and physical layout. Logical topology describes the path data travels (e.g. physical star with logical bus/point-to-point flows). Leaf-spine architectures are common in data centers for predictable latency."""
    },
    {
        "chapter": 3,
        "title": "Network Devices and Their Roles",
        "keywords": ["devices", "nic", "modem", "hub", "switch", "router", "gateway", "firewall", "access point", "ap"],
        "content": """Chapter 3: Network Devices and Their Roles
Device Functions:
- NIC (Network Interface Controller): Hardware providing wired or wireless connectivity with a unique link-layer MAC address.
- Hubs vs Switches: Hubs repeat incoming electrical bits to all ports (Layer 1, shared collision domain, obsolete). Switches operate at Layer 2, inspect incoming source MAC addresses to learn port mappings, and forward frames only to the designated destination port (micro-segmentation).
- Routers and Gateways: Routers operate at Layer 3, connecting separate IP networks and making forwarding decisions using IP routing tables. The default gateway is the local router used when destinations lie outside the local subnet.
- Firewalls: Inspect packets to permit or deny traffic based on stateful inspection, IP addresses, ports, protocol rules, and application signatures.
- Wireless Access Points (APs): Bridge 802.11 radio frames into 802.3 Ethernet wired frames.
Operational Practice: Maintain port labeling, VLAN documentation, interface mapping, configuration backups, and monitor interface error counters (CRC, drops)."""
    },
    {
        "chapter": 4,
        "title": "The OSI Reference Model",
        "keywords": ["osi", "osi model", "7 layers", "physical", "data link", "network", "transport", "session", "presentation", "application"],
        "content": """Chapter 4: The OSI Reference Model (7 Layers)
The Open Systems Interconnection model divides communication into seven conceptual layers:
1. Physical (Layer 1): Transmits raw bits over cables, optical fibers, or radio frequencies (signaling, voltages, connectors).
2. Data Link (Layer 2): Packages bits into frames, handles physical MAC addressing, media access control (CSMA/CD, CSMA/CA), and error detection (CRC).
3. Network (Layer 3): Logical addressing (IPv4, IPv6) and path determination (routing). Units: Packets.
4. Transport (Layer 4): End-to-end communication, reliability, flow control, and port multiplexing (TCP, UDP). Units: Segments/Datagrams.
5. Session (Layer 5): Establishes, manages, and terminates presentation sessions and dialog control.
6. Presentation (Layer 6): Data representation, translation, encryption (TLS), and compression (ASCII, UTF-8, JSON).
7. Application (Layer 7): Network services provided directly to end-user applications (HTTP, DNS, SSH, SMTP).
Encapsulation: Data flows downward on the sender, adding headers at each layer (Data -> Segment -> Packet -> Frame -> Bits). De-encapsulation occurs in reverse on the receiver.
Troubleshooting by Layer: Physical (check link lights/cables) -> Data Link (check MAC tables/VLANs) -> Network (ping gateway/IP) -> Transport/App (check DNS, port reachability, TLS certificates)."""
    },
    {
        "chapter": 5,
        "title": "TCP/IP Model and Encapsulation",
        "keywords": ["tcp/ip", "encapsulation", "tcp/ip model", "mac vs ip", "ports", "best-effort", "datagram"],
        "content": """Chapter 5: TCP/IP Model and Encapsulation
The TCP/IP model organizes internet communications into four layers:
1. Link Layer: Local delivery over physical media (Ethernet, Wi-Fi, ARP).
2. Internet Layer: Best-effort packet delivery across networks using IP (IPv4, IPv6, ICMP). Routers inspect destination IP prefixes to route packets without delivery guarantees.
3. Transport Layer: Manages host-to-host communication. TCP provides reliable, ordered byte streams with congestion/flow control; UDP provides fast, lightweight datagram delivery; QUIC provides encrypted multiplexed streams over UDP.
4. Application Layer: High-level protocols (HTTP, DNS, SSH, SMTP, MQTT).
Critical Address Distinction:
- MAC Address (Layer 2): Local-link hop-to-hop delivery. Changes at every router hop!
- IP Address (Layer 3): End-to-end logical identification. Stays constant across router hops (unless NAT is used).
- Port Number (Layer 4): Identifies the specific application/process running on the host (e.g. Port 80/443 for HTTP/HTTPS, Port 53 for DNS)."""
    },
    {
        "chapter": 6,
        "title": "Ethernet, MAC Addresses and Switching",
        "keywords": ["ethernet", "mac address", "switching", "switch", "vlan", "broadcast domain", "frame", "802.3", "spanning tree"],
        "content": """Chapter 6: Ethernet, MAC Addresses and Switching
Ethernet (IEEE 802.3):
Frame Fields: Preamble (synchronization), Destination MAC (6 bytes), Source MAC (6 bytes), Optional 802.1Q VLAN Tag (4 bytes), EtherType/Length (2 bytes, e.g. 0x0800 for IPv4), Payload (46-1500 bytes), Frame Check Sequence (FCS / 32-bit CRC).
MAC Address Learning:
Switches dynamically inspect the Source MAC of incoming frames and record it in the MAC Address Table (CAM table) with the ingress port and VLAN. When a destination MAC is known, it unicasts out that port. If destination MAC is unknown, broadcast (FF:FF:FF:FF:FF:FF), or multicast, it floods the frame to all other ports in that VLAN. Entries age out (typically 300 seconds).
VLANs and Broadcast Domains:
A VLAN partitions a switch into separate logical Layer 2 broadcast domains. Devices in different VLANs cannot communicate without a Layer 3 router (Inter-VLAN routing / Router-on-a-stick).
Spanning Tree Protocol (STP / IEEE 802.1D / Rapid STP 802.1w): Prevents bridge loops and broadcast storms on redundant physical links by putting backup ports in blocking state."""
    },
    {
        "chapter": 7,
        "title": "IP Addressing: IPv4 and Subnetting",
        "keywords": ["ipv4", "subnetting", "subnet", "cidr", "ip address", "private ip", "nat", "mask", "broadcast", "usable hosts"],
        "content": """Chapter 7: IP Addressing: IPv4 and Subnetting
IPv4 Structure: 32 bits divided into 4 octets separated by dots (e.g. 192.168.10.25).
CIDR Notation: Specifies prefix length (e.g., /24 = 24 network bits, 8 host bits).
Subnet Math:
- Total IP addresses in subnet: 2^(32 - prefix)
- Usable host addresses: 2^(32 - prefix) - 2 (subtracting Network Address where host bits are all 0s, and Broadcast Address where host bits are all 1s).
Quick Reference Table:
- /24: 256 total, 254 usable (Mask: 255.255.255.0)
- /25: 128 total, 126 usable (Mask: 255.255.255.128)
- /26: 64 total, 62 usable (Mask: 255.255.255.192)
- /27: 32 total, 30 usable (Mask: 255.255.255.224)
- /28: 16 total, 14 usable (Mask: 255.255.255.240)
- /30: 4 total, 2 usable (Point-to-point router links)
Private RFC 1918 Address Ranges:
- 10.0.0.0/8 (10.0.0.0 to 10.255.255.255)
- 172.16.0.0/12 (172.16.0.0 to 172.31.255.255)
- 192.168.0.0/16 (192.168.0.0 to 192.168.255.255)
Private IPs cannot be routed on the public Internet; Network Address Translation (NAT) maps them to public IPv4 addresses."""
    },
    {
        "chapter": 8,
        "title": "IPv6 Addressing and Transition",
        "keywords": ["ipv6", "slaac", "ndp", "dual stack", "tunneling", "link-local", "multicast", "128-bit"],
        "content": """Chapter 8: IPv6 Addressing and Transition
IPv6 Fundamentals: 128 bits represented in 8 groups of 4 hexadecimal digits separated by colons (e.g., 2001:0db8:85a3:0000:0000:8a2e:0370:7334).
Abbreviation Rules:
1. Omit leading zeros in any group (0025 -> 25).
2. Replace one contiguous run of zero groups with double colon '::' once per address (e.g., 2001:db8::25).
Address Scopes:
- Global Unicast (2000::/3): Publicly routable worldwide.
- Link-Local (fe80::/10): Mandatory on all IPv6 interfaces for local subnet communication and neighbor discovery.
- Unique Local (fc00::/7): Private corporate addresses.
- Multicast (ff00::/8): Replaces all IPv4 broadcasts; IPv6 does NOT have broadcast!
Configuration & NDP:
- SLAAC (Stateless Address Autoconfiguration): Host configures its own address using Router Advertisements (RA).
- NDP (Neighbor Discovery Protocol): Uses ICMPv6 Neighbor Solicitation (NS) and Neighbor Advertisement (NA) instead of ARP.
Transition Mechanisms: Dual Stack (running IPv4 and IPv6 side by side), Tunneling (6to4, 4in6, GRE), Translation (NAT64/DNS64)."""
    },
    {
        "chapter": 9,
        "title": "TCP: Reliable Transport",
        "keywords": ["tcp", "three-way handshake", "syn", "ack", "flow control", "congestion control", "window", "retransmission", "sliding window"],
        "content": """Chapter 9: TCP: Reliable Transport
TCP (Transmission Control Protocol) provides connection-oriented, reliable, ordered byte-stream delivery.
Three-Way Handshake:
1. Client sends SYN (Synchronize sequence number X).
2. Server responds with SYN-ACK (Server sequence number Y, Acknowledges X+1).
3. Client replies with ACK (Acknowledges Y+1).
Connection Teardown: Uses 4-way FIN/ACK handshakes (FIN -> ACK -> FIN -> ACK).
Reliability Mechanisms:
- Sequence & Acknowledgment Numbers: Every byte is numbered. Receiver ACKs next expected byte.
- Retransmission Timers: If ACK is not received before Retransmission Timeout (RTO), packet is re-sent.
- Flow Control (Receive Window - rwnd): Receiver informs sender how much buffer space it has available to prevent sender from overwhelming the receiver buffer.
- Congestion Control (Congestion Window - cwnd): Protects the network from congestion collapse. Uses Slow Start (exponential cwnd increase), Congestion Avoidance (additive increase/multiplicative decrease - AIMD), Fast Retransmit, and Fast Recovery.
TCP vs UDP: TCP has high overhead, connection state, and guarantees order/delivery; UDP has minimal overhead and zero latency handshake, but no delivery guarantees."""
    },
    {
        "chapter": 10,
        "title": "UDP, QUIC and Real-Time Traffic",
        "keywords": ["udp", "quic", "http/3", "real-time", "jitter", "latency", "throughput", "bandwidth"],
        "content": """Chapter 10: UDP, QUIC and Real-Time Traffic
UDP (User Datagram Protocol): Connectionless, lightweight transport protocol. 8-byte header: Source Port, Destination Port, Length, Checksum. No handshake, no delivery guarantees, no reordering, and no flow/congestion control.
Where UDP Fits: Real-time audio/video streaming (VoIP, Zoom), online gaming, DNS queries, SNMP telemetry, and DHCP. In real-time media, late retransmitted packets are useless; timeliness beats completeness.
QUIC (Quick UDP Internet Connections):
A modern transport protocol operating over UDP (RFC 9000). Solves TCP head-of-line blocking by multiplexing multiple independent streams over a single connection. Integrates TLS 1.3 natively for 0-RTT/1-RTT handshakes and supports seamless connection migration (e.g. mobile switching from Wi-Fi to cellular without dropping streams). Powers HTTP/3.
Performance Metrics:
- Bandwidth: Maximum potential data capacity of a link.
- Throughput: Actual rate of data successfully transferred.
- Latency: Time required for a packet to travel from source to destination.
- Jitter: Statistical variation in packet arrival delay (critical for voice/video)."""
    },
    {
        "chapter": 11,
        "title": "DNS, DHCP and Address Configuration",
        "keywords": ["dns", "dhcp", "dora", "records", "a record", "aaaa", "cname", "mx", "resolver", "apipa", "169.254"],
        "content": """Chapter 11: DNS, DHCP and Address Configuration
DNS (Domain Name System):
Translates human-readable domain names into IP addresses. Uses hierarchical structure: Root servers (.) -> TLD servers (.com, .org, .edu) -> Authoritative servers (example.com).
Core DNS Record Types:
- A: Maps hostname to IPv4 address.
- AAAA: Maps hostname to IPv6 address.
- CNAME: Canonical Name (alias to another hostname).
- MX: Mail Exchange server responsible for domain emails.
- TXT: Text metadata (used for SPF, DKIM, domain verification).
- NS: Authoritative Name Server for the zone.
- PTR: Reverse lookup (maps IP address to hostname).
TTL (Time to Live): Number of seconds resolvers are allowed to cache the answer.
DHCP (Dynamic Host Configuration Protocol):
Automatically leases IP configuration to endpoints. Uses the 4-step DORA process:
1. Discover (Client broadcasts DHCPDISCOVER on UDP 67/68)
2. Offer (Server offers IP via DHCPOFFER)
3. Request (Client requests the offered IP via DHCPREQUEST)
4. Acknowledge (Server commits lease with DHCPACK)
APIPA: If DHCP fails on Windows/macOS, host self-assigns 169.254.x.x/16 (indicates lack of DHCP communication)."""
    },
    {
        "chapter": 12,
        "title": "HTTP, HTTPS and TLS",
        "keywords": ["http", "https", "tls", "ssl", "status codes", "get", "post", "put", "delete", "http/2", "http/3", "certificates"],
        "content": """Chapter 12: HTTP, HTTPS and TLS
HTTP (Hypertext Transfer Protocol): Application protocol for resource delivery.
Common Methods: GET (retrieve), POST (create), PUT (replace), PATCH (modify), DELETE (remove), HEAD, OPTIONS.
Status Code Ranges:
- 1xx: Informational (101 Switching Protocols)
- 2xx: Success (200 OK, 201 Created, 204 No Content)
- 3xx: Redirection (301 Moved Permanently, 302 Found, 304 Not Modified)
- 4xx: Client Error (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests)
- 5xx: Server Error (500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout)
HTTPS and TLS:
HTTPS encrypts HTTP over TLS (Transport Layer Security, typically port 443). Provides Confidentiality (symmetric AES/ChaCha encryption), Integrity (HMAC/SHA), and Authentication (X.509 digital certificates signed by Certificate Authorities).
HTTP Evolution:
- HTTP/1.1: Persistent connections, head-of-line blocking on single TCP connection.
- HTTP/2: Binary framing, multiplexed streams over one TCP connection, header compression (HPACK).
- HTTP/3: Runs over QUIC/UDP, eliminating TCP head-of-line blocking."""
    },
    {
        "chapter": 13,
        "title": "Email, File Transfer and Remote Access Protocols",
        "keywords": ["smtp", "imap", "pop3", "ftp", "sftp", "ssh", "ntp", "remote access"],
        "content": """Chapter 13: Email, File Transfer and Remote Access Protocols
Email Architecture:
- SMTP (Simple Mail Transfer Protocol / Ports 25, 587): Sends and relays mail between servers and clients.
- IMAP (Internet Message Access Protocol / Port 993 TLS): Syncs messages across multiple client devices; mail stays on server.
- POP3 (Post Office Protocol 3 / Port 995 TLS): Downloads messages to client and deletes from server by default.
File Transfer:
- FTP (File Transfer Protocol / Ports 20, 21): Plaintext, insecure credentials.
- FTPS: FTP wrapped in TLS encryption.
- SFTP (SSH File Transfer Protocol / Port 22): File transfer protocol running entirely inside an encrypted SSH tunnel (different from FTPS).
Remote Administration:
- SSH (Secure Shell / Port 22): Encrypted remote terminal access, port forwarding, and tunneling. Prefers asymmetric public-key cryptography over passwords.
- Telnet (Port 23): Unencrypted, insecure legacy protocol (passwords in cleartext).
NTP (Network Time Protocol / UDP 123): Synchronizes device clocks to atomic UTC references (crucial for certificate validation, event logging, and authentication tokens)."""
    },
    {
        "chapter": 14,
        "title": "Wireless Networks: Wi-Fi and Bluetooth",
        "keywords": ["wireless", "wi-fi", "wifi", "802.11", "bluetooth", "ble", "wpa2", "wpa3", "bands", "2.4ghz", "5ghz"],
        "content": """Chapter 14: Wireless Networks: Wi-Fi and Bluetooth
Wi-Fi (IEEE 802.11):
Uses half-duplex radio frequency communication with CSMA/CA (Carrier Sense Multiple Access with Collision Avoidance).
Frequency Bands:
- 2.4 GHz: Better wall penetration and long range, but crowded (only 3 non-overlapping channels: 1, 6, 11 in 20 MHz) and prone to interference from microwaves and Bluetooth.
- 5 GHz: Shorter range, but higher data rates and dozens of non-overlapping channels.
- 6 GHz (Wi-Fi 6E / Wi-Fi 7): Ultra-wide 160/320 MHz channels with zero legacy interference.
Wi-Fi Security:
- WPA2-Personal (Pre-Shared Key with AES-CCMP): Common standard.
- WPA3: Uses SAE (Simultaneous Authentication of Equals) to protect against offline dictionary attacks, with mandatory Protected Management Frames (PMF).
- WPA Enterprise (802.1X): Authenticates individual user credentials against a central RADIUS / AAA server.
Bluetooth & BLE:
Bluetooth Classic is designed for continuous streaming (audio). Bluetooth Low Energy (BLE) operates on 2.4 GHz using low duty cycles for battery-operated sensors, smart classroom beacons, and fitness wearables."""
    },
    {
        "chapter": 15,
        "title": "Routing, NAT and VLAN Design",
        "keywords": ["routing", "nat", "pat", "vlan", "ospf", "bgp", "longest prefix match", "trunk", "802.1q"],
        "content": """Chapter 15: Routing, NAT and VLAN Design
Routing Fundamentals:
Routers examine packet destination IP and match it against the Routing Table using Longest Prefix Match (most specific subnet mask wins). If no route matches, the packet is forwarded to the Default Route (0.0.0.0/0).
Routing Protocols:
- Static Routing: Manually configured by administrators; simple, no CPU overhead, but does not adapt to link failures.
- Dynamic Routing: Routers exchange reachability updates automatically.
  - IGP (Interior Gateway Protocol): Within an Autonomous System (e.g. OSPF - link-state Dijkstra algorithm).
  - EGP (Exterior Gateway Protocol): Between Autonomous Systems across the Internet (BGP - path vector).
NAT (Network Address Translation) & PAT:
PAT (Port Address Translation / NAT Overload) maps multiple private IP hosts to a single public IP by modifying Layer 4 TCP/UDP port numbers.
VLAN Trunking & Segmentation:
Switch ports are configured as Access Ports (single untagged VLAN for endpoints) or Trunk Ports (carries multiple VLANs using IEEE 802.1Q tags). Inter-VLAN routing connects segmented zones (e.g. Guest Wi-Fi vs Faculty vs Student networks) with firewall security controls."""
    },
    {
        "chapter": 16,
        "title": "Network Security and Common Threats",
        "keywords": ["security", "threats", "cia triad", "firewall", "phishing", "malware", "dos", "ddos", "spoofing", "mitm", "defense in depth"],
        "content": """Chapter 16: Network Security and Common Threats
Security Pillars (CIA Triad):
- Confidentiality: Preventing unauthorized access (Encryption via AES, TLS).
- Integrity: Detecting unauthorized alteration (Hashing via SHA-256, digital signatures).
- Availability: Ensuring systems and bandwidth remain accessible when needed.
Common Network Attacks:
- Phishing & Social Engineering: Deceptive communications to harvest credentials.
- DoS & DDoS (Distributed Denial of Service): Overwhelming server or link capacity with volumetric floods (SYN flood, UDP amplification).
- Man-in-the-Middle (MITM): Intercepting or altering communications via ARP poisoning or rogue DNS.
- IP/MAC Spoofing: Falsifying source address in headers to bypass access lists or redirect responses.
Defense-in-Depth Strategy:
Layered security architecture: Network segmentation (VLANs/DMZ), next-generation firewalls (NGFW), Intrusion Detection/Prevention Systems (IDS/IPS), multi-factor authentication (MFA), endpoint protection, principle of least privilege, and continuous audit logging."""
    },
    {
        "chapter": 17,
        "title": "Application Protocols: MQTT, CoAP and APIs",
        "keywords": ["mqtt", "coap", "api", "rest", "websocket", "iot", "publish subscribe", "broker"],
        "content": """Chapter 17: Application Protocols: MQTT, CoAP and APIs
Publish-Subscribe vs Client-Server:
Client-server (REST HTTP) couples client and server in point-to-point request/response. Publish-Subscribe decouples publishers and subscribers through a central Message Broker.
MQTT (Message Queuing Telemetry Transport):
Lightweight pub/sub protocol over TCP. Publishers post messages to hierarchical topics (e.g., 'campus/buildingA/temp'). Clients subscribe to topics with wildcards (+, #).
MQTT QoS Levels:
- QoS 0 (At most once): Best-effort delivery, no ACK.
- QoS 1 (At least once): Guaranteed delivery with PUBACK; messages may be duplicated.
- QoS 2 (Exactly once): Four-step handshake (PUBLISH -> PUBREC -> PUBREL -> PUBCOMP); guarantees exactly once delivery.
CoAP (Constrained Application Protocol):
Lightweight REST-like protocol running over UDP (RFC 7252) designed for microcontrollers with extreme power/memory constraints.
WebSockets:
Establishes a persistent, full-duplex TCP channel over a single socket initiated via HTTP Upgrade, enabling real-time bidirectional browser streaming."""
    },
    {
        "chapter": 18,
        "title": "Industrial and IoT Networking",
        "keywords": ["industrial", "iot", "scada", "plc", "can bus", "modbus", "profinet", "opc ua", "ot"],
        "content": """Chapter 18: Industrial and IoT Networking
IT vs OT (Operational Technology):
Enterprise IT prioritizes confidentiality; Industrial OT prioritizes safety, deterministic latency, and 99.999% availability.
Industrial Protocols:
- Modbus TCP: Simple master-slave messaging over port 502.
- PROFINET & EtherNet/IP: Real-time deterministic industrial Ethernet for factory automation.
- OPC UA (Open Platform Communications Unified Architecture): Platform-independent machine-to-machine communication with built-in encryption and access control.
CAN Bus (Controller Area Network):
Multi-master serial bus standard (ISO 11898) used in automotive and industrial robotics. Does not use IP or MAC addresses; messages are broadcast with message identifiers. CSMA/CR (Collision Resolution) uses bitwise arbitration: dominant bit (0) overwrites recessive bit (1), allowing highest-priority messages to transmit without collision corruption.
IoT Gateways:
Collect sensor field data via BLE/Zigbee/Modbus, translate protocols, enforce edge security, and securely forward telemetry to cloud brokers."""
    },
    {
        "chapter": 19,
        "title": "Network Performance and Troubleshooting",
        "keywords": ["troubleshooting", "ping", "traceroute", "wireshark", "latency", "jitter", "packet loss", "goodput", "netstat"],
        "content": """Chapter 19: Network Performance and Troubleshooting
Performance Metrics:
- Bandwidth: Maximum theoretical link capacity.
- Throughput: Actual transferred data rate.
- Goodput: Application-level useful throughput (throughput minus protocol headers and retransmissions).
- Packet Loss: Percentage of packets dropped in transit due to buffer overflows or link degradation.
Systematic Troubleshooting Workflow:
1. Identify the problem and scope (single user vs entire subnet).
2. Check Physical & Data Link (cables, link LEDs, interface status, CRC errors).
3. Check Network Configuration (confirm IP, mask, default gateway with ipconfig/ifconfig).
4. Test Gateway Reachability (ping local default gateway).
5. Test Remote IP Reachability (ping public IP like 8.8.8.8 to verify routing/NAT).
6. Test Name Resolution (nslookup/dig to test DNS server).
7. Trace Network Path (traceroute/tracert to locate packet drop or high-latency router hops).
8. Inspect Sockets & Ports (netstat/ss to check listening services and established TCP connections).
9. Deep Packet Inspection (Wireshark to analyze handshake failures, TLS alerts, or TCP retransmissions)."""
    },
    {
        "chapter": 20,
        "title": "Emerging Trends, Design Case Study and Glossary",
        "keywords": ["sdn", "zero trust", "case study", "smart campus", "glossary", "automation", "terms"],
        "content": """Chapter 20: Emerging Trends, Design Case Study and Glossary
Modern Networking Trends:
- SDN (Software-Defined Networking): Decouples the Control Plane (centralized controller programming routing logic) from the Data Plane (switches forwarding packets).
- Zero Trust Architecture (ZTA): 'Never trust, always verify'. Every request must be authenticated, authorized, and encrypted regardless of whether it originates inside or outside the perimeter.
- Network Automation: Infrastructure as Code using Python, Ansible, Netmiko, and RESTCONF/NETCONF.
Smart Campus Design Case Study:
- Core/Distribution/Access hierarchy with redundant links.
- Segmentation: Student Wi-Fi, Faculty, Server Farm, CCTV, and IoT Sensors on isolated VLANs with Inter-VLAN firewall rules.
- Redundant DHCP/DNS with failover.
- 802.1X WPA3-Enterprise authentication.
Essential Networking Glossary:
- Bandwidth: Link capacity in bps.
- Default Gateway: Next-hop router for remote traffic.
- DHCP: Dynamic Host Configuration Protocol.
- DNS: Domain Name System.
- Firewall: Traffic filter enforcing security policies.
- MAC Address: 48-bit physical hardware identifier.
- MTU (Maximum Transmission Unit): Maximum packet size (typically 1500 bytes for standard Ethernet).
- NAT: Network Address Translation.
- Packet: Layer 3 data unit with IP header.
- Protocol: Formal set of rules governing data exchange.
- Subnet Mask: Delineates network bits from host bits.
- TCP: Transmission Control Protocol (reliable byte stream).
- UDP: User Datagram Protocol (lightweight datagrams).
- VLAN: Virtual Local Area Network (Layer 2 broadcast domain)."""
    }
]

def find_relevant_guide_chapters(query: str, top_n: int = 3) -> list[dict]:
    """Find the top matching chapters from the Networks & Protocols study guide based on query keywords."""
    query_lower = query.lower()
    scored = []
    
    for ch in CHAPTERS:
        score = 0
        # Title match
        if ch["title"].lower() in query_lower or any(word in query_lower for word in ch["title"].lower().split()):
            score += 5
        # Keyword matches
        for kw in ch["keywords"]:
            if kw in query_lower:
                score += 3
        # Content word matches
        for word in query_lower.split():
            if len(word) > 3 and word in ch["content"].lower():
                score += 1
                
        scored.append((score, ch))
        
    scored.sort(key=lambda x: x[0], reverse=True)
    
    # Return top_n chapters, or first 2 chapters if no strong keyword matches
    if scored[0][0] > 0:
        return [item[1] for item in scored[:top_n] if item[0] > 0]
    return [CHAPTERS[0], CHAPTERS[3]]  # Fallback to Ch 1 (Intro) & Ch 4 (OSI)


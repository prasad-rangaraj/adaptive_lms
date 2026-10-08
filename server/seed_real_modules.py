import os
import urllib.request
import urllib.parse
import re
import time
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.course import Course, CourseModule, CourseMaterial

courses_data = {
    "Computer Networks": {
        "fundamentals": ["What is a Network?", "Network Topologies", "OSI Model Basics", "TCP/IP Overview", "Network Hardware"],
        "beginner": ["IP Addressing", "Subnetting Basics", "Routing Concepts", "Switching Basics", "ARP and MAC Addresses"],
        "intermediate": ["TCP vs UDP", "Dynamic Routing (OSPF)", "VLANs & Trunking", "NAT and PAT", "IPv6 Introduction"],
        "advanced": ["BGP Routing", "Software Defined Networking", "Network Security (IPsec)", "QoS", "Network Automation"]
    },
    "Computer Networks and Protocols": {
        "fundamentals": ["Intro to Protocols", "Data Encapsulation", "Physical Layer", "Data Link Layer", "Ethernet Frames"],
        "beginner": ["Network Layer Protocols", "ICMP and Ping", "Transport Layer", "Application Layer", "DNS Basics"],
        "intermediate": ["HTTP/HTTPS Protocols", "FTP and SMTP", "DHCP Operations", "SSL/TLS Handshake", "WebSocket Protocol"],
        "advanced": ["SNMP Management", "MPLS Networks", "Multicast Routing", "IPv6 Transition Mechanisms", "Deep Packet Inspection"]
    },
    "Introduction to Data Structures and Algorithms": {
        "fundamentals": ["What are Data Structures?", "Big O Notation", "Arrays in Memory", "Strings", "Pointers Basics"],
        "beginner": ["Linked Lists", "Stacks", "Queues", "Basic Recursion", "Linear & Binary Search"],
        "intermediate": ["Hash Tables", "Trees & Binary Trees", "Binary Search Trees", "Sorting (Merge & Quick)", "Heaps & Priority Queues"],
        "advanced": ["Graphs (BFS & DFS)", "Dynamic Programming", "Trie Data Structure", "Greedy Algorithms", "Topological Sort"]
    },
    "Advanced React and Node.js": {
        "fundamentals": ["React Component Lifecycle", "Hooks Intro", "Node.js Architecture", "Express Basics", "NPM & Packages"],
        "beginner": ["React Context API", "React Router", "REST API with Express", "MongoDB & Mongoose", "Middleware in Express"],
        "intermediate": ["Redux Toolkit", "Server Side Rendering (Next.js)", "JWT Authentication", "GraphQL Basics", "Error Handling Node"],
        "advanced": ["Microservices with Node", "WebSockets & Socket.io", "React Performance Optimization", "Dockerizing Node Apps", "Testing with Jest"]
    },
    "Operating Systems Fundamentals": {
        "fundamentals": ["What is an OS?", "Computer Architecture Overview", "OS Services", "System Calls", "Kernel vs User Mode"],
        "beginner": ["Processes vs Threads", "Process Scheduling", "Interprocess Communication", "Threads API", "CPU Scheduling Algorithms"],
        "intermediate": ["Process Synchronization", "Mutexes & Semaphores", "Deadlocks", "Memory Management", "Paging & Segmentation"],
        "advanced": ["Virtual Memory", "Page Replacement Algorithms", "File Systems Implementation", "I/O Systems", "Virtualization"]
    },
    "System Design Interviews": {
        "fundamentals": ["What is System Design?", "Client-Server Model", "Network Protocols Review", "Latency vs Throughput", "CAP Theorem"],
        "beginner": ["Load Balancing", "Caching Strategies", "Database Scaling", "SQL vs NoSQL", "Message Queues"],
        "intermediate": ["Design a URL Shortener", "Rate Limiting", "Consistent Hashing", "Design a Key-Value Store", "Content Delivery Networks"],
        "advanced": ["Design Facebook Newsfeed", "Design Uber/Lyft", "Design Whatsapp", "Distributed Transactions", "Consensus Algorithms"]
    },
    "Quantitative Finance and Trading": {
        "fundamentals": ["Financial Markets Intro", "Asset Classes", "Time Value of Money", "Risk and Return", "Market Microstructure"],
        "beginner": ["Portfolio Theory", "CAPM Model", "Derivatives Basics", "Options Pricing Intro", "Algorithmic Trading Intro"],
        "intermediate": ["Black-Scholes Model", "Stochastic Calculus", "Statistical Arbitrage", "Time Series Analysis", "Monte Carlo Simulations"],
        "advanced": ["Machine Learning in Finance", "High Frequency Trading", "Pairs Trading Strategies", "Order Book Dynamics", "Volatility Modeling"]
    }
}

def get_yt_url(query):
    try:
        q = urllib.parse.quote(query)
        url = f"https://www.youtube.com/results?search_query={q}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8')
        match = re.search(r'\"videoId\":\"(.*?)\"', html)
        if match and len(match.group(1)) == 11:
            return f"https://www.youtube.com/watch?v={match.group(1)}"
    except Exception as e:
        pass
    return "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

def seed_real():
    db = SessionLocal()
    
    # Delete old
    db.query(CourseMaterial).delete()
    db.query(CourseModule).delete()
    db.commit()
    print("Deleted old generic modules.")

    courses = db.query(Course).all()
    
    for course in courses:
        print(f"Generating for {course.title}...")
        course_data = courses_data.get(course.title, courses_data["Computer Networks"])
        order_index = 0
        
        for level in ['fundamentals', 'beginner', 'intermediate', 'advanced']:
            titles = course_data[level]
            for i, topic in enumerate(titles):
                mod_title = f"{topic}"
                
                mod = CourseModule(
                    course_id=course.id,
                    title=mod_title,
                    order_index=order_index,
                    level=level
                )
                db.add(mod)
                db.flush()
                
                search_query = f"{course.title} {topic} tutorial"
                yt_url = get_yt_url(search_query)
                time.sleep(0.5) # rate limit
                
                mat_vid = CourseMaterial(
                    module_id=mod.id,
                    title=f"Video Lesson: {topic}",
                    material_type="youtube",
                    external_url=yt_url,
                    order_index=0
                )
                mat_pdf = CourseMaterial(
                    module_id=mod.id,
                    title=f"Resource Guide: {topic}.pdf",
                    material_type="pdf",
                    s3_url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    order_index=1
                )
                mat_transcript = CourseMaterial(
                    module_id=mod.id,
                    title=f"Transcript: {topic}",
                    material_type="article",
                    s3_url="",
                    order_index=2
                )
                
                db.add_all([mat_vid, mat_pdf, mat_transcript])
                order_index += 1

    db.commit()
    print("Contextual Seeding Complete!")

if __name__ == '__main__':
    seed_real()

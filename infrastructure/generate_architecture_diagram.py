#!/usr/bin/env python3
"""
AWS Blog Infrastructure Architecture Diagram Generator

This script generates a visual diagram of the blog infrastructure defined in the CDK stack.

Architecture Components:
- S3 Bucket: Static website hosting with versioning and encryption
- CloudFront: CDN with HTTPS, caching, and global edge locations
- Origin Access Control: Secure access from CloudFront to S3
- Logging: Access logs and CloudFront logs stored in S3

Requirements:
    pip install diagrams

System Requirements:
    - Graphviz must be installed on your system
    - macOS: brew install graphviz
    - Ubuntu/Debian: sudo apt-get install graphviz
    - Windows: Download from https://graphviz.org/download/

Usage:
    python3 infrastructure/generate_architecture_diagram.py
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.storage import S3
from diagrams.aws.network import CloudFront
from diagrams.aws.general import User, General

# Generate the architecture diagram
with Diagram(
    "Blog Infrastructure Architecture",
    show=False,
    direction="LR",
    filename="infrastructure/blog-architecture",
    outformat="png"
):
    # User accessing the blog
    user = User("Blog Visitors")
    
    # CloudFront CDN
    cdn = CloudFront("CloudFront\nDistribution\n(HTTPS, HTTP/2+3)")
    
    # S3 Storage cluster
    with Cluster("S3 Storage"):
        bucket = S3("Website Bucket\n(Versioned, Encrypted)")
        logs = S3("Access Logs\n& CloudFront Logs")
    
    # Data flow connections
    user >> Edge(label="HTTPS Requests") >> cdn
    cdn >> Edge(label="Origin Access Control") >> bucket
    cdn >> Edge(label="Access Logs") >> logs
    bucket >> Edge(label="Server Logs") >> logs
    
    # Content note
    note = General("Static Content:\n- HTML/CSS/JS\n- Markdown Articles\n- Article Metadata")

print("✓ Architecture diagram generated: infrastructure/blog-architecture.png")

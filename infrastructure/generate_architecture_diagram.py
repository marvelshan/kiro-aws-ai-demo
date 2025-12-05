#!/usr/bin/env python3
"""
AWS Blog Infrastructure Architecture Diagram Generator

This script generates a visual diagram of the blog infrastructure
based on the CDK stack definition in blog-infrastructure-stack.js

Requirements:
    pip install diagrams

Usage:
    python3 infrastructure/generate_architecture_diagram.py
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.storage import SimpleStorageServiceS3 as S3
from diagrams.aws.network import CloudFront
from diagrams.aws.security import IdentityAndAccessManagementIam as IAM
from diagrams.aws.general import User

# Diagram configuration
graph_attr = {
    "fontsize": "16",
    "bgcolor": "white",
    "pad": "0.5",
    "splines": "ortho",
}

node_attr = {
    "fontsize": "12",
}

edge_attr = {
    "fontsize": "10",
}

with Diagram(
    "Blog Infrastructure Architecture",
    filename="generated-diagrams/blog-architecture-updated",
    direction="LR",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr,
    show=False,
):
    # Users/Visitors
    users = User("Blog Visitors")
    
    # CloudFront Distribution
    cdn = CloudFront("CloudFront\nDistribution\n(HTTPS, HTTP/2+3)")
    
    # S3 Storage Cluster
    with Cluster("S3 Storage"):
        website_bucket = S3("Website Bucket\n(Versioned,\nEncrypted,\nBlock Public)")
        
    # IAM/Security (implicit)
    oac = IAM("Origin Access\nControl (OAC)")
    
    # Data flow
    users >> Edge(label="HTTPS Requests", color="darkblue") >> cdn
    cdn >> Edge(label="Secure Origin", color="darkgreen") >> oac
    oac >> Edge(label="GetObject", color="green") >> website_bucket
    
    # Cache behavior (visual note)
    cdn >> Edge(label="Cache:\n24h default\n365d max", color="gray", style="dashed") >> cdn

print("✅ Architecture diagram generated: generated-diagrams/blog-architecture-updated.png")
print("\nInfrastructure Components:")
print("- CloudFront Distribution (CDN with HTTPS, HTTP/2, HTTP/3)")
print("- S3 Bucket (versioned, encrypted, block public access)")
print("- Origin Access Control (secure S3 access)")
print("- Cache Policy (24h default, 365d max TTL)")
print("- Error handling (404/403 → index.html for SPA)")
print("\nRecent Changes:")
print("- Logging disabled to avoid ACL issues")
print("- Can be re-enabled with separate logging bucket if needed")

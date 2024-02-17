# Configure the AWS provider
provider "aws" {
  region = "us-east-1" # Replace with your desired region
}

locals {
  region = "us-east-1"
}


resource "aws_vpc" "my_vpc" {
  cidr_block = "10.0.0.0/16"

  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "TF-vpc"
  }
}


resource "aws_subnet" "subnet1" {
  vpc_id                  = aws_vpc.my_vpc.id
  cidr_block              = var.subnet1["cidr_block"]
  availability_zone       = var.subnet1["availability_zone"]
  map_public_ip_on_launch = true

  tags = {
    Name = "TF-subnet1"
  }
}

resource "aws_subnet" "subnet2" {
  vpc_id                  = aws_vpc.my_vpc.id
  cidr_block              = var.subnet2["cidr_block"]
  availability_zone       = var.subnet2["availability_zone"]

  tags = {
    Name = "TF-subnet2"
  }
}



# Use a data source to find the latest EKS worker AMI
data "aws_ami" "eks_worker" {
  filter {
    name   = "name"
    values = ["amazon-eks-node-1.29-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "owner-alias"
    values = ["amazon*"]
  }

  most_recent = true
  owners      = ["602401143452"] # Amazon
}




module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "my-cluster"
  cluster_version = "1.29"

  cluster_endpoint_public_access = true

  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
  }

  vpc_id                   = aws_vpc.my_vpc.id
  subnet_ids               = [aws_subnet.subnet1.id, aws_subnet.subnet2.id]
  control_plane_subnet_ids = [aws_subnet.subnet1.id, aws_subnet.subnet2.id]

  # EKS Managed Node Group(s)
  eks_managed_node_group_defaults = {
    instance_types = ["t3.large"]
    disk_size      = 10
    iam_role_attach_cni_policy = true
    update_config = {
      max_unavailable_percentage = 50 # or set `max_unavailable`
    }

  }

  eks_managed_node_groups = {
    "${local.region}-node-group" = {
      min_size     = 2
      max_size     = 4
      desired_size = 2

      instance_types = ["t3.large"]
      capacity_type  = "SPOT"
    }
  }

  enable_cluster_creator_admin_permissions = true

  access_entries = {
    # One access entry with a policy associated
    example = {
      kubernetes_groups = []
      principal_arn     = "arn:aws:iam::118490528453:user/agencybox_user"

      policy_associations = {
        example = {
          policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSViewPolicy"
          access_scope = {
            namespaces = ["tow"]
            type       = "namespace"
          }
        }
      }
    }
  }

  tags = {
    Environment = "dev"
    Terraform   = "true"
  }
}


data "aws_eks_cluster_auth" "cluster" {
  name = module.eks.cluster_name
}
# Configure the Kubernetes provider
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  #token                  = module.eks.cluster_iam_role_arn
  token = data.aws_eks_cluster_auth.cluster.token
  #
  #version                  = "~> 1.21" # Use latest compatible version
}

# Create a namespace in the cluster
resource "kubernetes_namespace" "tow" {
  metadata {
    name = "tow"
  }
}


# Create a deployment
resource "kubernetes_deployment" "tow_app" {
  metadata {
    name      = "tow-app"
    namespace = kubernetes_namespace.tow.metadata[0].name
  }

  spec {
    replicas = 2 # Ensure at least 2 pods for redundancy

    selector {
      match_labels = {
        app = "tow-app"
      }
    }

    template {
      metadata {
        labels = {
          app = "tow-app"
        }
      }

      spec {
        container {
          name  = "tow-app"
          image = var.image_uri

          port {
            container_port = 3000
          }
        }
      }
    }
  }
}

# Create a service
resource "kubernetes_service" "tow_service" {
  metadata {
    name      = "tow-service"
    namespace = kubernetes_namespace.tow.metadata[0].name
  }

  spec {
    selector = {
      app = "tow-app"
    }

    type = "LoadBalancer"

    port {
      port        = 80
      target_port = 3000
    }
  }
}

resource "kubernetes_ingress" "ab_ingress" {
  metadata {
    name = "agencybox-ingress"
    namespace = kubernetes_namespace.tow.metadata[0].name
    labels = {
      Environment = "Testdev"
      Owner = "agencybox_user"
      Terraform = "true"
    }
  }

  spec {
    rule {
      host = "example.com" # Replace with your domain

      http {
        path {
          path = "/"
          backend {
            service_name = kubernetes_service.tow_service.metadata[0].name
            service_port = 80
          }
          
        }
      }
    }
  }

  depends_on = [
    kubernetes_service.tow_service,
  ]

  
}

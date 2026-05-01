provider "aws" {
  region = "us-east-1"
}

# Fetch the Default VPC
data "aws_vpc" "default" {
  default = true
}

# Fetch the Default Subnets
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Fetch the latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

# Security Group to allow HTTP (80) and SSH (22)
resource "aws_security_group" "login_page_sg" {
  name        = "login_page_sg"
  description = "Allow HTTP and SSH inbound traffic"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "login_page_sg"
  }
}

# EC2 Instance
resource "aws_instance" "login_server" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = "t2.micro" 
  subnet_id     = data.aws_subnets.default.ids[0]
  
  # Ensure we attach the security group
  vpc_security_group_ids = [aws_security_group.login_page_sg.id]

  # vockey is the default standard key pair automatically provided in AWS Learner Labs
  key_name = "vockey" 

  # Startup script to install Docker
  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y docker
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ec2-user
              EOF

  tags = {
    Name = "LoginPageServer"
  }
}

output "public_ip" {
  value       = aws_instance.login_server.public_ip
  description = "The public IP of the web server"
}

output "website_url" {
  value       = "http://${aws_instance.login_server.public_ip}"
  description = "The URL to access the login page"
}

-- =========================================================================
-- Enterprise Workflow Management Platform
-- Seed Data Script
-- Default Users Passwords:
-- admin: Admin@123
-- sarah.manager: Manager@123
-- alex.employee: Employee@123
-- elena.auditor: Auditor@123
-- mark.finance: Manager@123
-- =========================================================================

USE enterprise_workflow_db;

-- 1. Insert Enterprise Users
INSERT INTO users (id, username, email, password, full_name, department, job_title, active)
VALUES 
(1, 'admin', 'admin@enterprise.local', '$2a$10$wE99w7g2z2x8P7L81d8p0O3B3yq9A.2Q9e/QcO2mJ2QoG2K8Gv2yS', 'Alexander Wright', 'Executive Management', 'Chief Information Officer', true),
(2, 'sarah.manager', 'sarah.chen@enterprise.local', '$2a$10$wE99w7g2z2x8P7L81d8p0O3B3yq9A.2Q9e/QcO2mJ2QoG2K8Gv2yS', 'Sarah Chen', 'Engineering Operations', 'Engineering Director', true),
(3, 'alex.employee', 'alex.miller@enterprise.local', '$2a$10$wE99w7g2z2x8P7L81d8p0O3B3yq9A.2Q9e/QcO2mJ2QoG2K8Gv2yS', 'Alex Miller', 'Software Engineering', 'Senior Full Stack Developer', true),
(4, 'elena.auditor', 'elena.rostova@enterprise.local', '$2a$10$wE99w7g2z2x8P7L81d8p0O3B3yq9A.2Q9e/QcO2mJ2QoG2K8Gv2yS', 'Elena Rostova', 'Risk & Compliance', 'Senior IT Compliance Auditor', true),
(5, 'mark.finance', 'mark.sterling@enterprise.local', '$2a$10$wE99w7g2z2x8P7L81d8p0O3B3yq9A.2Q9e/QcO2mJ2QoG2K8Gv2yS', 'Mark Sterling', 'Finance & Accounting', 'VP of Financial Planning', true)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 2. Insert User Roles
INSERT IGNORE INTO user_roles (user_id, role) VALUES
(1, 'ROLE_ADMIN'),
(1, 'ROLE_MANAGER'),
(2, 'ROLE_MANAGER'),
(3, 'ROLE_EMPLOYEE'),
(4, 'ROLE_AUDITOR'),
(5, 'ROLE_MANAGER');

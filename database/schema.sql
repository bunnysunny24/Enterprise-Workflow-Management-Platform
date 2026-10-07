-- =========================================================================
-- Enterprise Workflow Management Platform
-- Relational Database Schema (MySQL 8.0+)
-- =========================================================================

CREATE DATABASE IF NOT EXISTS enterprise_workflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE enterprise_workflow_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(60),
    job_title VARCHAR(60),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB;

-- 2. User Roles Table (Relational Mapping)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Workflow Definitions Table
CREATE TABLE IF NOT EXISTS workflow_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    department VARCHAR(60),
    version INT NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    sla_hours INT NOT NULL DEFAULT 48,
    form_schema_json TEXT,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB;

-- 4. Workflow Steps Table
CREATE TABLE IF NOT EXISTS workflow_steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workflow_definition_id BIGINT NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_key VARCHAR(50) NOT NULL,
    step_order INT NOT NULL,
    required_role VARCHAR(30),
    step_type VARCHAR(30) NOT NULL DEFAULT 'APPROVAL',
    timeout_hours INT NOT NULL DEFAULT 24,
    initial_step BOOLEAN NOT NULL DEFAULT FALSE,
    terminal_step BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    CONSTRAINT fk_steps_workflow_def FOREIGN KEY (workflow_definition_id) REFERENCES workflow_definitions (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Workflow Transitions Table
CREATE TABLE IF NOT EXISTS workflow_transitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workflow_definition_id BIGINT NOT NULL,
    from_step_id BIGINT NOT NULL,
    to_step_id BIGINT NOT NULL,
    action_name VARCHAR(50) NOT NULL,
    button_label VARCHAR(100),
    condition_expression VARCHAR(255),
    CONSTRAINT fk_trans_workflow_def FOREIGN KEY (workflow_definition_id) REFERENCES workflow_definitions (id) ON DELETE CASCADE,
    CONSTRAINT fk_trans_from_step FOREIGN KEY (from_step_id) REFERENCES workflow_steps (id) ON DELETE CASCADE,
    CONSTRAINT fk_trans_to_step FOREIGN KEY (to_step_id) REFERENCES workflow_steps (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Workflow Instances Table
CREATE TABLE IF NOT EXISTS workflow_instances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tracking_number VARCHAR(60) NOT NULL UNIQUE,
    workflow_definition_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    current_step_id BIGINT,
    initiator_id BIGINT NOT NULL,
    assignee_id BIGINT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    payload_json LONGTEXT,
    sla_deadline DATETIME(6),
    completed_at DATETIME(6),
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_instances_workflow_def FOREIGN KEY (workflow_definition_id) REFERENCES workflow_definitions (id),
    CONSTRAINT fk_instances_current_step FOREIGN KEY (current_step_id) REFERENCES workflow_steps (id),
    CONSTRAINT fk_instances_initiator FOREIGN KEY (initiator_id) REFERENCES users (id),
    CONSTRAINT fk_instances_assignee FOREIGN KEY (assignee_id) REFERENCES users (id)
) ENGINE=InnoDB;

-- 7. Workflow Audit Logs Table
CREATE TABLE IF NOT EXISTS workflow_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    instance_id BIGINT NOT NULL,
    step_name VARCHAR(100),
    action_taken VARCHAR(50) NOT NULL,
    actor_id BIGINT,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    comments TEXT,
    duration_minutes BIGINT,
    timestamp DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_audit_instance FOREIGN KEY (instance_id) REFERENCES workflow_instances (id) ON DELETE CASCADE,
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users (id)
) ENGINE=InnoDB;

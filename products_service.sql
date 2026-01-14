-- ============================================
-- DATABASE: products_service
-- ============================================
CREATE DATABASE products_service;
\c products_service;

CREATE SCHEMA public;

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stall_id UUID NOT NULL, -- Referido al Stalls Service
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock INT NOT NULL CHECK (stock >= 0),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_stall_id ON public.products(stall_id);

-- ============================================
-- LOGGING TABLE
-- ============================================
CREATE TABLE public.api_logs (
    id BIGSERIAL PRIMARY KEY,
    route VARCHAR(255) NOT NULL,
    method VARCHAR(20) NOT NULL,
    user_id UUID NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    status_code INT NOT NULL,
    message TEXT
);

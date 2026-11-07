-- ============================================================================
-- J R CONSULTING — GOOGLE WORKSPACE REFERRAL PLATFORM
-- Esquema Maestro de Base de Datos, Extensiones, RLS y Funciones Atómicas
-- Compatibilidad: PostgreSQL 15+ / Supabase
-- ============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA: programs (Multiprograma)
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    provider VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: products (Productos asociados a programas)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    logo_url TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: plans (Ediciones y Planes Oficiales)
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    billing_period VARCHAR(50) DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'annual')),
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    official_url TEXT,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: referral_links (Único enlace de referencia oficial)
CREATE TABLE IF NOT EXISTS public.referral_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    identifier VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(150) NOT NULL,
    referral_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: promotions (Metadatos de Campaña)
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    promotion_type VARCHAR(100) DEFAULT 'referral_discount',
    benefit_description TEXT,
    territory VARCHAR(100) DEFAULT 'América',
    eligibility TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'concluded')),
    public_visibility BOOLEAN DEFAULT FALSE, -- NUNCA revelar cupones en frontend público
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA: leads (Prospectos y Solicitudes de Descuento)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(200) NOT NULL,
    company VARCHAR(150) NOT NULL,
    country VARCHAR(100) NOT NULL,
    interested_plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    message TEXT,
    consent_status BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN (
        'new', 'contacted', 'qualified', 'pending_code', 'code_assigned', 
        'code_delivered', 'converted_reported', 'closed', 'not_eligible'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA: promotion_codes (Inventario Cifrado de Códigos Privados)
CREATE TABLE IF NOT EXISTS public.promotion_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id UUID REFERENCES public.promotions(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    code_ciphertext BYTEA NOT NULL, -- Código almacenado cifrado con AES
    code_mask VARCHAR(50) NOT NULL, -- Máscara para la UI administrativa: ****-****
    code_key_version INT DEFAULT 1,
    territory VARCHAR(100) DEFAULT 'América',
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN (
        'available', 'reserved', 'assigned', 'delivered', 'redeemed', 'expired', 'disabled'
    )),
    assigned_lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    redeemed_at TIMESTAMPTZ,
    expiration_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA: code_assignments (Historial Inmutable de Asignación)
CREATE TABLE IF NOT EXISTS public.code_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_code_id UUID NOT NULL REFERENCES public.promotion_codes(id) ON DELETE RESTRICT,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE RESTRICT,
    assigned_by UUID,
    delivery_method VARCHAR(50) DEFAULT 'secure_email' CHECK (delivery_method IN ('secure_email', 'admin_manual', 'one_time_token')),
    delivery_status VARCHAR(50) DEFAULT 'assigned' CHECK (delivery_status IN ('assigned', 'delivered', 'failed', 'revoked')),
    secure_token_hash VARCHAR(128),
    token_expires_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLA: analytics_events (Métricas y Telemetría Privada)
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(100) NOT NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    anonymous_session_id VARCHAR(100),
    page_path VARCHAR(255),
    referrer TEXT,
    device_category VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABLA: admin_profiles (Perfiles Administrativos)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'analyst')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TABLA: admin_activity_logs (Auditoría de Acciones)
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROCEDIMIENTOS ALMACENADOS Y ASIGNACIÓN ATÓMICA
-- ============================================================================

-- Función para asignación atómica evitando carreras de condición (Race Conditions)
CREATE OR REPLACE FUNCTION public.assign_promo_code_atomically(
    p_lead_id UUID,
    p_plan_id UUID,
    p_admin_id UUID,
    p_secret_key TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    assigned_code_id UUID,
    decrypted_code TEXT,
    message TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_code_id UUID;
    v_ciphertext BYTEA;
    v_plain_code TEXT;
BEGIN
    -- Bloqueo FOR UPDATE SKIP LOCKED sobre el primer código disponible
    SELECT id, code_ciphertext INTO v_code_id, v_ciphertext
    FROM public.promotion_codes
    WHERE plan_id = p_plan_id 
      AND status = 'available'
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_code_id IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, 'No hay códigos disponibles para este plan.'::TEXT;
        RETURN;
    END IF;

    -- Descifrar en entorno seguro de servidor
    BEGIN
        v_plain_code := convert_from(pgp_sym_decrypt(v_ciphertext, p_secret_key), 'UTF8');
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, 'Fallo criptográfico al descifrar el código.'::TEXT;
        RETURN;
    END;

    -- Actualizar código
    UPDATE public.promotion_codes
    SET status = 'assigned',
        assigned_lead_id = p_lead_id,
        assigned_at = NOW(),
        updated_at = NOW()
    WHERE id = v_code_id;

    -- Actualizar lead
    UPDATE public.leads
    SET status = 'code_assigned',
        updated_at = NOW()
    WHERE id = p_lead_id;

    -- Registrar en tabla de asignaciones
    INSERT INTO public.code_assignments (
        promotion_code_id,
        lead_id,
        assigned_by,
        delivery_status,
        created_at
    ) VALUES (
        v_code_id,
        p_lead_id,
        p_admin_id,
        'assigned',
        NOW()
    );

    -- Registrar log de auditoría sin exponer el código en claro
    INSERT INTO public.admin_activity_logs (
        admin_user_id,
        action,
        entity_type,
        entity_id,
        metadata
    ) VALUES (
        p_admin_id,
        'CODE_ASSIGNED_ATOMICALLY',
        'promotion_codes',
        v_code_id,
        json_build_object('lead_id', p_lead_id, 'plan_id', p_plan_id)::jsonb
    );

    RETURN QUERY SELECT TRUE, v_code_id, v_plain_code, 'Código asignado exitosamente.'::TEXT;
END;
$$;

-- ============================================================================
-- POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. Acceso Público Anónimo: Solo lectura de catálogos activos
CREATE POLICY "Public can view active programs" 
ON public.programs FOR SELECT 
USING (status = 'active');

CREATE POLICY "Public can view active products" 
ON public.products FOR SELECT 
USING (status = 'active');

CREATE POLICY "Public can view active plans" 
ON public.plans FOR SELECT 
USING (status = 'active');

CREATE POLICY "Public can view active referral link" 
ON public.referral_links FOR SELECT 
USING (status = 'active');

-- 2. Leads: Los visitantes anónimos pueden insertar formularios validados
CREATE POLICY "Public can submit leads" 
ON public.leads FOR INSERT 
WITH CHECK (name IS NOT NULL AND email IS NOT NULL AND consent_status = TRUE);

-- Los visitantes NO pueden leer prospectos (solo administradores)
CREATE POLICY "Admins have full access to leads" 
ON public.leads FOR ALL 
USING (auth.uid() IN (SELECT auth_user_id FROM public.admin_profiles WHERE status = 'active'));

-- 3. Analytics: Inserción anónima de eventos permitidos
CREATE POLICY "Public can log analytics events" 
ON public.analytics_events FOR INSERT 
WITH CHECK (event_name IS NOT NULL);

CREATE POLICY "Admins can view analytics" 
ON public.analytics_events FOR SELECT 
USING (auth.uid() IN (SELECT auth_user_id FROM public.admin_profiles WHERE status = 'active'));

-- 4. BÓVEDA DE CÓDIGOS: Cero acceso público anónimo
CREATE POLICY "No public access to promotion_codes" 
ON public.promotion_codes FOR ALL 
USING (FALSE);

CREATE POLICY "Admins can manage promotion_codes" 
ON public.promotion_codes FOR ALL 
USING (auth.uid() IN (SELECT auth_user_id FROM public.admin_profiles WHERE status = 'active'));

CREATE POLICY "Admins can manage code_assignments" 
ON public.code_assignments FOR ALL 
USING (auth.uid() IN (SELECT auth_user_id FROM public.admin_profiles WHERE status = 'active'));

-- ============================================================================
-- SEED DATA: CONFIGURACIÓN INICIAL DEL PROGRAMA Y PLANES
-- ============================================================================

-- Programa
INSERT INTO public.programs (id, name, slug, provider, description)
VALUES (
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Google Workspace Referral Program',
    'google-workspace-referral',
    'Google LLC',
    'Programa oficial de referidos para Google Workspace gestionado por J R Consulting en América.'
) ON CONFLICT (slug) DO NOTHING;

-- Producto
INSERT INTO public.products (id, program_id, name, slug, description, category)
VALUES (
    'b2c3d4e5-0000-0000-0000-000000000001',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Google Workspace',
    'google-workspace',
    'Suite integral de productividad, comunicación y almacenamiento corporativo.',
    'Productividad Empresarial'
) ON CONFLICT (slug) DO NOTHING;

-- Planes Iniciales Verificados
INSERT INTO public.plans (id, product_id, name, slug, description, price, currency, features, official_url)
VALUES 
(
    'c3d4e5f6-0000-0000-0000-000000000001',
    'b2c3d4e5-0000-0000-0000-000000000001',
    'Google Workspace Business Starter',
    'business-starter',
    'Correo corporativo, 30 GB en la nube y reuniones de hasta 100 participantes.',
    6.00,
    'USD',
    '["Correo empresarial usted@suempresa.com", "30 GB de almacenamiento por usuario", "Meet hasta 100 participantes", "Seguridad y controles estándar"]'::jsonb,
    'https://workspace.google.com/intl/es-419_mx/pricing.html'
),
(
    'c3d4e5f6-0000-0000-0000-000000000002',
    'b2c3d4e5-0000-0000-0000-000000000002',
    'Google Workspace Business Standard',
    'business-standard',
    '2 TB de almacenamiento en la nube, reuniones de 150 participantes con grabación en Drive y carpetas compartidas.',
    12.00,
    'USD',
    '["Correo empresarial con dominio corporativo", "2 TB de almacenamiento compartido por usuario", "Meet hasta 150 participantes con grabación en Drive", "Unidades compartidas (Shared Drives)"]'::jsonb,
    'https://workspace.google.com/intl/es-419_mx/pricing.html'
) ON CONFLICT (slug) DO NOTHING;

-- ÚNICO ENLACE DE REFERENCIA MAESTRO
INSERT INTO public.referral_links (program_id, identifier, label, referral_url, status)
VALUES (
    'a1b2c3d4-0000-0000-0000-000000000001',
    'google-workspace-main-referral',
    'Enlace Central Oficial B9iH',
    'https://referworkspace.app.goo.gl/B9iH',
    'active'
) ON CONFLICT (identifier) DO UPDATE 
SET referral_url = 'https://referworkspace.app.goo.gl/B9iH',
    status = 'active';
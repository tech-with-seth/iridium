export type RoleAtOrganization =
    | 'engineering'
    | 'product'
    | 'data'
    | 'marketing'
    | 'sales'
    | 'leadership'
    | 'other';

export type CreationContext =
    | 'feature_flags'
    | 'experiment'
    | 'remote_config'
    | string;

export type EvaluationRuntime = 'server' | 'client' | string;

export interface HedgehogConfig {
    [key: string]: unknown;
}

export interface PostHogUser {
    id: number;
    uuid: string;
    distinct_id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_email_verified: boolean;
    hedgehog_config: HedgehogConfig;
    role_at_organization: RoleAtOrganization;
}

export interface FeatureFlagFilters {
    [key: string]: unknown;
}

export interface FeatureFlag {
    id: number;
    name: string;
    key: string;
    filters: FeatureFlagFilters;
    deleted: boolean;
    active: boolean;
    created_by: PostHogUser;
    created_at: string;
    updated_at: string;
    version: number;
    last_modified_by: PostHogUser;
    is_simple_flag: boolean;
    rollout_percentage: number;
    ensure_experience_continuity: boolean;
    experiment_set: string;
    surveys: Record<string, unknown>;
    features: Record<string, unknown>;
    rollback_conditions: unknown | null;
    performed_rollback: boolean;
    can_edit: boolean;
    tags: unknown[];
    evaluation_tags: unknown[];
    usage_dashboard: number;
    analytics_dashboards: number[];
    has_enriched_analytics: boolean;
    user_access_level: string;
    creation_context: CreationContext;
    is_remote_configuration: boolean;
    has_encrypted_payloads: boolean;
    status: string;
    evaluation_runtime: EvaluationRuntime;
    _create_in_folder: string;
    _should_create_usage_dashboard: boolean;
}

export interface FeatureFlagsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: FeatureFlag[];
}

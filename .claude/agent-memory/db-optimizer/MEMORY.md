# Database Optimizer Memory

## Schema Overview (as of March 5, 2026)
7 tables: subscriptions, projects, collection_forms, testimonials, widgets, form_views, widget_views
RLS enabled on all 7. Triggers: handle_new_user (auto-create sub), handle_updated_at on 4 tables.

## Critical Findings
1. Webhook does NOT distinguish Pro from Agency (always sets plan='pro')
2. Testimonials INSERT uses anon key but no public INSERT RLS policy exists (possible silent failure for form submissions)
3. No index on projects.user_id (queried by every dashboard page)
4. No index on projects.slug (public page lookup) or projects.report_token (report page lookup)
5. Settings page select('*') on subscriptions (over-fetching)
6. Widgets page select('*') on widgets (over-fetching)
7. form_views and widget_views tables have unbounded growth, no retention strategy
8. Admin page fetches ALL data from ALL tables (no pagination)
9. Forms page has N+1 pattern for submission counts (fetches all form_ids then queries testimonials)
10. No storage bucket policies defined in schema.sql

## Indexes Present
testimonials(user_id, status), testimonials(project_id, status), testimonials(form_id)
widget_views(widget_id, created_at), form_views(form_id, created_at)
collection_forms(project_id), collection_forms(user_id)
widgets(user_id), widgets(project_id)

## Indexes Missing
projects(user_id), projects(slug), projects(report_token)
subscriptions(stripe_subscription_id), subscriptions(stripe_customer_id)
testimonials(project_id, status, created_at DESC) for widget API ordering

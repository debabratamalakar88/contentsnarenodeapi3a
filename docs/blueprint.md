# **App Name**: ContentSnare Lite

## Core Features:

- Tech Stack: Backend: Laravel 12 (PHP 8.2.x), Vite, Spatie Permissions, Laravel Sanctum; Database: MySQL; Frontend: React.js (TypeScript); Protocol: Inertia.js; Styling: Tailwind CSS + ShadCN UI Components; Markup: HTML5
- Introduction: To build a SaaS platform that enables users to collect structured content from clients using customizable templates, team collaboration, and automated workflows.
- User Authentication & Access: Email-based registration with verification; Login/logout with Laravel Sanctum; Password reset and 2FA (optional); Role-based access control using Spatie
- Team Management: Add team members with fields: name, email, phone, role (dropdown), optional message; Roles: Administrator, Editor, Reviewer, Viewer; Email invitation with secure token-based onboarding; Role-based permissions for request creation, editing, reviewing, and viewing
- Client Management: Add clients manually or import via Excel/CSV; Fields: name, email, phone, company (optional), date format, time zone; Client listing with search, filter, and pagination
- Template Management: Drag-and-drop interface for creating templates; Multi-page and multi-section support; Field types: text, textarea, file upload, date, checkbox, dropdown, etc.; Full preview of the template organized by page and section; Templates organized by category; Template listing with preview/edit/delete options
- Request Management: Select from existing templates (categorized); Input Request Title and Description; Customize request using drag-and-drop (multi-page/section); Full preview of the request; Choose to publish immediately, schedule, or save as draft; Assign to one or more clients from the client list; Requests can be created from scratch or from templates
- Request Listing & Actions: View all requests with filters (status, client, date); Preview, edit, or publish requests; Send published requests to clients via email
- Super Admin Panel: Full access to all user and team activities; Manage application-wide settings (branding, SMTP, roles, permissions); View system logs and audit trails; Manage templates, categories, and request types globally
- Non-Functional Requirements: Optimized queries, lazy loading, pagination; CSRF, XSS, input validation, encrypted file storage; Modular service-repository pattern; Clean codebase, reusable components, version control; WCAG-compliant UI for client-facing portal

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) for a professional and trustworthy feel.
- Background color: Light gray (#F0F2F5) to provide a clean, uncluttered workspace.
- Accent color: Purple (#7E57C2) to highlight key actions and elements.
- Body and headline font: 'PT Sans' sans-serif, to ensure readability.
- Use clear, modern icons for actions and categories, such as those from Google's Material Design set.
- Clean, grid-based layout with a focus on user-friendly forms and content display.
- Subtle transitions and animations to provide feedback on user interactions, enhancing the overall experience.
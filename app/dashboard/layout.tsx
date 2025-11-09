import { DashboardLayout } from '@/components/layout/DashboardLayout';

/**
 * LAYOUT: Dashboard Root Layout
 * 
 * Estrutura geral do dashboard:
 * 
 * ┌─────────────────────────────────────────────────────┐
 * │ HEADER (topo fixo)                                  │
 * │ ┌─────────┬──────────────┬──────────┬───────────┐ │
 * │ │ Logo    │ Nome Negócio │ Notif.   │ Avatar    │ │
 * │ └─────────┴──────────────┴──────────┴───────────┘ │
 * ├───────────┼─────────────────────────────────────────┤
 * │ SIDEBAR   │ MAIN CONTENT                             │
 * │ (fixo)    │ (fluido)                                 │
 * │           │                                           │
 * │ • Home    │ ┌─────────────────────────────────────┐ │
 * │ • Agenda  │ │ Breadcrumb                          │ │
 * │ • Profis. │ ├─────────────────────────────────────┤ │
 * │ • Serviços│ │ Conteúdo da página                  │ │
 * │ • Horários│ │                                     │ │
 * │ • Bloqueios│ │                                     │ │
 * │ • Landing │ │                                     │ │
 * │ • Config  │ │                                     │ │
 * │           │ └─────────────────────────────────────┘ │
 * │           │ Footer simples                          │
 * └───────────┴─────────────────────────────────────────┘
 * 
 * RESPONSIVIDADE:
 * - Desktop: Sidebar fixo (240px), conteúdo fluido
 * - Tablet: Sidebar colapsável, conteúdo reflow
 * - Mobile: Sidebar hambúrguer, conteúdo full-width
 * 
 * COMPONENTES:
 * - DashboardLayout: Layout principal
 * - DashboardHeader: Header com logo, nome, notificações, avatar
 * - DashboardSidebar: Menu lateral com links
 * - DashboardContent: Área de conteúdo principal
 */

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

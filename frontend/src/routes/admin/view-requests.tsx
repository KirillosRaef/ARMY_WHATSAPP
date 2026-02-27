import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/view-requests')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/view-requests"!</div>
}

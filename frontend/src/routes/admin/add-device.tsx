import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/add-device')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/add-device"!</div>
}

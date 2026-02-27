import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/add-device-type')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/add-device-type"!</div>
}

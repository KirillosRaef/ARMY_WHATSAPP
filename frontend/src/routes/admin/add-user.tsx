import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/add-user')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/add-user"!</div>
}

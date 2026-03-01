import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/add-branch')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/add-branch"!</div>
}

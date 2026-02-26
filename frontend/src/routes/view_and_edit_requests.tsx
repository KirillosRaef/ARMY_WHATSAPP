import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/view_and_edit_requests')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/view_requests"!</div>
}

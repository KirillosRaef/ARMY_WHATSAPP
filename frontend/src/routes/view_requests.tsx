import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/view_requests')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/view_requests"!</div>
}

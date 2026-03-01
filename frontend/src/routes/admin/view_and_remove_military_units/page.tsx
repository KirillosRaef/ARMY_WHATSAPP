import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/admin/view_and_remove_military_units/page',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/view_and_remove_military_units/page"!</div>
}

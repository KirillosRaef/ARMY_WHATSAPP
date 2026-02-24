import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/test2')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/test"!</div>
}

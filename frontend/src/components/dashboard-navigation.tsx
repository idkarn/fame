import { Link, useParams, useRouterState } from '@tanstack/react-router'
import { Button, buttonVariants } from './ui/button'
import { ExternalLink } from 'lucide-react'

const tabs = [
  { text: 'Overview', route: '' },
  { text: 'Analytics', route: 'analytics' },
  { text: 'Boards', route: 'boards' },
  { text: 'Config', route: 'config' },
]

export function DashboardNavigation() {
  const gameId = useParams({
    from: '/dashboard/games/$id',
  }).id

  const activeTab = ((item = '') => {
    if (!tabs.map((tab) => tab.route).includes(item)) {
      item = ''
    }
    return item
  })(useRouterState().location.pathname.split('/').pop())

  return (
    <nav className="flex items-center gap-1">
      {tabs.map((tab) => (
        <NavLink
          {...tab}
          key={tab.route}
          variant={tab.route === activeTab ? 'default' : 'secondary'}
        />
      ))}
      <Button variant="link" asChild className="ms-auto">
        <a href={`/g/${gameId}`} target="_blank">
          Public page
          <ExternalLink />
        </a>
      </Button>
    </nav>
  )
}

interface NavLinkProps {
  text: string
  route: string
  variant: 'default' | 'outline' | 'secondary'
}

function NavLink({ text, route, variant }: NavLinkProps) {
  return (
    <Link
      to={route}
      from="/dashboard/games/$id"
      className={buttonVariants({ variant: variant, size: 'sm' })}
    >
      {text}
    </Link>
  )
}

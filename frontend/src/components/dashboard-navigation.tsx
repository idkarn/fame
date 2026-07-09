import { Link, useLocation } from '@tanstack/react-router'
import { buttonVariants } from './ui/button'

const tabs = [
  { text: 'Overview', route: '' },
  { text: 'Analytics', route: 'analytics' },
  { text: 'Boards', route: 'boards' },
  { text: 'Config', route: 'config' },
]

export function DashboardNavigation() {
  const location = useLocation()
  const activeTab =
    location.pathname.match(/games\/[a-zA-Z0-9]+\/([a-z]+)/)?.[1] ?? ''

  return (
    <nav className="flex items-center gap-1">
      {tabs.map((tab) => (
        <NavLink
          {...tab}
          key={tab.route}
          variant={tab.route === activeTab ? 'default' : 'secondary'}
        />
      ))}
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

import { Link, useRouterState } from '@tanstack/react-router'
import { buttonVariants } from './ui/button'

const tabs = [
  { text: 'Overview', route: '' },
  { text: 'Analytics', route: 'analytics' },
  { text: 'Boards', route: 'boards' },
  { text: 'Config', route: 'config' },
]

export function DashboardNavigation() {
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

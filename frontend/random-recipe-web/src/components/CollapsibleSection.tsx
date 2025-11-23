import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import ChevronRight from './icons/ChevronRight'

interface CollapsibleSectionProps {
  title: string
  emoji?: string
  isOpen?: boolean
  onToggle?: () => void
  children: React.ReactNode
  showContentCard?: boolean
}

export default function CollapsibleSection({
  title,
  emoji,
  isOpen,
  onToggle,
  children,
  showContentCard = true,
}: CollapsibleSectionProps) {
  return (
    <>
      {/* Toggle Header Card */}
      <Card
        className="mb-6 cursor-pointer transition-all hover:shadow-md"
        onClick={onToggle}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{title}</span>
              <span className="text-2xl">{emoji}</span>
            </div>
            <ChevronRight
              className={`h-8 w-8 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
            />
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Collapsible Content */}
      {isOpen && (
        <>
          {showContentCard && (
            <Card className="mb-6 bg-gray-50">
              <CardContent className="py-8">{children}</CardContent>
            </Card>
          )}
          {!showContentCard && <div className="mb-6">{children}</div>}
        </>
      )}
    </>
  )
}

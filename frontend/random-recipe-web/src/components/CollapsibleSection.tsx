import { Card, CardHeader, CardTitle } from './ui/card'
import ChevronRight from './icons/ChevronRight'

interface CollapsibleSectionProps {
  title: string
  emoji?: string
  isOpen?: boolean
  onToggle?: () => void
}

export default function CollapsibleSection({
  title,
  emoji,
  isOpen,
  onToggle,
}: CollapsibleSectionProps) {
  return (
    <>
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
    </>
  )
}

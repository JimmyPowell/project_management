import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

interface Milestone {
  id: number
  title: string
  date: string
  description: string
}

interface TimelineProps {
  milestones: Milestone[]
  onEdit?: (milestone: Milestone) => void
  onDelete?: (milestoneId: number) => void
}

export function Timeline({ milestones, onEdit, onDelete }: TimelineProps) {
  return (
    <div className="relative">
      {/* 垂直线 */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div className="space-y-8">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="relative pl-10">
            {/* 时间点 */}
            <div className="absolute left-0 top-1.5 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              {index + 1}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{milestone.title}</h3>
                <div className="flex items-center gap-2">
                  <time className="text-sm text-gray-500">{milestone.date}</time>
                  {onEdit && (
                    <Button variant="ghost" size="icon" onClick={() => onEdit(milestone)} title="编辑">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">编辑</span>
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(milestone.id)} 
                      title="删除"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">删除</span>
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-gray-600">{milestone.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


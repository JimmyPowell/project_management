"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timeline } from "@/components/timeline"
import { milestoneAPI } from "@/lib/api"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

// 里程碑类型
type Milestone = {
  id: number
  title: string
  date: string
  description: string
}

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split('T')[0],
    description: ""
  })

  // 获取里程碑数据
  const fetchMilestones = async () => {
    setLoading(true)
    try {
      const data = await milestoneAPI.getAll()
      // 格式化日期
      const formattedData = data.map((milestone: any) => ({
        ...milestone,
        date: new Date(milestone.date).toISOString().split('T')[0]
      }))
      setMilestones(formattedData)
      setError(null)
    } catch (err: any) {
      setError("获取里程碑失败：" + (err.message || "未知错误"))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 初始化时获取数据
  useEffect(() => {
    fetchMilestones()
  }, [])

  // 处理表单变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // 打开编辑对话框
  const handleEdit = (milestone: Milestone) => {
    setCurrentMilestone(milestone)
    setFormData({
      title: milestone.title,
      date: milestone.date,
      description: milestone.description || ""
    })
    setEditDialogOpen(true)
  }

  // 打开删除确认对话框
  const handleDelete = (milestoneId: number) => {
    const milestone = milestones.find(m => m.id === milestoneId)
    if (milestone) {
      setCurrentMilestone(milestone)
      setDeleteDialogOpen(true)
    }
  }

  // 创建新里程碑
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await milestoneAPI.create(formData)
      fetchMilestones() // 刷新列表
      setCreateDialogOpen(false) // 关闭对话框
      resetForm() // 重置表单
      toast({
        title: "成功",
        description: "里程碑创建成功",
      })
    } catch (err: any) {
      toast({
        title: "错误",
        description: "创建里程碑失败：" + (err.message || "未知错误"),
        variant: "destructive"
      })
    }
  }

  // 更新里程碑
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentMilestone) return

    try {
      await milestoneAPI.update(currentMilestone.id, formData)
      fetchMilestones() // 刷新列表
      setEditDialogOpen(false) // 关闭对话框
      resetForm() // 重置表单
      toast({
        title: "成功",
        description: "里程碑更新成功",
      })
    } catch (err: any) {
      toast({
        title: "错误",
        description: "更新里程碑失败：" + (err.message || "未知错误"),
        variant: "destructive"
      })
    }
  }

  // 确认删除里程碑
  const confirmDelete = async () => {
    if (!currentMilestone) return

    try {
      await milestoneAPI.delete(currentMilestone.id)
      fetchMilestones() // 刷新列表
      setDeleteDialogOpen(false) // 关闭对话框
      toast({
        title: "成功",
        description: "里程碑删除成功",
      })
    } catch (err: any) {
      toast({
        title: "错误",
        description: "删除里程碑失败：" + (err.message || "未知错误"),
        variant: "destructive"
      })
    }
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: "",
      date: new Date().toISOString().split('T')[0],
      description: ""
    })
    setCurrentMilestone(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">项目里程碑</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          添加里程碑
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center">
              <p>加载中...</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-red-500">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            {milestones.length > 0 ? (
              <Timeline 
                milestones={milestones} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">暂无里程碑数据</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 创建里程碑对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => {
        setCreateDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>添加新里程碑</DialogTitle>
              <DialogDescription>添加项目的重要时间点和目标</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">标题</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="里程碑标题"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">日期</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="里程碑详细描述"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 编辑里程碑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>编辑里程碑</DialogTitle>
              <DialogDescription>修改里程碑信息</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">标题</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="里程碑标题"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date">日期</Label>
                <Input
                  id="edit-date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">描述</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="里程碑详细描述"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">更新</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除里程碑 "{currentMilestone?.title}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


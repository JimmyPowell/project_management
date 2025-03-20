"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Plus, Pencil, Trash2 } from "lucide-react"
import { TaskForm, type Task, type TaskStatus, type TaskUrgency } from "@/components/task-form"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { taskAPI } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

export default function TasksPage() {
  // 任务状态
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")

  // 添加任务对话框状态
  const [addTaskOpen, setAddTaskOpen] = useState(false)

  // 编辑任务对话框状态
  const [editTaskOpen, setEditTaskOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined)

  // 删除任务对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null)

  // 获取任务数据
  const fetchTasks = async () => {
    setLoading(true)
    try {
      const data = await taskAPI.getAll()
      // 格式化日期
      const formattedData = data.map((task: any) => ({
        ...task,
        deadline: new Date(task.deadline).toISOString().split('T')[0]
      }))
      setTasks(formattedData)
      setError(null)
    } catch (err: any) {
      setError("获取任务失败：" + (err.message || "未知错误"))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 初始化时获取数据
  useEffect(() => {
    fetchTasks()
  }, [])

  // 过滤任务
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesUrgency = urgencyFilter === "all" || task.urgency === urgencyFilter

    return matchesSearch && matchesStatus && matchesUrgency
  })

  // 获取状态对应的徽章样式
  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case "待处理":
        return "bg-blue-100 text-blue-800"
      case "进行中":
        return "bg-yellow-100 text-yellow-800"
      case "已完成":
        return "bg-green-100 text-green-800"
      case "已延期":
        return "bg-red-100 text-red-800"
      default:
        return ""
    }
  }

  // 获取紧急程度对应的徽章样式
  const getUrgencyBadgeVariant = (urgency: TaskUrgency) => {
    switch (urgency) {
      case "低":
        return "bg-gray-100 text-gray-800"
      case "中":
        return "bg-blue-100 text-blue-800"
      case "高":
        return "bg-orange-100 text-orange-800"
      case "紧急":
        return "bg-red-100 text-red-800"
      default:
        return ""
    }
  }

  // 添加任务
  const handleAddTask = async (taskData: Omit<Task, "id">) => {
    try {
      await taskAPI.create(taskData)
      fetchTasks() // 刷新列表
      setAddTaskOpen(false)
      toast({
        title: "成功",
        description: "任务添加成功",
      })
    } catch (err: any) {
      toast({
        title: "错误",
        description: "添加任务失败：" + (err.message || "未知错误"),
        variant: "destructive"
      })
    }
  }

  // 编辑任务
  const handleEditTask = async (taskData: Omit<Task, "id">) => {
    if (!currentTask) return

    try {
      await taskAPI.update(currentTask.id, taskData)
      fetchTasks() // 刷新列表
      setEditTaskOpen(false)
      setCurrentTask(undefined)
      toast({
        title: "成功",
        description: "任务更新成功",
      })
    } catch (err: any) {
      toast({
        title: "错误",
        description: "更新任务失败：" + (err.message || "未知错误"),
        variant: "destructive"
      })
    }
  }

  // 打开编辑任务对话框
  const openEditDialog = (task: Task) => {
    setCurrentTask(task)
    setEditTaskOpen(true)
  }

  // 打开删除任务对话框
  const openDeleteDialog = (taskId: number) => {
    setTaskToDelete(taskId)
    setDeleteDialogOpen(true)
  }

  // 删除任务
  const handleDeleteTask = async () => {
    if (taskToDelete === null) return

    try {
      await taskAPI.delete(taskToDelete)
      fetchTasks() // 刷新列表
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
      toast({
        title: "成功",
        description: "任务删除成功",
      })
    } catch (err: any) {
      toast({
        title: "错误",
        description: "删除任务失败：" + (err.message || "未知错误"),
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle>当前任务</CardTitle>
          <Button size="sm" onClick={() => setAddTaskOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加任务
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 搜索和筛选 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="搜索任务或负责人..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="待处理">待处理</SelectItem>
                    <SelectItem value="进行中">进行中</SelectItem>
                    <SelectItem value="已完成">已完成</SelectItem>
                    <SelectItem value="已延期">已延期</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="紧急程度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有紧急程度</SelectItem>
                    <SelectItem value="低">低</SelectItem>
                    <SelectItem value="中">中</SelectItem>
                    <SelectItem value="高">高</SelectItem>
                    <SelectItem value="紧急">紧急</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 任务表格 */}
            {loading ? (
              <div className="flex justify-center py-8">
                <p>加载中...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>任务名称</TableHead>
                      <TableHead>截止日期</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>紧急程度</TableHead>
                      <TableHead>负责人</TableHead>
                      <TableHead className="w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.name}</TableCell>
                          <TableCell>{task.deadline}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getUrgencyBadgeVariant(task.urgency)}>{task.urgency}</Badge>
                          </TableCell>
                          <TableCell>{task.assignee}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <span className="sr-only">打开菜单</span>
                                  <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 15 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                  >
                                    <path
                                      d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                                      fill="currentColor"
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(task)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openDeleteDialog(task.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          没有找到匹配的任务
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 添加任务对话框 */}
      <TaskForm
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
        onSubmit={handleAddTask}
        title="添加新任务"
        description="填写以下信息创建新任务"
        submitLabel="添加"
      />

      {/* 编辑任务对话框 */}
      {currentTask && (
        <TaskForm
          open={editTaskOpen}
          onOpenChange={setEditTaskOpen}
          onSubmit={handleEditTask}
          initialData={currentTask}
          title="编辑任务"
          description="修改任务信息"
          submitLabel="保存"
        />
      )}

      {/* 删除任务确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>您确定要删除这个任务吗？此操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


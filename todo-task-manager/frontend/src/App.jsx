import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard, ChartNoAxesColumn, CalendarDays, Clock3, Settings, Moon,
  Search, Bell, Plus, ChevronDown, MoreVertical, Pencil, Trash2, Eye,
  CheckCircle2, Circle, ListTodo, X, Filter, RotateCcw, Menu, AlertCircle
} from 'lucide-react'
import { taskService } from './services/taskService'

const emptyForm = { title: '', description: '', dueDate: '', priority: 'MEDIUM', status: 'PENDING' }
const nice = value => value ? value.charAt(0) + value.slice(1).toLowerCase() : '—'
const formatDate = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB') : '—'
const isOverdue = task => task.dueDate && task.status !== 'COMPLETED' && task.dueDate < new Date().toISOString().slice(0, 10)

export default function App() {
  const [tasks, setTasks] = useState([])
  const [tab, setTab] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [draftSearch, setDraftSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const data = await taskService.list({
        status: tab === 'ALL' ? statusFilter : tab,
        priority: priorityFilter,
        search
      })
      setTasks(data)
      setError('')
    } catch (e) {
      setError(`${e.message}. Check that Spring Boot and MySQL are running.`)
    } finally { setLoading(false) }
  }, [tab, statusFilter, priorityFilter, search])

  useEffect(() => { loadTasks() }, [loadTasks])
  useEffect(() => { setPage(1) }, [tab, statusFilter, priorityFilter, search, pageSize])

  const counts = useMemo(() => ({
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    overdue: tasks.filter(isOverdue).length
  }), [tasks])

  const openCreate = () => {
    setSelected(null); setForm(emptyForm); setError(''); setModal('form')
  }
  const openEdit = task => {
    setSelected(task)
    setForm({ title: task.title || '', description: task.description || '', dueDate: task.dueDate || '', priority: task.priority || 'MEDIUM', status: task.status || 'PENDING' })
    setError(''); setModal('form')
  }
  const saveTask = async e => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Please enter a task title.'); return }
    try {
      const payload = { ...form, title: form.title.trim(), dueDate: form.dueDate || null }
      if (selected) await taskService.update(selected.id, payload)
      else await taskService.create(payload)
      setModal(null); setNotice(selected ? 'Task updated successfully.' : 'Task created successfully.')
      setTimeout(() => setNotice(''), 2800)
      await loadTasks()
    } catch (e) { setError(e.message) }
  }
  const changeStatus = async task => {
    try {
      await taskService.setStatus(task.id, task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')
      await loadTasks()
    } catch (e) { setError(e.message) }
  }
  const deleteTask = async task => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return
    try {
      await taskService.delete(task.id)
      setNotice('Task deleted.'); setTimeout(() => setNotice(''), 2500)
      await loadTasks()
    } catch (e) { setError(e.message) }
  }

  const shownTasks = tasks
  const pageCount = Math.max(1, Math.ceil(shownTasks.length / pageSize))
  const visibleTasks = shownTasks.slice((page - 1) * pageSize, page * pageSize)
  const firstRow = shownTasks.length ? (page - 1) * pageSize + 1 : 0
  const lastRow = Math.min(page * pageSize, shownTasks.length)

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="brand-mark">T</div>
      <nav className="side-nav">
        <button className="side-link active" title="My Tasks"><LayoutDashboard size={21}/><span>My Tasks</span></button>
        <button className="side-link" title="Overview" onClick={() => {setTab('ALL'); setStatusFilter('ALL')}}><ChartNoAxesColumn size={21}/><span>Overview</span></button>
        <button className="side-link" title="Calendar" onClick={() => {setStatusFilter('ALL'); setTab('ALL')}}><CalendarDays size={21}/><span>Calendar</span></button>
        <button className="side-link" title="Pending tasks" onClick={() => setTab('PENDING')}><Clock3 size={21}/><span>Pending</span></button>
        <button className="side-link" title="Completed tasks" onClick={() => setTab('COMPLETED')}><CheckCircle2 size={21}/><span>Completed</span></button>
      </nav>
      <div className="sidebar-bottom">
        <button className="side-link" title="Settings"><Settings size={21}/><span>Settings</span></button>
        <button className="side-link" title="Appearance"><Moon size={21}/><span>Appearance</span></button>
        <div className="sidebar-user"><div className="avatar">K</div><div><strong>My Workspace</strong><small>Personal tasks</small></div></div>
      </div>
    </aside>

    <main className="main-panel">
      <header className="topbar">
        <button className="mobile-menu icon-button" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu"><Menu/></button>
        <div className="breadcrumb">Workspace <span>/</span> <strong>My Tasks</strong></div>
        <div className="top-actions">
          <button className="icon-button" aria-label="Search" onClick={() => document.getElementById('task-search')?.focus()}><Search size={20}/></button>
          <button className="icon-button" aria-label="Notifications"><Bell size={20}/></button>
          <div className="avatar profile-avatar">K</div>
        </div>
      </header>

      <section className="content">
        <div className="page-heading">
          <div><p className="eyebrow">YOUR WORKSPACE</p><h1>My Tasks</h1><p className="subtitle">A clear mind starts with an organized day.</p></div>
          <button className="primary-button" onClick={openCreate}><Plus size={19}/> Create New Task</button>
        </div>

        <div className="stat-grid">
          <div className="stat-card"><div className="stat-icon purple"><ListTodo size={19}/></div><div><span>Total tasks</span><strong>{counts.all}</strong></div></div>
          <div className="stat-card"><div className="stat-icon blue"><Clock3 size={19}/></div><div><span>Pending</span><strong>{counts.pending}</strong></div></div>
          <div className="stat-card"><div className="stat-icon green"><CheckCircle2 size={19}/></div><div><span>Completed</span><strong>{counts.completed}</strong></div></div>
          <div className="stat-card"><div className="stat-icon rose"><AlertCircle size={19}/></div><div><span>Overdue</span><strong>{counts.overdue}</strong></div></div>
        </div>

        <section className="task-card">
          <div className="task-card-top">
            <div className="tabs" role="tablist">
              {[['ALL','All Tasks'],['PENDING','Pending Tasks'],['COMPLETED','Completed Tasks']].map(([value,label]) =>
                <button key={value} className={`tab ${tab === value ? 'selected' : ''}`} onClick={() => setTab(value)}>{label}</button>)}
            </div>
            <div className="results-label"><span className="live-dot"></span> {tasks.length} tasks</div>
          </div>

          <div className="filters">
            <div className="search-box"><Search size={17}/><input id="task-search" value={draftSearch} onChange={e => setDraftSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && setSearch(draftSearch)} placeholder="Search tasks..."/>{draftSearch && <button onClick={() => {setDraftSearch('');setSearch('')}} aria-label="Clear search"><X size={15}/></button>}</div>
            <label className="select-wrap"><Filter size={16}/><select value={statusFilter} onChange={e => {setStatusFilter(e.target.value);setTab('ALL')}}><option value="ALL">All statuses</option><option value="PENDING">Pending</option><option value="COMPLETED">Completed</option></select><ChevronDown size={15}/></label>
            <label className="select-wrap"><select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}><option value="ALL">All priorities</option><option value="LOW">Low priority</option><option value="MEDIUM">Medium priority</option><option value="HIGH">High priority</option></select><ChevronDown size={15}/></label>
            <button className="filter-button" onClick={() => setSearch(draftSearch)}>Apply filters</button>
            <button className="reset-button" title="Reset filters" onClick={() => {setTab('ALL');setStatusFilter('ALL');setPriorityFilter('ALL');setSearch('');setDraftSearch('')}}><RotateCcw size={16}/></button>
          </div>

          {error && <div className="alert alert-danger py-2 mx-4 mt-3 mb-0" role="alert">{error}</div>}
          {notice && <div className="alert alert-success py-2 mx-4 mt-3 mb-0" role="status">{notice}</div>}

          <div className="table-responsive task-table-wrap">
            <table className="table task-table align-middle mb-0">
              <thead><tr><th>Task</th><th>Priority</th><th>Status</th><th>Created</th><th>Due date</th><th className="actions-head">Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="6"><div className="empty-state"><div className="spinner-border spinner-border-sm" role="status"/><p>Loading your tasks...</p></div></td></tr> :
                visibleTasks.length === 0 ? <tr><td colSpan="6"><div className="empty-state"><div className="empty-icon"><ListTodo size={25}/></div><strong>No tasks found</strong><p>Create a task or change your filters to get started.</p><button className="primary-button small" onClick={openCreate}><Plus size={16}/> Add your first task</button></div></td></tr> :
                visibleTasks.map(task => <tr key={task.id}>
                  <td><div className="task-name-cell"><button className={`complete-toggle ${task.status === 'COMPLETED' ? 'is-done' : ''}`} onClick={() => changeStatus(task)} title={task.status === 'COMPLETED' ? 'Mark pending' : 'Mark completed'}>{task.status === 'COMPLETED' ? <CheckCircle2 size={18}/> : <Circle size={18}/>}</button><div className="task-copy"><strong className={task.status === 'COMPLETED' ? 'done-text' : ''}>{task.title}</strong><span>{task.description || 'No description'}</span>{isOverdue(task) && <em className="overdue-label">Overdue</em>}</div></div></td>
                  <td><span className={`priority-pill ${task.priority.toLowerCase()}`}>{nice(task.priority)}</span></td>
                  <td><span className={`status-pill ${task.status.toLowerCase()}`}><span></span>{task.status === 'COMPLETED' ? 'Completed' : 'Pending'}</span></td>
                  <td className="date-cell">{task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-GB') : '—'}</td>
                  <td className={`date-cell ${isOverdue(task) ? 'date-overdue' : ''}`}>{formatDate(task.dueDate)}</td>
                  <td><div className="row-actions"><button title="View task" onClick={() => {setSelected(task);setModal('view')}}><Eye size={16}/></button><button title="Edit task" onClick={() => openEdit(task)}><Pencil size={16}/></button><button title="Delete task" onClick={() => deleteTask(task)}><Trash2 size={16}/></button><button title="More options" onClick={() => changeStatus(task)}><MoreVertical size={17}/></button></div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <div className="pagination-bar">
            <div className="rows-select">Rows per page <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option></select></div>
            <span className="page-range">{firstRow}–{lastRow} of {shownTasks.length}</span>
            <div className="page-buttons"><button disabled={page <= 1} onClick={() => setPage(p => p - 1)} aria-label="Previous page">‹</button><span>{page} / {pageCount}</span><button disabled={page >= pageCount} onClick={() => setPage(p => p + 1)} aria-label="Next page">›</button></div>
          </div>
        </section>
        <footer className="footer-note">Made for focus. One task at a time.</footer>
      </section>
    </main>

    {modal && <div className="modal-backdrop-custom" onMouseDown={e => e.target === e.currentTarget && setModal(null)}>
      <div className="task-modal">
        <div className="modal-heading"><div><p className="eyebrow">{modal === 'view' ? 'TASK DETAILS' : selected ? 'UPDATE TASK' : 'NEW TASK'}</p><h2>{modal === 'view' ? 'Task details' : selected ? 'Edit task' : 'Create a task'}</h2></div><button className="icon-button" onClick={() => setModal(null)} aria-label="Close"><X/></button></div>
        {modal === 'view' && selected ? <div className="view-details">
          <h3>{selected.title}</h3><p>{selected.description || 'No description provided.'}</p>
          <div className="detail-grid"><div><span>Priority</span><strong>{nice(selected.priority)}</strong></div><div><span>Status</span><strong>{nice(selected.status)}</strong></div><div><span>Due date</span><strong>{formatDate(selected.dueDate)}</strong></div><div><span>Created</span><strong>{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-GB') : '—'}</strong></div></div>
          <button className="primary-button full-width" onClick={() => openEdit(selected)}><Pencil size={17}/> Edit task</button>
        </div> : <form onSubmit={saveTask}>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <label className="form-label">Task title <span className="required">*</span><input className="form-control" maxLength="150" autoFocus value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Finish project documentation"/></label>
          <label className="form-label">Description <textarea className="form-control" rows="3" value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Add a few details about this task..."/></label>
          <div className="form-row"><label className="form-label">Due date<input type="date" className="form-control" value={form.dueDate} onChange={e => setForm({...form,dueDate:e.target.value})}/></label><label className="form-label">Priority<select className="form-select" value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label></div>
          <label className="form-label">Status<select className="form-select" value={form.status} onChange={e => setForm({...form,status:e.target.value})}><option value="PENDING">Pending</option><option value="COMPLETED">Completed</option></select></label>
          <div className="modal-footer-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="primary-button">{selected ? 'Save changes' : <><Plus size={17}/> Create task</>}</button></div>
        </form>}
      </div>
    </div>}
  </div>
}

import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { GlassCard } from '../ui/GlassCard'
import { useMealPlan } from '../../context/MealPlanContext'
import { 
  getGroceryList, 
  addGroceryItem, 
  updateGroceryItem, 
  deleteGroceryItem, 
  toggleGroceryItem,
  clearCheckedItems,
  clearAllItems,
  generateGroceryListFromMealPlan,
  CATEGORY_ICONS,
  CATEGORY_ORDER
} from '../../lib/groceryListApi'
import type { GroceryItem } from '../../lib/groceryListApi'
import { 
  ShoppingCart, Plus, Trash2, Edit2, Check, X, Download, 
  RefreshCw, Loader2, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

// Category select options
const CATEGORIES = [
  'Produce',
  'Meat', 
  'Dairy',
  'Bakery',
  'Pantry',
  'Frozen',
  'Beverages',
  'Snacks',
  'Other'
]

export function GroceryListsPage() {
  const { currentMealPlan } = useMealPlan()
  const [items, setItems] = useState<GroceryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [syncing, setSyncing] = useState(false)

  // Load grocery list
  useEffect(() => {
    loadGroceryList()
  }, [])

  const loadGroceryList = async () => {
    setLoading(true)
    try {
      const data = await getGroceryList(1)
      setItems(data)
    } catch (error) {
      console.error('Failed to load grocery list:', error)
      toast.error('Failed to load grocery list')
    } finally {
      setLoading(false)
    }
  }

  // Sync with meal plan
  const handleSyncWithMealPlan = async () => {
    if (!currentMealPlan || !currentMealPlan.meals.length) {
      toast.error('No meal plan to sync with')
      return
    }

    setSyncing(true)
    try {
      await generateGroceryListFromMealPlan(currentMealPlan, 1)
      await loadGroceryList()
      toast.success('Grocery list synced with meal plan!', {
        description: `${currentMealPlan.meals.length} meals processed`
      })
    } catch (error) {
      console.error('Failed to sync:', error)
      toast.error('Failed to sync with meal plan')
    } finally {
      setSyncing(false)
    }
  }

  // Toggle item checked
  const handleToggleItem = async (item: GroceryItem) => {
    try {
      await toggleGroceryItem(item.id, item.is_checked)
      setItems(items.map(i => 
        i.id === item.id ? { ...i, is_checked: !i.is_checked } : i
      ))
    } catch (error) {
      toast.error('Failed to update item')
    }
  }

  // Delete item
  const handleDeleteItem = async (id: string) => {
    try {
      await deleteGroceryItem(id)
      setItems(items.filter(i => i.id !== id))
      toast.success('Item removed')
    } catch (error) {
      toast.error('Failed to delete item')
    }
  }

  // Clear checked items
  const handleClearChecked = async () => {
    const checkedCount = items.filter(i => i.is_checked).length
    if (checkedCount === 0) return
    
    if (!confirm(`Remove ${checkedCount} checked items?`)) return

    try {
      await clearCheckedItems(1)
      setItems(items.filter(i => !i.is_checked))
      toast.success(`${checkedCount} items cleared`)
    } catch (error) {
      toast.error('Failed to clear items')
    }
  }

  // Clear all items
  const handleClearAll = async () => {
    if (!confirm('Remove all items from your grocery list?')) return

    try {
      await clearAllItems(1)
      setItems([])
      toast.success('Grocery list cleared')
    } catch (error) {
      toast.error('Failed to clear list')
    }
  }

  // Add item
  const handleAddItem = async (itemData: Partial<GroceryItem>) => {
    try {
      const newItem = await addGroceryItem({
        family_id: 1,
        item_name: itemData.item_name!,
        quantity: itemData.quantity,
        unit: itemData.unit,
        category: itemData.category || 'Other',
        is_checked: false,
        source_type: 'manual'
      })
      if (newItem) {
        setItems([...items, newItem])
        setShowAddForm(false)
        toast.success('Item added')
      }
    } catch (error) {
      toast.error('Failed to add item')
    }
  }

  // Update item
  const handleUpdateItem = async (id: string, updates: Partial<GroceryItem>) => {
    try {
      const updated = await updateGroceryItem(id, updates)
      if (updated) {
        setItems(items.map(i => i.id === id ? updated : i))
        setEditingItem(null)
        toast.success('Item updated')
      }
    } catch (error) {
      toast.error('Failed to update item')
    }
  }

  // Toggle category collapse
  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories)
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category)
    } else {
      newCollapsed.add(category)
    }
    setCollapsedCategories(newCollapsed)
  }

  // Export to text
  const handleExport = () => {
    const text = CATEGORY_ORDER
      .map(category => {
        const categoryItems = items.filter(i => i.category === category && !i.is_checked)
        if (categoryItems.length === 0) return null
        return `${CATEGORY_ICONS[category]} ${category}:\n${categoryItems.map(i => 
          `  ${i.is_checked ? '✓' : '○'} ${i.quantity ? `${i.quantity} ${i.unit || ''} ` : ''}${i.item_name}`
        ).join('\n')}`
      })
      .filter(Boolean)
      .join('\n\n')

    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!', {
      description: 'Paste anywhere to share your list'
    })
  }

  // Group items by category
  const groupedItems = CATEGORY_ORDER.reduce((acc, category) => {
    const categoryItems = items.filter(i => i.category === category)
    if (categoryItems.length > 0) {
      acc[category] = categoryItems
    }
    return acc
  }, {} as Record<string, GroceryItem[]>)

  // Stats
  const totalItems = items.length
  const checkedCount = items.filter(i => i.is_checked).length
  const uncheckedCount = totalItems - checkedCount
  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0

  // Loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <div className="h-10 w-48 bg-[var(--bg-glass-light)] rounded-lg animate-pulse mb-2" />
          <div className="h-6 w-64 bg-white/30 rounded-lg animate-pulse" />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map(i => (
              <GlassCard key={i} hover={false}>
                <div className="h-32 animate-pulse bg-white/30 rounded-lg" />
              </GlassCard>
            ))}
          </div>
          <GlassCard hover={false}>
            <div className="h-48 animate-pulse bg-white/30 rounded-lg" />
          </GlassCard>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-[#C19A6B]" />
            Grocery List
          </h1>
          <p className="text-secondary">
            {uncheckedCount} items remaining • {checkedCount} checked
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="glass" 
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
          
          {currentMealPlan && currentMealPlan.meals.length > 0 && (
            <Button 
              variant="glass" 
              size="sm"
              onClick={handleSyncWithMealPlan}
              disabled={syncing}
              className="gap-2"
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sync with Meals
            </Button>
          )}
          
          <Button 
            variant="glass" 
            size="sm"
            onClick={handleExport}
            disabled={items.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          {checkedCount > 0 && (
            <Button 
              variant="glass" 
              size="sm"
              onClick={handleClearChecked}
              className="gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Clear Checked ({checkedCount})
            </Button>
          )}
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <AddItemForm
          onAdd={handleAddItem}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Empty State */}
          {items.length === 0 && (
            <GlassCard hover={false} className="border-2 border-dashed border-[var(--border-glass)]">
              <div className="py-12 text-center">
                <div className="p-4 bg-[rgba(212,165,116,0.2)] rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <ShoppingCart className="h-10 w-10 text-[#C19A6B]-dark" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Your grocery list is empty
                </h3>
                <p className="text-secondary mb-6 max-w-md mx-auto">
                  {currentMealPlan && currentMealPlan.meals.length > 0 
                    ? 'Sync with your meal plan to auto-generate your shopping list'
                    : 'Add items manually or generate a meal plan first'}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowAddForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Item
                  </Button>
                  {currentMealPlan && currentMealPlan.meals.length > 0 && (
                    <Button 
                      variant="glass" 
                      onClick={handleSyncWithMealPlan}
                      disabled={syncing}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Sync with Meals
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          )}

          {/* Grouped Items */}
          {Object.entries(groupedItems).map(([category, categoryItems]) => {
            const isCollapsed = collapsedCategories.has(category)
            const categoryChecked = categoryItems.filter(i => i.is_checked).length
            
            return (
              <GlassCard key={category} hover={false}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-1 hover:bg-white/20 rounded-lg transition-colors -m-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
                    <h3 className="font-semibold text-primary">
                      {category}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {categoryItems.length - categoryChecked} / {categoryItems.length}
                    </Badge>
                  </div>
                  {isCollapsed ? (
                    <ChevronDown className="h-5 w-5 text-muted" />
                  ) : (
                    <ChevronUp className="h-5 w-5 text-muted" />
                  )}
                </button>

                {/* Items */}
                {!isCollapsed && (
                  <div className="mt-3 space-y-1">
                    {categoryItems.map(item => (
                      <GroceryItemRow
                        key={item.id}
                        item={item}
                        isEditing={editingItem === item.id}
                        onToggle={() => handleToggleItem(item)}
                        onDelete={() => handleDeleteItem(item.id)}
                        onEdit={() => setEditingItem(item.id)}
                        onSave={(updates) => handleUpdateItem(item.id, updates)}
                        onCancel={() => setEditingItem(null)}
                      />
                    ))}
                  </div>
                )}
              </GlassCard>
            )
          })}
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <GlassCard hover={false} className="sticky top-20">
            <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[#C19A6B]" />
              Shopping Progress
            </h3>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-secondary">Progress</span>
                <span className="font-semibold text-primary">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-honey to-honey-dark transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-secondary">Total Items</span>
                <span className="font-semibold text-primary">{totalItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary">Remaining</span>
                <span className="font-semibold text-primary">{uncheckedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-600">Checked</span>
                <span className="font-semibold text-green-600">{checkedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary">Categories</span>
                <span className="font-semibold text-primary">{Object.keys(groupedItems).length}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] space-y-2">
              {items.length > 0 && (
                <>
                  <Button 
                    variant="glass"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      // Check all unchecked items
                      items.filter(i => !i.is_checked).forEach(i => handleToggleItem(i))
                    }}
                  >
                    <Check className="h-4 w-4" />
                    Check All Items
                  </Button>
                  <Button 
                    variant="glass"
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
                    onClick={handleClearAll}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </GlassCard>

          {/* Meal Plan Connection */}
          {currentMealPlan && currentMealPlan.meals.length > 0 && (
            <GlassCard hover={false} className="bg-[rgba(212,165,116,0.05)] border-[rgba(212,165,116,0.2)]">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[rgba(212,165,116,0.2)] rounded-lg">
                  <AlertCircle className="h-4 w-4 text-[#C19A6B]-dark" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">
                    Meal Plan Connected
                  </p>
                  <p className="text-xs text-secondary mt-1">
                    {currentMealPlan.meals.length} meals this week
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 h-7 text-xs text-[#C19A6B]-dark hover:text-[#C19A6B]"
                    onClick={handleSyncWithMealPlan}
                    disabled={syncing}
                  >
                    {syncing ? 'Syncing...' : 'Re-sync ingredients'}
                  </Button>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}

// Grocery Item Row Component
function GroceryItemRow({ 
  item, 
  isEditing, 
  onToggle, 
  onDelete, 
  onEdit, 
  onSave, 
  onCancel 
}: {
  item: GroceryItem
  isEditing: boolean
  onToggle: () => void
  onDelete: () => void
  onEdit: () => void
  onSave: (updates: Partial<GroceryItem>) => void
  onCancel: () => void
}) {
  const [editName, setEditName] = useState(item.item_name)
  const [editQty, setEditQty] = useState(item.quantity?.toString() || '')
  const [editUnit, setEditUnit] = useState(item.unit || '')

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-2 bg-white/30 rounded-lg">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="flex-1 h-8 glass-input"
          placeholder="Item name"
          autoFocus
        />
        <Input
          type="number"
          value={editQty}
          onChange={(e) => setEditQty(e.target.value)}
          className="w-16 h-8 glass-input"
          placeholder="Qty"
        />
        <Input
          value={editUnit}
          onChange={(e) => setEditUnit(e.target.value)}
          className="w-16 h-8 glass-input"
          placeholder="Unit"
        />
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0"
          onClick={() => onSave({
            item_name: editName,
            quantity: editQty ? parseFloat(editQty) : undefined,
            unit: editUnit || undefined
          })}
        >
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0"
          onClick={onCancel}
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )
  }

  return (
    <div 
      className={`flex items-center gap-3 p-2 rounded-lg transition-all group ${
        item.is_checked ? 'opacity-60' : 'hover:bg-[var(--bg-glass-light)]'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
          item.is_checked 
            ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]' 
            : 'border-[var(--border-strong)] hover:border-[var(--accent-primary)]'
        }`}
      >
        {item.is_checked && <Check className="h-3 w-3 text-white" />}
      </button>

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm truncate ${
          item.is_checked ? 'line-through text-muted' : 'text-primary'
        }`}>
          {item.item_name}
        </p>
        {(item.quantity || item.unit) && (
          <p className="text-xs text-muted">
            {item.quantity} {item.unit}
          </p>
        )}
      </div>

      {/* Source Badge */}
      {item.source_type === 'meal-plan' && (
        <Badge variant="outline" className="text-xs opacity-50">
          From meals
        </Badge>
      )}

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-7 w-7 p-0"
          onClick={onEdit}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

// Add Item Form Component
function AddItemForm({ 
  onAdd, 
  onCancel 
}: { 
  onAdd: (item: Partial<GroceryItem>) => void
  onCancel: () => void 
}) {
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [category, setCategory] = useState('Other')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName.trim()) return

    onAdd({
      item_name: itemName.trim(),
      quantity: quantity ? parseFloat(quantity) : undefined,
      unit: unit || undefined,
      category
    })

    // Reset form
    setItemName('')
    setQuantity('')
    setUnit('')
    setCategory('Other')
  }

  return (
    <GlassCard hover={false} className="animate-fade-in">
      <form onSubmit={handleSubmit}>
        <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Item
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input
            placeholder="Item name *"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="md:col-span-2 glass-input"
            required
            autoFocus
          />
          <Input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="glass-input"
            step="0.1"
          />
          <Input
            placeholder="Unit (oz, lbs...)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="glass-input"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="glass-input px-3 py-2 rounded-xl text-sm"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {CATEGORY_ICONS[cat]} {cat}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button type="submit" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </GlassCard>
  )
}

"use client";

import { GripVertical, Trash2, Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STEP_TYPE_LABELS } from "@/types";
import type { StepFormItem, StepType } from "@/types";

interface StepTemplateListProps {
  steps: StepFormItem[];
  onChange: (steps: StepFormItem[]) => void;
}

function SortableStep({
  step,
  onUpdate,
  onRemove,
}: {
  step: StepFormItem;
  onUpdate: (field: keyof StepFormItem, value: string | number | null) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-[var(--border)] rounded-lg p-3 bg-[var(--card)] space-y-2"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-[var(--muted-foreground)] cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <Select
          value={step.type}
          onValueChange={(v) => {
            onUpdate("type", v);
            if (!step.label || step.label === STEP_TYPE_LABELS[step.type as StepType]) {
              onUpdate("label", STEP_TYPE_LABELS[v as StepType]);
            }
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(STEP_TYPE_LABELS) as StepType[]).map((type) => (
              <SelectItem key={type} value={type}>
                {STEP_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Step label"
          value={step.label}
          onChange={(e) => onUpdate("label", e.target.value)}
          className="flex-1"
        />

        <Input
          type="number"
          min={1}
          placeholder="Min"
          className="w-20"
          value={step.durationMins ?? ""}
          onChange={(e) =>
            onUpdate("durationMins", e.target.value ? parseInt(e.target.value) : null)
          }
        />

        <Input
          type="number"
          min={0}
          placeholder="°C"
          className="w-16"
          value={step.tempC ?? ""}
          onChange={(e) =>
            onUpdate("tempC", e.target.value ? parseFloat(e.target.value) : null)
          }
        />

        <button
          type="button"
          onClick={onRemove}
          className="text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <Textarea
        placeholder="Optional description or notes for this step..."
        value={step.description}
        onChange={(e) => onUpdate("description", e.target.value)}
        className="text-sm min-h-[60px]"
      />
    </div>
  );
}

export function StepTemplateList({ steps, onChange }: StepTemplateListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex((s) => s.id === active.id);
      const newIndex = steps.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(steps, oldIndex, newIndex).map((s, i) => ({
        ...s,
        sortOrder: i,
      }));
      onChange(reordered);
    }
  }

  function addStep() {
    const newStep: StepFormItem = {
      id: crypto.randomUUID(),
      type: "CUSTOM",
      label: "Custom Step",
      description: "",
      durationMins: null,
      tempC: null,
      sortOrder: steps.length,
    };
    onChange([...steps, newStep]);
  }

  function updateStep(id: string, field: keyof StepFormItem, value: string | number | null) {
    onChange(steps.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  function removeStep(id: string) {
    onChange(steps.filter((s) => s.id !== id).map((s, i) => ({ ...s, sortOrder: i })));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 text-xs font-medium text-[var(--muted-foreground)] px-7 mb-1">
        <span className="w-40">Type</span>
        <span className="flex-1">Label</span>
        <span className="w-20 text-center">Duration (min)</span>
        <span className="w-16 text-center">Temp (°C)</span>
        <span className="w-8" />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {steps.map((step) => (
            <SortableStep
              key={step.id}
              step={step}
              onUpdate={(field, value) => updateStep(step.id, field, value)}
              onRemove={() => removeStep(step.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button type="button" variant="outline" size="sm" onClick={addStep} className="w-full">
        <Plus className="h-4 w-4 mr-1" />
        Add Step
      </Button>
    </div>
  );
}

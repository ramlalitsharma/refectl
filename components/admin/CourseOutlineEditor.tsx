'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/Button';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';

// --- Types ---
interface ManualLesson {
  title: string;
  content?: string;
  id?: string; // Add ID for DnD
}

interface ManualModule {
  title: string;
  lessons: ManualLesson[];
  id?: string; // Add ID for DnD
}

interface CourseOutlineEditorProps {
  modules: ManualModule[];
  onChange: (modules: ManualModule[]) => void;
  readOnly?: boolean;
}

// --- Sortable Components ---

function SortableModuleItem({
  module,
  moduleIndex,
  updateModuleTitle,
  removeModule,
  addLesson,
  updateLesson,
  removeLesson,
  readOnly,
}: {
  module: ManualModule;
  moduleIndex: number;
  updateModuleTitle: (index: number, val: string) => void;
  removeModule: (index: number) => void;
  addLesson: (index: number) => void;
  updateLesson: (mIndex: number, lIndex: number, field: keyof ManualLesson, val: string) => void;
  removeLesson: (mIndex: number, lIndex: number) => void;
  readOnly?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `module-${moduleIndex}`,
    data: { type: 'module', index: moduleIndex },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
      <div className="flex items-center gap-3 mb-3">
        {/* Drag Handle */}
        {!readOnly && (
          <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600 p-1">
            ⋮⋮
          </div>
        )}
        <div className="flex-1">
           <label className="space-y-1 text-sm text-slate-600 block">
            Module title
            <input
              value={module.title}
              onChange={(e) => updateModuleTitle(moduleIndex, e.target.value)}
              disabled={readOnly}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
        </div>
        {!readOnly && (
             <Button variant="ghost" size="sm" onClick={() => removeModule(moduleIndex)} className="text-red-500 hover:bg-red-50">
                Delete Module
             </Button>
        )}
      </div>

      <div className="pl-4 border-l-2 border-slate-100 space-y-3">
        <SortableContext items={module.lessons.map((_, i) => `lesson-${moduleIndex}-${i}`)} strategy={verticalListSortingStrategy}>
          {module.lessons.map((lesson, lessonIndex) => (
             <SortableLessonItem
                key={`${moduleIndex}-${lessonIndex}`}
                id={`lesson-${moduleIndex}-${lessonIndex}`}
                lesson={lesson}
                moduleIndex={moduleIndex}
                lessonIndex={lessonIndex}
                updateLesson={updateLesson}
                removeLesson={removeLesson}
                readOnly={readOnly}
             />
          ))}
        </SortableContext>
        {!readOnly && (
            <Button variant="outline" size="sm" onClick={() => addLesson(moduleIndex)}>
                + Add Lesson
            </Button>
        )}
      </div>
    </div>
  );
}

function SortableLessonItem({
    id,
    lesson,
    moduleIndex,
    lessonIndex,
    updateLesson,
    removeLesson,
    readOnly
}: {
    id: string;
    lesson: ManualLesson;
    moduleIndex: number;
    lessonIndex: number;
    updateLesson: any;
    removeLesson: any;
    readOnly?: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: id,
        data: { type: 'lesson', moduleIndex, lessonIndex }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3 mb-2">
                 {!readOnly && (
                    <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600 p-1">
                        ⋮⋮
                    </div>
                 )}
                 <label className="flex-1 text-sm text-slate-600">
                    <input
                        value={lesson.title}
                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)}
                        disabled={readOnly}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white"
                        placeholder="Lesson Title"
                    />
                 </label>
                 {!readOnly && (
                    <Button variant="ghost" size="sm" onClick={() => removeLesson(moduleIndex, lessonIndex)}>
                        ×
                    </Button>
                 )}
            </div>
            <div className="pl-8">
                 <MarkdownEditor
                    value={lesson.content || ''}
                    onChange={(next) => updateLesson(moduleIndex, lessonIndex, 'content', next)}
                    height={150}
                    placeholder="Lesson content..."
                    disabled={readOnly}
                 />
            </div>
        </div>
    )
}

export function CourseOutlineEditor({ modules, onChange, readOnly = false }: CourseOutlineEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- Handlers ---

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    if (activeIdStr === overIdStr) return;

    // Handle Module Reordering
    if (activeIdStr.startsWith('module-') && overIdStr.startsWith('module-')) {
        const oldIndex = Number(activeIdStr.split('-')[1]);
        const newIndex = Number(overIdStr.split('-')[1]);
        onChange(arrayMove(modules, oldIndex, newIndex));
        return;
    }

    // Handle Lesson Reordering (within same module for simplicity first)
    // Note: Cross-module dragging requires more complex logic.
    if (activeIdStr.startsWith('lesson-') && overIdStr.startsWith('lesson-')) {
        const [_, activeModIdx, activeLesIdx] = activeIdStr.split('-').map(Number);
        const [__, overModIdx, overLesIdx] = overIdStr.split('-').map(Number);

        if (activeModIdx === overModIdx) {
            const newModules = [...modules];
            newModules[activeModIdx].lessons = arrayMove(newModules[activeModIdx].lessons, activeLesIdx, overLesIdx);
            onChange(newModules);
        }
    }
  };

  const updateModuleTitle = (index: number, title: string) => {
    const newModules = [...modules];
    newModules[index].title = title;
    onChange(newModules);
  };

  const removeModule = (index: number) => {
    const newModules = modules.filter((_, i) => i !== index);
    onChange(newModules);
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.push({ title: `Lesson ${newModules[moduleIndex].lessons.length + 1}`, content: '' });
    onChange(newModules);
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, key: keyof ManualLesson, value: string) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons[lessonIndex] = { ...newModules[moduleIndex].lessons[lessonIndex], [key]: value };
    onChange(newModules);
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
     const newModules = [...modules];
     newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
     onChange(newModules);
  };

  const addModule = () => {
      onChange([...modules, { title: `Module ${modules.length + 1}`, lessons: [] }]);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Outline Builder (Drag & Drop)</h3>
            {!readOnly && (
                <Button variant="outline" size="sm" onClick={addModule}>
                    + Add Module
                </Button>
            )}
        </div>

        <SortableContext items={modules.map((_, i) => `module-${i}`)} strategy={verticalListSortingStrategy}>
          {modules.map((module, i) => (
            <SortableModuleItem
                key={`module-${i}`}
                module={module}
                moduleIndex={i}
                updateModuleTitle={updateModuleTitle}
                removeModule={removeModule}
                addLesson={addLesson}
                updateLesson={updateLesson}
                removeLesson={removeLesson}
                readOnly={readOnly}
            />
          ))}
        </SortableContext>
        
        {/* Placeholder for overlay if we want visual feedback while dragging */}
        <DragOverlay>
            {activeId ? (
                <div className="p-4 bg-white/90 border border-teal-500 rounded shadow-lg opacity-80">Dragging Item...</div>
            ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

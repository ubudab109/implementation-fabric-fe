import React from "react";

type Props = {
    onAddRect: () => void;
    onAddCircle: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onClear: () => void;
    onExport: () => void;
};

export default function Toolbar({
    onAddRect,
    onAddCircle,
    onUndo,
    onRedo,
    onClear,
    onExport,
}: Props): React.ReactNode {
    return (
        <div className="flex flex-wrap gap-2 p-3 bg-white rounded-xl shadow-sm">
            <button className="px-3 py-2 rounded-md border" onClick={onAddRect}>
                Add Rect
            </button>
            <button
                className="px-3 py-2 rounded-md border"
                onClick={onAddCircle}
            >
                Add Circle
            </button>
            <button className="px-3 py-2 rounded-md border" onClick={onUndo}>
                Undo
            </button>
            <button className="px-3 py-2 rounded-md border" onClick={onRedo}>
                Redo
            </button>
            <button className="px-3 py-2 rounded-md border" onClick={onClear}>
                Clear
            </button>
            <button
                className="ml-auto px-4 py-2 rounded-md bg-indigo-600 text-white"
                onClick={onExport}
            >
                Submit to backend
            </button>
        </div>
    );
}

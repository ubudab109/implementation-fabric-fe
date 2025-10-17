import React from "react";
import { Type, Square, Image as ImageIcon } from "lucide-react";
import type { FabricDesign } from "../interface/FabricDesignInterface";



interface SidebarProps {
  onAddText?: () => void;
  onAddShape?: () => void;
  onColorChange?: (color: string) => void;
  onDeleteSelected?: () => void;
  onSubmitDesign?: () => void;
  onStartNew?: () => void;
  onLoadDesign?: (design: FabricDesign) => void;
  loading? : boolean,
  designs?: FabricDesign[]
}

const Sidebar: React.FC<SidebarProps> = ({
  onAddShape,
  onAddText,
  onColorChange,
  onDeleteSelected,
  onSubmitDesign,
  onLoadDesign,
  onStartNew,
  loading = false,
  designs = [],
}) => {


  return (
    <aside className="w-full lg:w-96 p-6 bg-white rounded-lg shadow-xl border border-gray-100 flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Design Tools
      </h2>

      {/* Add Elements Section */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Add Elements</h3>
        <div className="flex gap-4">
          <button
            onClick={onAddText}
            className="flex flex-col items-center justify-center w-24 h-24 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Type className="w-6 h-6 mb-1 text-gray-600" />
            <span className="text-sm">Add Text</span>
          </button>
          <button
            onClick={onAddShape}
            className="flex flex-col items-center justify-center w-24 h-24 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Square className="w-6 h-6 mb-1 text-gray-600" />
            <span className="text-sm">Add Shape</span>
          </button>
        </div>
      </div>

      <hr className="my-4 border-gray-200" />

      {/* Color Picker Section */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Color Control</h3>
        <p className="text-sm text-gray-500 mb-3">
          Select a color to apply to the active object or new shapes/text.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="color"
            defaultValue="#000000"
            onChange={(e) => onColorChange && onColorChange(e.target.value)}
            className="w-12 h-12 cursor-pointer border border-gray-300 rounded-md"
          />
          <span className="text-sm text-gray-600">Pick Color</span>
        </div>
      </div>

      <hr className="my-4 border-gray-200" />

      {/* Manipulation Section */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-700 mb-3">Manipulation</h3>
        <p className="text-sm text-gray-500 mb-3">
          Select an object on the canvas.
        </p>
        <button
          onClick={onDeleteSelected}
          className="px-4 py-2 mr-2 text-sm bg-red-100 text-red-600 font-semibold rounded-md border border-red-200 hover:bg-red-200 transition"
        >
          Delete Selected Object
        </button>

        <button
          onClick={onStartNew}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-600 font-semibold rounded-md border border-gray-200 hover:bg-gray-200 transition"
        >
          Start New
        </button>
      </div>

      {/* Finish Design Section */}
      <div className="pt-4 border-t border-gray-200 mb-4">
        <h3 className="font-medium text-gray-700 mb-3">Finish Design</h3>
        <button
          onClick={onSubmitDesign}
          className="w-full px-4 py-3 bg-indigo-600 text-white font-bold rounded-md shadow-lg hover:bg-indigo-700 transition"
        >
          Submit Design
        </button>
      </div>

      {/* Saved Designs Section */}
      <div className="flex-1 overflow-y-auto border-t border-gray-200 pt-4">
        <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Saved Designs
        </h3>

        {loading ? (
          <p className="text-sm text-gray-500">Loading designs...</p>
        ) : designs.length === 0 ? (
          <p className="text-sm text-gray-500">No saved designs yet.</p>
        ) : (
          <div className="space-y-3 pr-1">
            {designs.map((design) => (
              <button
                key={design.id}
                onClick={() => onLoadDesign && onLoadDesign(design)}
                className="w-full flex items-center gap-3 p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition"
              >
                <img
                  src={design.previewImage}
                  alt={design.designName}
                  className="w-10 h-10 rounded object-cover border"
                />
                <span className="text-sm text-gray-700 truncate">
                  {design.designName}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

// App.tsx
import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import { Canvas, Rect, FabricText } from "fabric";
import axios from "axios";
import type { FabricDesign } from "./interface/FabricDesignInterface";

const App: React.FC = () => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState<Canvas | null>(null);
    const [activeColor, setActiveColor] = useState<string>("#000000");
    const [designName, setDesignName] = useState<string>("");

    const [designs, setDesigns] = useState<FabricDesign[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentId, setCurrentId] = useState<number | null>(null);

    const fetchDesigns = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/fabrics`
            );
            setDesigns(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch designs:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch list of saved designs
    useEffect(() => {
        fetchDesigns();
    }, []);

    useEffect(() => {
        if (canvasRef.current) {
            const initCanvas = new Canvas(canvasRef.current, {
                width: 500,
                height: 500,
            });

            initCanvas.backgroundColor = "#FFF";
            initCanvas.renderAll();
            setCanvas(initCanvas);

            return () => {
                initCanvas.dispose();
            };
        }
    }, []);

    const handleStartNew = () => {
        if (canvas) {
            canvas.clear(); // Removes all objects
            canvas.backgroundColor = "#FFF"; // Reset background
            canvas.renderAll();
            setDesignName("");
            setCurrentId(null);
        }
    };

    const handleLoadDesign = async (design: { id: number }) => {
        if (!canvas) return;

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/fabrics/${design.id}`
            );
            const data = response.data.data;
            setCurrentId(data.id);

            if (!data?.canvaJson) {
                alert("Design JSON not found.");
                return;
            }

            setDesignName(data.designName);
            canvas.clear();
            canvas.loadFromJSON(data.canvaJson, () => {
                setTimeout(() => {
                    canvas.renderAll();
                }, 50);
            });
        } catch (err) {
            console.error("Failed to load design:", err);
            alert("Failed to load design.");
        }
    };

    const addShape = () => {
        if (canvas) {
            const rect = new Rect({
                top: 100,
                left: 50,
                width: 100,
                height: 60,
                fill: activeColor,
            });
            canvas.add(rect);
            canvas.setActiveObject(rect);
            canvas.renderAll();
        }
    };

    const addText = () => {
        if (canvas) {
            const text = new FabricText("Your Text Here", {
                top: 50,
                left: 50,
                fill: activeColor,
                fontSize: 20,
            });
            canvas.add(text);
            canvas.setActiveObject(text);
            canvas.renderAll();
        }
    };

    const handleColorChange = (color: string) => {
        setActiveColor(color);

        if (canvas) {
            const activeObj = canvas.getActiveObject();
            if (activeObj) {
                activeObj.set("fill", color);
                canvas.renderAll();
            }
        }
    };

    const deleteSelectedObject = () => {
        if (canvas) {
            const activeObj = canvas.getActiveObject();
            if (activeObj) {
                canvas.remove(activeObj);
                canvas.discardActiveObject();
                canvas.renderAll();
            }
        }
    };

    const handleSubmitDesign = async () => {
        if (!canvas) return;
        const jsonData = canvas.toJSON();
        const imageData = canvas.toDataURL({
            format: "png",
            quality: 1.0,
            multiplier: 1,
        });
        const payload = {
            designName: designName,
            canvaJson: JSON.stringify(jsonData),
            previewImage: imageData,
        };

        try {
            if (currentId) {
                await axios.put(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/api/fabrics/${currentId}`,
                    payload
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/fabrics`,
                    payload
                );
            }
            alert("Design submitted successfully!");
            await fetchDesigns();
        } catch (error) {
            console.error(error);
            alert("Design failed to suibmit. Please check all input!");
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-indigo-700">
                    Design Studio
                </h1>
                <p className="text-gray-600">
                    Customize your merchandise in real-time using React and
                    Fabric.js.
                </p>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <Sidebar
                    onAddShape={() => addShape()}
                    onAddText={() => addText()}
                    onColorChange={handleColorChange}
                    onDeleteSelected={deleteSelectedObject}
                    onSubmitDesign={handleSubmitDesign}
                    onLoadDesign={handleLoadDesign}
                    onStartNew={handleStartNew}
                    designs={designs}
                    loading={loading}
                />

                {/* Canvas Area */}
                <main className="flex-1 min-h-[70vh] bg-white rounded-lg shadow-xl border border-gray-100 p-8 flex justify-center items-center relative overflow-hidden">
                    {/* Fabric.js Canvas Placeholder (simulates the visual container) */}
                    <div className="relative p-8 border border-gray-300 rounded-xl shadow-2xl bg-gray-100/50">
                        <canvas ref={canvasRef} id="canvas"></canvas>

                        {/* Fabric.js Classes Tag (Top Right) */}
                        <div className="absolute top-0 right-0 mt-2 mr-2 px-3 py-1 text-xs font-semibold text-white bg-purple-600 rounded-full">
                            <input
                                type="text"
                                name="designName"
                                onChange={(e) => setDesignName(e.target.value)}
                                value={designName}
                                placeholder="Design Name"
                                id=""
                            />
                        </div>
                    </div>
                </main>
            </div>

            {/* Footer/Attribution */}
            <footer className="mt-8 text-center text-sm text-gray-500">
                Interactive Design Studio example built with React, Fabric.js,
                and Tailwind CSS.
            </footer>
        </div>
    );
};

export default App;

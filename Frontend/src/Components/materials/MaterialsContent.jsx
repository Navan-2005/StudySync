import { useState } from "react";
import { UploadNotes } from "./UploadNotes";
import { TopicExplorer } from "./TopicExplorer";

export function MaterialsContent() {
  const [activeTab, setActiveTab] = useState("upload");
  
  return (
    <div className="w-full">
      {/* Mobile Tab Navigation */}
      <div className="md:hidden flex border-b mb-6">
        <button
          className={`py-3 px-4 font-medium text-sm flex-1 ${
            activeTab === "upload"
              ? "border-b-2 border-brand-purple text-brand-purple"
              : "text-brand-textSecondary"
          }`}
          onClick={() => setActiveTab("upload")}
        >
          My Notes
        </button>
        <button
          className={`py-3 px-4 font-medium text-sm flex-1 ${
            activeTab === "explorer"
              ? "border-b-2 border-brand-purple text-brand-purple"
              : "text-brand-textSecondary"
          }`}
          onClick={() => setActiveTab("explorer")}
        >
          Topic Explorer
        </button>
      </div>
      {/* Content Grid - Desktop: side by side, Mobile: active tab only */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={activeTab === "upload" ? "block" : "hidden md:block"}>
          <UploadNotes />
        </div>
        <div className={activeTab === "explorer" ? "block" : "hidden md:block"}>
          <TopicExplorer />
        </div>
      </div>
    </div>
  );
}
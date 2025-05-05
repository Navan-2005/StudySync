import { useState, useRef, useEffect } from "react";
import { Save, X, Minimize } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export function NoteEditor({ 
  isOpen, 
  onClose, 
  folders, 
  onSave,
  initialContent = "", 
  fileId 
}) {
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [fileName, setFileName] = useState(`Note-${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showFolderSelection, setShowFolderSelection] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const textareaRef = useRef(null);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && !isMinimized && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Reset states when closed
  useEffect(() => {
    if (!isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (content.trim() === "") {
      toast({
        title: "Error",
        description: "Note content cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (fileName.trim() === "") {
      toast({
        title: "Error",
        description: "File name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setShowFolderSelection(true);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim() === "") {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    // Call the parent component to create a new folder and get its ID
    // This would be implemented in the parent component
    // For now we'll just simulate it with a toast
    toast({
      title: "Creating folder",
      description: `Creating "${newFolderName}" folder...`,
    });

    // Here we would actually create the folder and then store the note in it
    // For demo purposes let's just close the dialog
    setIsCreatingFolder(false);
    setNewFolderName("");
    
    // This would be implemented by the parent component
    // onCreateFolder(newFolderName, content, fileName);
  };

  const handleFinalSave = (folderId) => {
    onSave(content, fileName, folderId);
    setShowFolderSelection(false);
    onClose();
    
    toast({
      title: "Note Saved",
      description: `"${fileName}" has been saved successfully.`
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <Card className={`fixed bottom-4 right-4 w-96 z-10 shadow-lg transition-all duration-300 ${isMinimized ? 'h-12 overflow-hidden' : 'h-96'}`}>
        <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
          <CardTitle className="text-sm truncate max-w-52">{fileName}</CardTitle>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <Minimize className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <>
            <CardContent>
              <div className="mb-2 flex items-center">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="text-sm border rounded px-2 py-1 w-full"
                  placeholder="Enter file name"
                />
              </div>
              <Textarea
                ref={textareaRef}
                placeholder="Start typing your notes here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="h-64 resize-none"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
              >
                <Save className="mr-1 h-4 w-4" /> Save Note
              </Button>
            </CardFooter>
          </>
        )}
      </Card>

      {/* Folder Selection Dialog */}
      <Dialog open={showFolderSelection} onOpenChange={setShowFolderSelection}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save to Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex flex-col gap-2">
              <Button
                variant={selectedFolderId === null ? "default" : "outline"}
                className="justify-start"
                onClick={() => setSelectedFolderId(null)}
              >
                Root Folder
              </Button>
              
              {folders.map(folder => (
                <Button
                  key={folder.id}
                  variant={selectedFolderId === folder.id ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setSelectedFolderId(folder.id)}
                >
                  {folder.name}
                </Button>
              ))}
              
              <Button
                variant="ghost"
                className="justify-start text-brand-purple"
                onClick={() => setIsCreatingFolder(true)}
              >
                + Create New Folder
              </Button>
            </div>

            {isCreatingFolder && (
              <div className="pt-2 border-t mt-2">
                <p className="text-sm mb-2">Create a new folder:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter folder name"
                    className="border rounded px-2 py-1 flex-1 text-sm"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                  <Button size="sm" onClick={handleCreateFolder}>Create</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsCreatingFolder(false)}>Cancel</Button>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowFolderSelection(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleFinalSave(selectedFolderId)}
              >
                Save Here
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
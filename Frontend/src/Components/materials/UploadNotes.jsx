import { useState, useEffect } from "react";
import { FileUp, Folder, FolderPlus, File, Edit, Trash, Move, Save, FileText, X, Minimize } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter } from "@/Components/ui/drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { NoteEditor } from "./NoteEditor";

const FileViewer = ({ file, onClose, isMinimized, onMinimize }) => {
  return (
    <Card className={`fixed bottom-4 right-4 z-10 shadow-lg transition-all duration-300 ${isMinimized ? 'h-12 overflow-hidden w-64' : 'w-96 max-h-[80vh]'}`}>
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
        <CardTitle className="text-sm truncate max-w-52">{file.name}</CardTitle>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={onMinimize}
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
        <CardContent className="overflow-auto max-h-[calc(80vh-80px)]">
          {file.type.includes('image') && file.content && (
            <img 
              src={file.content} 
              alt={file.name} 
              className="max-w-full h-auto rounded" 
            />
          )}
          
          {file.type.includes('text') && file.content && (
            <div className="whitespace-pre-wrap font-mono text-sm">
              {file.content}
            </div>
          )}
          
          {file.type.includes('pdf') && (
            <div className="text-center p-4">
              <p>PDF preview not available</p>
              <a 
                href={file.content} 
                download={file.name}
                className="text-brand-purple underline mt-2 inline-block"
              >
                Download to view
              </a>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export function UploadNotes() {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isFileDetailsOpen, setIsFileDetailsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRenameMode, setIsRenameMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [isFileMinimized, setIsFileMinimized] = useState(false);
  const [isSelectFolderDialogOpen, setIsSelectFolderDialogOpen] = useState(false);

  // Load saved data from localStorage on initial render
  useEffect(() => {
    const savedFolders = localStorage.getItem('studyNotes_folders');
    const savedFiles = localStorage.getItem('studyNotes_files');
    
    if (savedFolders) {
      try {
        const parsedFolders = JSON.parse(savedFolders);
        // Convert date strings back to Date objects
        const foldersWithDates = parsedFolders.map((folder) => ({
          ...folder,
          dateCreated: new Date(folder.dateCreated)
        }));
        setFolders(foldersWithDates);
      } catch (error) {
        console.error("Error parsing folders from localStorage:", error);
      }
    }
    
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles);
        // Convert date strings back to Date objects
        const filesWithDates = parsedFiles.map((file) => ({
          ...file,
          dateUploaded: new Date(file.dateUploaded)
        }));
        setFiles(filesWithDates);
      } catch (error) {
        console.error("Error parsing files from localStorage:", error);
      }
    }
  }, []);

  // Save to localStorage whenever files or folders change
  useEffect(() => {
    localStorage.setItem('studyNotes_folders', JSON.stringify(folders));
    localStorage.setItem('studyNotes_files', JSON.stringify(files));
  }, [folders, files]);

  // Update breadcrumbs when current folder changes
  useEffect(() => {
    if (currentFolder === null) {
      setBreadcrumbs([]);
      return;
    }
    
    const breadcrumbTrail = [];
    let folderId = currentFolder;
    
    while (folderId) {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        breadcrumbTrail.unshift(folder);
        folderId = folder.parentId || "";
      } else {
        break;
      }
    }
    
    setBreadcrumbs(breadcrumbTrail);
  }, [currentFolder, folders]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setFileContent(event.target.result);
        }
      };
      
      if (e.target.files[0].type.includes('text') || e.target.files[0].type.includes('pdf')) {
        reader.readAsText(e.target.files[0]);
      } else if (e.target.files[0].type.includes('image')) {
        reader.readAsDataURL(e.target.files[0]);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setFileContent(event.target.result);
        }
      };
      
      if (e.dataTransfer.files[0].type.includes('text') || e.dataTransfer.files[0].type.includes('pdf')) {
        reader.readAsText(e.dataTransfer.files[0]);
      } else if (e.dataTransfer.files[0].type.includes('image')) {
        reader.readAsDataURL(e.dataTransfer.files[0]);
      }
    }
  };

  const saveFile = () => {
    if (!file) return;
    
    // Show folder selection dialog
    setIsSelectFolderDialogOpen(true);
  };

  const finalizeFileSave = (folderId) => {
    if (!file || fileContent === null) return;
    
    const newFile = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      dateUploaded: new Date(),
      content: fileContent,
      folderId: folderId
    };
    
    setFiles([...files, newFile]);
    setFile(null);
    setFileContent(null);
    setIsSelectFolderDialogOpen(false);
    
    toast({
      title: "Success",
      description: `${file.name} has been saved successfully.`,
    });
  };

  const createNewFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty.",
        variant: "destructive"
      });
      return;
    }
    
    const newFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      dateCreated: new Date(),
      parentId: currentFolder
    };
    
    setFolders([...folders, newFolder]);
    setNewFolderName("");
    setIsNewFolderOpen(false);
    
    toast({
      title: "Folder Created",
      description: `${newFolderName} has been created.`
    });
  };

  const navigateToFolder = (folderId) => {
    setCurrentFolder(folderId);
  };

  const openFileDetails = (file) => {
    setSelectedFile(file);
    setIsFileDetailsOpen(true);
  };

  const deleteFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId));
    setIsFileDetailsOpen(false);
    setSelectedFile(null);
    
    toast({
      title: "File Deleted",
      description: "The file has been deleted."
    });
  };

  const deleteFolder = (folderId) => {
    // First, check if folder has any files or subfolders
    const hasFiles = files.some(f => f.folderId === folderId);
    const hasSubfolders = folders.some(f => f.parentId === folderId);
    
    if (hasFiles || hasSubfolders) {
      toast({
        title: "Cannot Delete",
        description: "This folder contains files or subfolders. Delete them first.",
        variant: "destructive"
      });
      return;
    }
    
    setFolders(folders.filter(f => f.id !== folderId));
    
    toast({
      title: "Folder Deleted",
      description: "The folder has been deleted."
    });
  };

  const renameFile = () => {
    if (!selectedFile || !newName.trim()) return;
    
    setFiles(files.map(f => 
      f.id === selectedFile.id 
        ? { ...f, name: newName.trim() } 
        : f
    ));
    
    setSelectedFile({ ...selectedFile, name: newName.trim() });
    setIsRenameMode(false);
    setNewName("");
    
    toast({
      title: "File Renamed",
      description: "The file has been renamed successfully."
    });
  };

  const renameFolder = (folderId, newFolderName) => {
    if (!newFolderName.trim()) return;
    
    setFolders(folders.map(f => 
      f.id === folderId 
        ? { ...f, name: newFolderName.trim() } 
        : f
    ));
    
    toast({
      title: "Folder Renamed",
      description: "The folder has been renamed successfully."
    });
  };

  const moveFileTo = (fileId, targetFolderId) => {
    setFiles(files.map(f => 
      f.id === fileId 
        ? { ...f, folderId: targetFolderId } 
        : f
    ));
    
    setIsFileDetailsOpen(false);
    setSelectedFile(null);
    
    toast({
      title: "File Moved",
      description: "The file has been moved successfully."
    });
  };

  const openNoteEditor = () => {
    setIsNoteEditorOpen(true);
  };

  const saveNote = (content, fileName, folderId) => {
    const newNote = {
      id: Date.now().toString(),
      name: fileName,
      type: "text/plain",
      size: new Blob([content]).size,
      dateUploaded: new Date(),
      content: content,
      folderId: folderId
    };
    
    setFiles([...files, newNote]);
    
    toast({
      title: "Success",
      description: `${fileName} has been saved successfully.`,
    });
  };

  const viewFile = (file) => {
    setViewingFile(file);
    setIsFileMinimized(false);
  };

  // Get current folder contents
  const currentFolders = folders.filter(folder => folder.parentId === currentFolder);
  const currentFiles = files.filter(file => file.folderId === currentFolder);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl text-brand-text">My Notes</CardTitle>
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 mt-1 overflow-x-auto">
            <button 
              className="hover:text-brand-purple"
              onClick={() => navigateToFolder(null)}
            >
              Root
            </button>
            {breadcrumbs.map((folder, index) => (
              <div key={folder.id} className="flex items-center">
                <span className="mx-1">/</span>
                <button 
                  className={`hover:text-brand-purple ${index === breadcrumbs.length - 1 ? 'font-medium text-brand-purple' : ''}`}
                  onClick={() => navigateToFolder(folder.id)}
                >
                  {folder.name}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={openNoteEditor}
          >
            <FileText size={16} className="mr-1" /> New Note
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsNewFolderOpen(true)}
          >
            <FolderPlus size={16} className="mr-1" /> New Folder
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Zone */}
        <div 
          className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-brand-purple transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <FileUp className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-brand-textSecondary mb-2">
            Drag and drop your file here, or click to browse
          </p>
          <p className="text-xs text-brand-textSecondary">
            Supported formats: .pdf, .jpg, .png, .txt
          </p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.txt"
            onChange={handleFileChange}
          />
        </div>

        {/* File selection details */}
        {file && (
          <div className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-brand-textSecondary">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button onClick={saveFile} size="sm">
              <Save size={16} className="mr-1" /> Save
            </Button>
          </div>
        )}

        {/* Folder and Files List */}
        <div className="mt-4">
          {currentFolder !== null && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-2"
              onClick={() => navigateToFolder(folders.find(f => f.id === currentFolder)?.parentId || null)}
            >
              ← Back
            </Button>
          )}
          
          {currentFolders.length === 0 && currentFiles.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <p>This folder is empty</p>
              <p className="text-sm">Upload files or create folders to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Folders first */}
                {currentFolders.map((folder) => (
                  <TableRow key={folder.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Folder size={16} className="mr-2 text-amber-500" />
                        <button 
                          className="hover:text-brand-purple"
                          onClick={() => navigateToFolder(folder.id)}
                        >
                          {folder.name}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(folder.dateCreated, 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>--</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button 
                          className="p-1 rounded-full hover:bg-gray-100"
                          onClick={() => {
                            const newName = prompt("Enter new folder name:", folder.name);
                            if (newName) renameFolder(folder.id, newName);
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="p-1 rounded-full hover:bg-gray-100"
                          onClick={() => deleteFolder(folder.id)}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Then files */}
                {currentFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <File size={16} className="mr-2 text-blue-500" />
                        <button 
                          className="hover:text-brand-purple"
                          onClick={() => viewFile(file)}
                        >
                          {file.name}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(file.dateUploaded, 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {(file.size / 1024).toFixed(1)} KB
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button 
                          className="p-1 rounded-full hover:bg-gray-100"
                          onClick={() => openFileDetails(file)}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="p-1 rounded-full hover:bg-gray-100"
                          onClick={() => deleteFile(file.id)}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>

      {/* New Folder Dialog */}
      <Drawer open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create New Folder</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="mb-4"
            />
          </div>
          <DrawerFooter>
            <Button onClick={createNewFolder}>Create Folder</Button>
            <Button variant="outline" onClick={() => setIsNewFolderOpen(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* File Details Dialog */}
      <Drawer open={isFileDetailsOpen} onOpenChange={setIsFileDetailsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {isRenameMode ? (
                "Rename File"
              ) : (
                selectedFile?.name || "File Details"
              )}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {selectedFile && (
              <>
                {isRenameMode ? (
                  <div className="space-y-4">
                    <Input
                      placeholder="New file name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button onClick={renameFile}>Save</Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsRenameMode(false);
                          setNewName("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">File type</p>
                      <p>{selectedFile.type || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Size</p>
                      <p>{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Uploaded on</p>
                      <p>{format(selectedFile.dateUploaded, 'PPP')}</p>
                    </div>
                    
                    {selectedFile.type.includes('image') && selectedFile.content && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Preview</p>
                        <div className="bg-gray-100 rounded-md p-2">
                          <img 
                            src={selectedFile.content} 
                            alt="Preview" 
                            className="max-w-full h-auto rounded"
                          />
                        </div>
                      </div>
                    )}
                    
                    {selectedFile.type.includes('text') && selectedFile.content && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Preview</p>
                        <div className="bg-gray-100 rounded-md p-3 text-sm overflow-auto max-h-48">
                          {selectedFile.content}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        onClick={() => {
                          setIsRenameMode(true);
                          setNewName(selectedFile.name);
                        }}
                      >
                        <Edit size={16} className="mr-1" /> Rename
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => deleteFile(selectedFile.id)}
                      >
                        <Trash size={16} className="mr-1" /> Delete
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          if (selectedFile) {
                            const parentFolder = folders.find(f => f.id === currentFolder);
                            moveFileTo(selectedFile.id, parentFolder?.parentId || null);
                          }
                        }}
                      >
                        <Move size={16} className="mr-1" /> Move Up
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Note Editor Component */}
      <NoteEditor 
        isOpen={isNoteEditorOpen}
        onClose={() => setIsNoteEditorOpen(false)}
        folders={folders}
        onSave={saveNote}
      />

      {/* File Viewing Window */}
      {viewingFile && (
        <FileViewer 
          file={viewingFile}
          onClose={() => setViewingFile(null)}
          isMinimized={isFileMinimized}
          onMinimize={() => setIsFileMinimized(!isFileMinimized)}
        />
      )}

      {/* Folder Selection Dialog for Uploaded Files */}
      <Dialog open={isSelectFolderDialogOpen} onOpenChange={setIsSelectFolderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save to Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => finalizeFileSave(null)}
              >
                Root Folder
              </Button>
              
              {folders.map(folder => (
                <Button
                  key={folder.id}
                  variant="outline"
                  className="justify-start"
                  onClick={() => finalizeFileSave(folder.id)}
                >
                  {folder.name}
                </Button>
              ))}
            </div>
            
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setIsSelectFolderDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline" 
                onClick={() => {
                  setIsNewFolderOpen(true);
                  setIsSelectFolderDialogOpen(false);
                }}
              >
                <FolderPlus size={16} className="mr-1" /> New Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
import { create } from 'zustand';

export type FileType = {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileType[];
};

type FileStore = {
  files: FileType[];
  openTabs: string[]; // array of file paths, e.g., ['src/App.tsx']
  activeTab: string | null;
  setFiles: (files: FileType[]) => void;
  addTab: (path: string) => void;
  setActiveTab: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  getFileByPath: (path: string) => FileType | undefined;
};

// Helper: flatten tree to find file by path like "src/App.tsx"
const findFile = (files: FileType[], path: string): FileType | undefined => {
  const parts = path.split('/');
  let current: FileType[] | undefined = files;

  for (const part of parts) {
    if (!current) return undefined;
    const node = current.find(f => f.name === part);
    if (!node) return undefined;
    if (node.type === 'file') {
      if (parts.indexOf(part) === parts.length - 1) return node;
      return undefined;
    }
    current = node.children;
  }
  return undefined;
};

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  openTabs: [],
  activeTab: null,

  setFiles: (files) => set({ files }),

  addTab: (path) => {
    const tabs = get().openTabs;
    if (!tabs.includes(path)) {
      set({ openTabs: [...tabs, path] });
    }
    get().setActiveTab(path);
  },

  setActiveTab: (path) => set({ activeTab: path }),

  updateFileContent: (path, content) => {
    const { files } = get();
    const update = (nodes: FileType[]): FileType[] => {
      return nodes.map(node => {
        if (node.name === path && node.type === 'file') {
          return { ...node, content };
        }
        if (node.children) {
          return { ...node, children: update(node.children) };
        }
        return node;
      });
    };
    set({ files: update(files) });
  },

  getFileByPath: (path) => findFile(get().files, path),
}));
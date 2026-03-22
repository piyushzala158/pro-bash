export type PracticeExercise = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  goal: string;
  acceptedCommands: string[];
};

export type TerminalWorkspaceSeedNode = {
  path: string;
  type: "file" | "dir";
  content?: string;
};

export type LinuxPracticeGroup = {
  id: string;
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  summary: string;
  seoDescription: string;
  seoKeywords: string[];
  learningFocus: string;
  accent: string;
  initialCwd: string;
  welcomeLines: string[];
  seedNodes: TerminalWorkspaceSeedNode[];
  exercises: PracticeExercise[];
};

export type PracticeProgress = {
  completedByGroup: Record<string, string[]>;
};

export const PRACTICE_PROGRESS_KEY = "pro-bash.practice-progress.v2";
export const PRACTICE_SHOW_COMMANDS_KEY = "pro-bash.practice-show-commands.v2";

const baseSeedNodes: TerminalWorkspaceSeedNode[] = [
  { path: "/", type: "dir" },
  { path: "/home", type: "dir" },
  { path: "/home/learner", type: "dir" },
  { path: "/home/learner/projects", type: "dir" },
  { path: "/home/learner/projects/pro-bash", type: "dir" },
  { path: "/home/learner/projects/pro-bash/README.md", type: "file", content: "# Pro Bash\n" },
  { path: "/home/learner/projects/pro-bash/src", type: "dir" },
  { path: "/home/learner/logs", type: "dir" },
  {
    path: "/home/learner/logs/app.log",
    type: "file",
    content: [
      "INFO server started",
      "INFO warming cache",
      "ERROR unable to reach database",
      "INFO retry scheduled",
      "ERROR background job timed out",
    ].join("\n"),
  },
  {
    path: "/home/learner/logs/nginx.log",
    type: "file",
    content: ["127.0.0.1 GET /health", "127.0.0.1 GET /"].join("\n"),
  },
  { path: "/home/learner/scripts", type: "dir" },
  {
    path: "/home/learner/scripts/deploy.sh",
    type: "file",
    content: ["#!/usr/bin/env bash", "echo Deploying app"].join("\n"),
  },
  { path: "/home/learner/tmp", type: "dir" },
];

function groupSeedNodes(extraNodes: TerminalWorkspaceSeedNode[] = []) {
  return [...baseSeedNodes, ...extraNodes];
}

export const linuxPracticeGroups: LinuxPracticeGroup[] = [
  {
    id: "linux-navigation",
    slug: "navigation",
    label: "Navigation",
    shortLabel: "Navigation",
    description: "Move through directories and inspect where you are.",
    summary: "Commands that keep you oriented in shell sessions.",
    seoDescription:
      "Practice Linux navigation commands in a browser terminal simulator with guided lessons for pwd, ls, and cd workflows.",
    seoKeywords: [
      "linux navigation practice",
      "bash navigation commands",
      "pwd ls cd tutorial",
      "linux terminal navigation exercises",
    ],
    learningFocus:
      "Build confidence moving through directories, checking your location, and reading folder contents before making changes.",
    accent: "from-amber-300 via-orange-300 to-rose-300",
    initialCwd: "/home/learner/projects/pro-bash",
    welcomeLines: [
      "Linux navigation simulator ready.",
      "Type any common shell command and press Enter.",
    ],
    seedNodes: groupSeedNodes(),
    exercises: [
      {
        id: "nav-pwd",
        title: "Check where you are",
        description: "Start by printing the current working directory.",
        prompt: "Print the current working directory.",
        goal: "Confirm your location before you navigate or edit files.",
        acceptedCommands: ["pwd"],
      },
      {
        id: "nav-ls",
        title: "List everything here",
        description: "Inspect the current folder with hidden files and details.",
        prompt: "Show all files in the current directory using the long listing view.",
        goal: "Use a full listing to inspect names, permissions, and hidden files.",
        acceptedCommands: ["ls -la", "ls -al"],
      },
      {
        id: "nav-cd-up",
        title: "Move up one level",
        description: "Climb to the parent directory.",
        prompt: "Go back to the parent folder from your current location.",
        goal: "Practice relative navigation with the parent shortcut.",
        acceptedCommands: ["cd .."],
      },
    ],
  },
  {
    id: "linux-files",
    slug: "files",
    label: "Files",
    shortLabel: "Files",
    description: "Create, copy, rename, and remove files from the shell.",
    summary: "Train the core file management commands you use every day.",
    seoDescription:
      "Learn Linux file management with hands-on browser exercises for mkdir, touch, cp, mv, and rm commands.",
    seoKeywords: [
      "linux file management practice",
      "mkdir touch cp mv rm exercises",
      "bash file commands tutorial",
      "linux command line file operations",
    ],
    learningFocus:
      "Practice the everyday file commands used to create, organize, duplicate, rename, and remove files from the shell.",
    accent: "from-emerald-300 via-lime-300 to-cyan-300",
    initialCwd: "/home/learner/tmp",
    welcomeLines: [
      "File operations lab loaded in ~/tmp.",
      "Create files, move them around, and clean up like a real terminal session.",
    ],
    seedNodes: groupSeedNodes(),
    exercises: [
      {
        id: "files-mkdir",
        title: "Create a directory",
        description: "Create a fresh lab folder for your work.",
        prompt: "Create a new directory called `practice-lab`.",
        goal: "Use `mkdir` to create a workspace from the terminal.",
        acceptedCommands: ["mkdir practice-lab"],
      },
      {
        id: "files-touch",
        title: "Create an empty file",
        description: "Add a starter note file.",
        prompt: "Create an empty file named `notes.txt`.",
        goal: "Create a file without opening an editor.",
        acceptedCommands: ["touch notes.txt"],
      },
      {
        id: "files-cp",
        title: "Copy a file",
        description: "Duplicate the note before changing it.",
        prompt: "Copy `notes.txt` to a new file named `notes-backup.txt`.",
        goal: "Practice the source-to-destination flow of `cp`.",
        acceptedCommands: ["cp notes.txt notes-backup.txt"],
      },
      {
        id: "files-mv",
        title: "Rename the backup",
        description: "Turn the backup into an archive file.",
        prompt: "Rename `notes-backup.txt` to `archive.txt`.",
        goal: "Use `mv` for renaming in place.",
        acceptedCommands: ["mv notes-backup.txt archive.txt"],
      },
      {
        id: "files-rm",
        title: "Delete the archive",
        description: "Clean up a file you do not need anymore.",
        prompt: "Remove the file named `archive.txt`.",
        goal: "Delete a specific file cleanly with `rm`.",
        acceptedCommands: ["rm archive.txt"],
      },
    ],
  },
  {
    id: "linux-search",
    slug: "search",
    label: "Search",
    shortLabel: "Search",
    description: "Find the right file or line quickly when things get noisy.",
    summary: "Search through logs and folders the way you would on a real machine.",
    seoDescription:
      "Practice grep and find in a Linux browser terminal so you can search logs, folders, and noisy project trees faster.",
    seoKeywords: [
      "grep practice",
      "find command tutorial",
      "linux search exercises",
      "bash log searching practice",
    ],
    learningFocus:
      "Learn how to locate files and error lines quickly with common Linux search tools used in debugging and operations work.",
    accent: "from-cyan-300 via-sky-300 to-blue-300",
    initialCwd: "/home/learner",
    welcomeLines: [
      "Search toolkit loaded with sample logs.",
      "Use grep and find to track down the exact signal you need.",
    ],
    seedNodes: groupSeedNodes(),
    exercises: [
      {
        id: "search-grep",
        title: "Search inside a log file",
        description: "Find every error line with line numbers included.",
        prompt: "Search `logs/app.log` for the word `ERROR` and show line numbers.",
        goal: "Use `grep` to locate matching text inside a file.",
        acceptedCommands: ['grep -n "ERROR" logs/app.log', "grep -n ERROR logs/app.log"],
      },
      {
        id: "search-find",
        title: "Find all log files",
        description: "Search the current tree for log files.",
        prompt: "Find all files ending in `.log` starting from the current directory.",
        goal: "Use `find` with a name pattern to locate files recursively.",
        acceptedCommands: ['find . -name "*.log"', "find . -name '*.log'"],
      },
    ],
  },
  {
    id: "linux-permissions",
    slug: "permissions",
    label: "Permissions",
    shortLabel: "Permissions",
    description: "Handle executable permissions and basic file access changes.",
    summary: "Get comfortable making scripts runnable from the shell.",
    seoDescription:
      "Train Linux permissions basics with a guided chmod exercise that teaches how to make shell scripts executable.",
    seoKeywords: [
      "linux permissions practice",
      "chmod tutorial",
      "make script executable linux",
      "bash permissions exercise",
    ],
    learningFocus:
      "Understand the most common shell permission workflow so you can inspect and enable script execution confidently.",
    accent: "from-fuchsia-300 via-pink-300 to-rose-300",
    initialCwd: "/home/learner/scripts",
    welcomeLines: [
      "Permissions playground ready in ~/scripts.",
      "Inspect the script and make it executable when you are ready.",
    ],
    seedNodes: groupSeedNodes(),
    exercises: [
      {
        id: "perm-chmod",
        title: "Make the script executable",
        description: "Prepare the deploy script so it can be run directly.",
        prompt: "Add executable permission to `deploy.sh`.",
        goal: "Use `chmod +x` for the most common script permission change.",
        acceptedCommands: ["chmod +x deploy.sh"],
      },
    ],
  },
  {
    id: "linux-processes",
    slug: "processes",
    label: "Processes",
    shortLabel: "Processes",
    description: "Inspect running processes the way you would during debugging.",
    summary: "Practice quick process inspection before you need it under pressure.",
    seoDescription:
      "Practice Linux process inspection with guided ps aux lessons inside a browser terminal playground.",
    seoKeywords: [
      "linux process commands",
      "ps aux practice",
      "bash process inspection",
      "linux debugging terminal exercises",
    ],
    learningFocus:
      "Train process-inspection habits that help you debug services, spot resource issues, and understand what is running.",
    accent: "from-violet-300 via-indigo-300 to-blue-300",
    initialCwd: "/home/learner",
    welcomeLines: [
      "Process viewer loaded.",
      "Use familiar inspection commands to understand what is running.",
    ],
    seedNodes: groupSeedNodes(),
    exercises: [
      {
        id: "proc-ps",
        title: "Inspect running processes",
        description: "Show all running processes in a detailed format.",
        prompt: "Show all running processes in a detailed, user-oriented format.",
        goal: "Use `ps aux` to get a broad process snapshot.",
        acceptedCommands: ["ps aux"],
      },
    ],
  },
];

export function getLinuxPracticeGroupBySlug(slug: string) {
  return linuxPracticeGroups.find((group) => group.slug === slug);
}

export function getPracticeRoute(slug: string) {
  return `/practice/${slug}`;
}

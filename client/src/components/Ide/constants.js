export const languageOptions = [
      {
            id: 54,
            label: "C++",
            value: "cpp",
            version: "GCC 9.2.0",
      },
      {
            id: 50,
            label: "C",
            value: "c",
            version: "GCC 9.2.0",
      },
      {
            id: 62,
            label: "Java",
            value: "java",
            version: "OpenJDK 13.0.1",
      },
      {
            id: 92,
            label: "Python",
            value: "python",
            version: "3.11.2",
      },
      {
            id: 93,
            label: "JavaScript",
            value: "javascript",
            version: "Node.js 18.15.0",
      },
      {
            id: 95,
            label: "Go",
            value: "go",
            version: "1.18.5",
      },
      {
            id: 94,
            label: "TypeScript",
            value: "typescript",
            version: "5.0.3",
      },
      {
            id: 95,
            label: "SQL",
            value: "sql",
            version: "SQLite 3.27.2",
      },
      {
            id: 90,
            label: "Dart",
            value: "dart",
            version: "2.19.2",
      },
      {
            id: 46,
            label: "Bash",
            value: "bash",
            version: "5.0.0",
      },
      {
            id: 45,
            label: "Assembly",
            value: "assembly",
            version: "NASM 2.14.02",
      },
      {
            id: 72,
            label: "Ruby",
            value: "ruby",
            version: "2.7.0",
      },
      {
            id: 73,
            label: "Rust",
            value: "rust",
            version: "1.40.0",
      },
      {
            id: 68,
            label: "PHP",
            value: "php",
            version: "7.4.1",
      },
      {
            id: 80,
            label: "R",
            value: "r",
            version: "4.0.0",
      },
      {
            id: 51,
            label: "C#",
            value: "csharp",
            version: "Mono 6.6.0.161",
      },
      {
            id: 83,
            label: "Swift",
            value: "swift",
            version: "5.2.3",
      },
      {
            id: 81,
            label: "Scala",
            value: "scala",
            version: "2.13.2",
      },
      {
            id: 43,
            label: "Others",
            value: "plaintext",
            version: "",
      },

];

export const codeSnippets = {
      // id: code-snippet
      54: `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n\tcout << "Hello, World!";\n\treturn 0;\n}`,
      50: `#include <stdio.h>\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}`,
      62: `public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello, World!");\n\t}\n}`,
      92: `print("Hello, World!")`,
      93: `console.log("Hello, World!");`,
      95: `package main\nimport "fmt"\nfunc main() {\n\tfmt.Println("Hello, World!")\n}`,
      94: `console.log("Hello, World!");`,
      95: `SELECT "Hello, World!";`,
      90: `void main() {\n\tprint("Hello, World!");\n}`,
      46: `echo "Hello, World!"`,
      45: `section .data\n\thello db 'Hello, World!', 0\nsection .text\n\tglobal _start\n_start:\n\tmov rax, 1\n\tmov rdi, 1\n\tmov rsi, hello\n\tmov rdx, 13\n\tsyscall\n\tmov rax, 60\n\txor rdi, rdi\n\tsyscall`,
      72: `puts "Hello, World!"`,
      73: `fn main() {\n\tprintln!("Hello, World!");\n}`,
      68: `<?php\n\techo "Hello, World!";\n?>`,
      80: `print("Hello, World!")`,
      51: `using System;\nclass MainClass {\n\tpublic static void Main (string[] args) {\n\t\tConsole.WriteLine ("Hello, World!");\n\t}\n}`,
      83: `print("Hello, World!")`,
      81: `object Main extends App {\n\tprintln("Hello, World!")\n}`,
      43: `// Write your code here`,
};

export const judge0APIKEY = "deeb5545e3msheb77612de1d9463p1ead89jsnba1615188607";

export const judge0ResponseIDs = [
      "In Queue",
      "Processing",
      "Accepted",
      "Wrong Answer",
      "Time Limit Exceeded",
      "Compilation Error",
      "Runtime Error (SIGSEGV)",
      "Runtime Error (SIGXFSZ)",
      "Runtime Error (SIGFPE)",
      "Runtime Error (SIGABRT)",
      "Runtime Error (NZEC)",
      "Runtime Error (Other)",
      "Internal Error",
      "Exec Format Error"
];

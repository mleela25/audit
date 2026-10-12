
# Simple Compiler Front-End (C Version)

A simple, easy-to-use compiler front-end written entirely in C that performs:

- ✅ **Lexical Analysis** (Tokenization)
- ✅ **Syntax Analysis**
- ✅ **Symbol Table Construction**
- ✅ **Error Reporting**

---

## 🚀 How to Run

### Step 1: Compile the Program
```bash
gcc -o compiler compiler.c
```

### Step 2: Run with the Sample File
```bash
./compiler
```

### Step 3: Run with Your Own File
```bash
./compiler /Users/m.leelaprathap/Downloads/leela.txt
```

---

## 📁 Project Structure

```
SimpleCompiler/
├── compiler.c         # Main compiler program (all-in-one C file)
├── compiler           # Compiled executable
├── input/             # Source code files directory
│   └── sample_program.txt  # Example program with errors to test
└── README.md          # This file!
```

---

## 🎯 Features Explained

### 1. Lexical Analysis
Breaks your code into tokens (keywords, identifiers, numbers, strings, operators, etc.)

### 2. Syntax Analysis & Symbol Table
Tracks all variables and constants declared in your code with their types, scopes, and line numbers.

### 3. Error Reporting
Detects and reports:
- **Lexical Errors** (unclosed strings, unknown characters, etc.)
- **Syntax Errors** (missing semicolons, mismatched parentheses, etc.)  
- **Semantic Errors** (duplicate declarations, type mismatches, etc.)

---

## 💡 Example Output

When you run the program, you'll see:

1. **Lexical Analysis Results** - Table of all tokens
2. **Symbol Table** - All declared variables/constants
3. **Error Reporting** - Any errors with suggestions to fix them

---

## 📝 Sample Program

The `input/sample_program.txt` includes:
- Valid code examples
- Intentional errors to demonstrate error reporting
- Various C-like features (variables, loops, conditionals, functions)


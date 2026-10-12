
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

// Token types
typedef enum {
    TOKEN_KEYWORD,
    TOKEN_IDENTIFIER,
    TOKEN_INTEGER,
    TOKEN_FLOAT,
    TOKEN_STRING,
    TOKEN_CHAR,
    TOKEN_OPERATOR,
    TOKEN_DELIMITER,
    TOKEN_COMMENT,
    TOKEN_PREPROCESSOR,
    TOKEN_HEADER_FILE,
    TOKEN_EOF,
    TOKEN_UNKNOWN
} TokenType;

// Token structure
typedef struct {
    TokenType type;
    char lexeme[256];
    int line;
    int column;
} Token;

// Error types
typedef enum {
    ERROR_LEXICAL,
    ERROR_SYNTAX,
    ERROR_SEMANTIC
} ErrorType;

// Error structure
typedef struct {
    ErrorType type;
    char description[512];
    int line;
    int column;
    char suggestion[256];
} CompilerError;

// Symbol table entry
typedef struct {
    char name[128];
    char data_type[64];
    int scope_level;
    int is_constant;
    int is_initialized;
    int line_declared;
} SymbolTableEntry;

// Symbol table
typedef struct {
    SymbolTableEntry entries[256];
    int count;
    int current_scope;
} SymbolTable;

// Global variables
const char* source = NULL;
int pos = 0;
int line = 1;
int column = 1;
Token tokens[1000];
int token_count = 0;
CompilerError errors[100];
int error_count = 0;
SymbolTable symbol_table;
int parse_index = 0;

// List of keywords
const char* keywords[] = {
    "int", "float", "double", "char", "bool", "string", "void",
    "long", "short", "if", "else", "while", "do", "for",
    "switch", "case", "default", "break", "continue", "return",
    "const", "print", "input", "main", NULL
};

// Check if a word is a keyword
int is_keyword(const char* word) {
    for (int i = 0; keywords[i] != NULL; i++) {
        if (strcmp(word, keywords[i]) == 0) {
            return 1;
        }
    }
    return 0;
}

// Get token type as string
const char* token_type_str(TokenType type) {
    switch (type) {
        case TOKEN_KEYWORD: return "Keyword";
        case TOKEN_IDENTIFIER: return "Identifier";
        case TOKEN_INTEGER: return "Integer";
        case TOKEN_FLOAT: return "Float";
        case TOKEN_STRING: return "String";
        case TOKEN_CHAR: return "Char";
        case TOKEN_OPERATOR: return "Operator";
        case TOKEN_DELIMITER: return "Delimiter";
        case TOKEN_COMMENT: return "Comment";
        case TOKEN_PREPROCESSOR: return "Preprocessor";
        case TOKEN_HEADER_FILE: return "HeaderFile";
        case TOKEN_EOF: return "EOF";
        default: return "Unknown";
    }
}

// Add a token to the list
void add_token(TokenType type, const char* lexeme, int start_line, int start_col) {
    if (token_count < 1000) {
        tokens[token_count].type = type;
        strncpy(tokens[token_count].lexeme, lexeme, 255);
        tokens[token_count].line = start_line;
        tokens[token_count].column = start_col;
        token_count++;
    }
}

// Add an error
void add_error(ErrorType type, const char* desc, int line_num, int col_num, const char* suggestion) {
    if (error_count < 100) {
        errors[error_count].type = type;
        strncpy(errors[error_count].description, desc, 511);
        errors[error_count].line = line_num;
        errors[error_count].column = col_num;
        strncpy(errors[error_count].suggestion, suggestion, 255);
        error_count++;
    }
}

// Initialize symbol table
void symbol_table_init() {
    symbol_table.count = 0;
    symbol_table.current_scope = 0;
}

// Add entry to symbol table
int symbol_table_add(const char* name, const char* data_type, int is_constant, int line_declared) {
    // Check if already exists in current scope
    for (int i = 0; i < symbol_table.count; i++) {
        if (strcmp(symbol_table.entries[i].name, name) == 0 &&
            symbol_table.entries[i].scope_level == symbol_table.current_scope) {
            return 0; // Already exists
        }
    }
    
    if (symbol_table.count < 256) {
        strncpy(symbol_table.entries[symbol_table.count].name, name, 127);
        strncpy(symbol_table.entries[symbol_table.count].data_type, data_type, 63);
        symbol_table.entries[symbol_table.count].scope_level = symbol_table.current_scope;
        symbol_table.entries[symbol_table.count].is_constant = is_constant;
        symbol_table.entries[symbol_table.count].is_initialized = 0;
        symbol_table.entries[symbol_table.count].line_declared = line_declared;
        symbol_table.count++;
        return 1;
    }
    return 0;
}

// Find entry in symbol table
int symbol_table_find(const char* name, SymbolTableEntry** entry) {
    // Search from inner to outer scope
    for (int level = symbol_table.current_scope; level >= 0; level--) {
        for (int i = 0; i < symbol_table.count; i++) {
            if (strcmp(symbol_table.entries[i].name, name) == 0 &&
                symbol_table.entries[i].scope_level == level) {
                *entry = &symbol_table.entries[i];
                return 1;
            }
        }
    }
    return 0;
}

// Read entire file into memory
char* read_file(const char* filename) {
    FILE* file = fopen(filename, "r");
    if (!file) {
        printf("Error: Could not open file '%s'\n", filename);
        return NULL;
    }
    
    fseek(file, 0, SEEK_END);
    long size = ftell(file);
    fseek(file, 0, SEEK_SET);
    
    char* buffer = (char*)malloc(size + 1);
    if (!buffer) {
        fclose(file);
        printf("Error: Out of memory\n");
        return NULL;
    }
    
    fread(buffer, 1, size, file);
    buffer[size] = '\0';
    fclose(file);
    return buffer;
}

// Peek at next character without advancing
char peek(int offset) {
    if (source[pos + offset] == '\0') {
        return '\0';
    }
    return source[pos + offset];
}

// Advance to next character
char advance() {
    char c = source[pos];
    pos++;
    if (c == '\n') {
        line++;
        column = 1;
    } else {
        column++;
    }
    return c;
}

// Skip whitespace
void skip_whitespace() {
    while (isspace(peek(0))) {
        advance();
    }
}

// Tokenize the source code
void tokenize() {
    token_count = 0;
    pos = 0;
    line = 1;
    column = 1;
    
    while (peek(0) != '\0') {
        skip_whitespace();
        
        char c = peek(0);
        int start_line = line;
        int start_col = column;
        
        // Preprocessor directives
        if (c == '#') {
            char pre[256] = {0};
            int i = 0;
            pre[i++] = advance();
            while (isalpha(peek(0))) {
                pre[i++] = advance();
            }
            pre[i] = '\0';
            add_token(TOKEN_PREPROCESSOR, pre, start_line, start_col);
            
            // If #include, read the header file
            if (strcmp(pre, "#include") == 0) {
                skip_whitespace();
                char header[256] = {0};
                i = 0;
                char close_char = 0;
                if (peek(0) == '<') {
                    close_char = '>';
                } else if (peek(0) == '"') {
                    close_char = '"';
                }
                if (close_char) {
                    header[i++] = advance();
                    while (peek(0) != '\0' && peek(0) != close_char) {
                        header[i++] = advance();
                    }
                    if (peek(0) == close_char) {
                        header[i++] = advance();
                    }
                    header[i] = '\0';
                    add_token(TOKEN_HEADER_FILE, header, start_line, start_col);
                }
            }
            continue;
        }
        
        // Comments
        if (c == '/' && (peek(1) == '/' || peek(1) == '*')) {
            char comment[1024] = {0};
            int i = 0;
            comment[i++] = advance(); // '/'
            
            if (peek(0) == '/') {
                // Single line comment
                comment[i++] = advance();
                while (peek(0) != '\0' && peek(0) != '\n') {
                    char ch = advance();
                    comment[i++] = ch;
                }
            } else if (peek(0) == '*') {
                // Multi line comment
                comment[i++] = advance();
                int closed = 0;
                while (peek(0) != '\0') {
                    char ch = advance();
                    comment[i++] = ch;
                    if (ch == '*' && peek(0) == '/') {
                        char ch2 = advance();
                        comment[i++] = ch2;
                        closed = 1;
                        break;
                    }
                }
                if (!closed) {
                    add_error(ERROR_LEXICAL, "Unclosed multi-line comment", start_line, start_col,
                            "Add '*/' to close the comment");
                }
            }
            comment[i] = '\0';
            add_token(TOKEN_COMMENT, comment, start_line, start_col);
            continue;
        }
        
        // Strings
        if (c == '"') {
            char str[256] = {0};
            int i = 0;
            str[i++] = advance();
            int closed = 0;
            while (peek(0) != '\0') {
                char ch = advance();
                str[i++] = ch;
                if (ch == '"') {
                    closed = 1;
                    break;
                }
            }
            if (!closed) {
                add_error(ERROR_LEXICAL, "Unclosed string literal", start_line, start_col,
                        "Add closing double quote '\"'");
            }
            str[i] = '\0';
            add_token(TOKEN_STRING, str, start_line, start_col);
            continue;
        }
        
        // Characters
        if (c == '\'') {
            char chr[256] = {0};
            int i = 0;
            chr[i++] = advance();
            int closed = 0;
            while (peek(0) != '\0') {
                char ch = advance();
                chr[i++] = ch;
                if (ch == '\'') {
                    closed = 1;
                    break;
                }
            }
            if (!closed) {
                add_error(ERROR_LEXICAL, "Unclosed character literal", start_line, start_col,
                        "Add closing single quote \"'\"");
            }
            chr[i] = '\0';
            add_token(TOKEN_CHAR, chr, start_line, start_col);
            continue;
        }
        
        // Numbers
        if (isdigit(c)) {
            char num[256] = {0};
            int i = 0;
            int is_float = 0;
            while (isdigit(peek(0)) || peek(0) == '.') {
                if (peek(0) == '.') {
                    is_float = 1;
                }
                num[i++] = advance();
            }
            num[i] = '\0';
            add_token(is_float ? TOKEN_FLOAT : TOKEN_INTEGER, num, start_line, start_col);
            continue;
        }
        
        // Identifiers and keywords
        if (isalpha(c) || c == '_') {
            char word[256] = {0};
            int i = 0;
            while (isalnum(peek(0)) || peek(0) == '_') {
                word[i++] = advance();
            }
            word[i] = '\0';
            if (is_keyword(word)) {
                add_token(TOKEN_KEYWORD, word, start_line, start_col);
            } else {
                add_token(TOKEN_IDENTIFIER, word, start_line, start_col);
            }
            continue;
        }
        
        // Operators
        char ops[] = "+-*/%=!<>|&~?:;";
        if (strchr(ops, c)) {
            char op[4] = {0};
            int i = 0;
            op[i++] = advance();
            // Check for two-character operators
            if ((op[0] == '+' && (peek(0) == '+' || peek(0) == '=')) ||
                (op[0] == '-' && (peek(0) == '-' || peek(0) == '=')) ||
                (op[0] == '*' && peek(0) == '=') ||
                (op[0] == '/' && peek(0) == '=') ||
                (op[0] == '%' && peek(0) == '=') ||
                (op[0] == '=' && peek(0) == '=') ||
                (op[0] == '!' && peek(0) == '=') ||
                (op[0] == '<' && (peek(0) == '=' || peek(0) == '<')) ||
                (op[0] == '>' && (peek(0) == '=' || peek(0) == '>')) ||
                (op[0] == '&' && peek(0) == '&') ||
                (op[0] == '|' && peek(0) == '|')) {
                op[i++] = advance();
            }
            op[i] = '\0';
            add_token(TOKEN_OPERATOR, op, start_line, start_col);
            continue;
        }
        
        // Delimiters
        char delims[] = ",(){}[]:;";
        if (strchr(delims, c)) {
            char d[2] = {advance(), '\0'};
            add_token(TOKEN_DELIMITER, d, start_line, start_col);
            continue;
        }
        
        // Unknown character
        char unknown[2] = {advance(), '\0'};
        add_error(ERROR_LEXICAL, "Unknown character", start_line, start_col, "Remove this character");
        add_token(TOKEN_UNKNOWN, unknown, start_line, start_col);
    }
}

// Parser helpers
Token peek_token(int offset) {
    int idx = parse_index + offset;
    if (idx >= token_count) {
        Token t = {TOKEN_EOF, "", 0, 0};
        return t;
    }
    return tokens[idx];
}

Token next_token() {
    if (parse_index >= token_count) {
        Token t = {TOKEN_EOF, "", 0, 0};
        return t;
    }
    return tokens[parse_index++];
}

int match(TokenType type) {
    if (peek_token(0).type == type) {
        next_token();
        return 1;
    }
    return 0;
}

int match_keyword(const char* kw) {
    Token t = peek_token(0);
    if (t.type == TOKEN_KEYWORD && strcmp(t.lexeme, kw) == 0) {
        next_token();
        return 1;
    }
    return 0;
}

// Print functions
void print_tokens() {
    printf("\n=============================================\n");
    printf("           LEXICAL ANALYSIS RESULTS           \n");
    printf("=============================================\n");
    printf("%-8s %-15s %-20s\n", "Line", "Type", "Lexeme");
    printf("---------------------------------------------\n");
    for (int i = 0; i < token_count; i++) {
        if (tokens[i].type == TOKEN_COMMENT) continue;
        printf("%-8d %-15s %-20s\n", tokens[i].line, token_type_str(tokens[i].type), tokens[i].lexeme);
    }
    printf("=============================================\n");
    printf("Total: %d tokens\n\n", token_count);
}

void generate_html_dashboard(const char* filename) {
    FILE* html = fopen("dashboard.html", "w");
    if (!html) {
        printf("Could not create dashboard.html\n");
        return;
    }

    fprintf(html, "<!DOCTYPE html>\n");
    fprintf(html, "<html lang='en'>\n");
    fprintf(html, "<head>\n");
    fprintf(html, "    <meta charset='UTF-8'>\n");
    fprintf(html, "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>\n");
    fprintf(html, "    <title>Simple Compiler Dashboard</title>\n");
    fprintf(html, "    <style>\n");
    fprintf(html, "        * { margin: 0; padding: 0; box-sizing: border-box; }\n");
    fprintf(html, "        body { font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); min-height: 100vh; padding: 20px; }\n");
    fprintf(html, "        .container { max-width: 1400px; margin: 0 auto; }\n");
    fprintf(html, "        .header { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin-bottom: 25px; text-align: center; }\n");
    fprintf(html, "        .header h1 { color: #667eea; font-size: 2.5em; margin-bottom: 10px; }\n");
    fprintf(html, "        .header p { color: #666; font-size: 1.1em; }\n");
    fprintf(html, "        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px; }\n");
    fprintf(html, "        .stat-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); text-align: center; }\n");
    fprintf(html, "        .stat-card h3 { color: #666; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }\n");
    fprintf(html, "        .stat-card .number { font-size: 2.5em; font-weight: bold; color: #667eea; }\n");
    fprintf(html, "        .stat-card.error .number { color: #e74c3c; }\n");
    fprintf(html, "        .section { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 25px; }\n");
    fprintf(html, "        .section h2 { color: #333; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 3px solid #667eea; display: inline-block; }\n");
    fprintf(html, "        table { width: 100%%; border-collapse: collapse; margin-top: 15px; }\n");
    fprintf(html, "        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }\n");
    fprintf(html, "        th { background: #f8f9fa; color: #667eea; font-weight: 600; text-transform: uppercase; font-size: 0.85em; letter-spacing: 0.5px; }\n");
    fprintf(html, "        tr:hover { background: #f8f9fa; }\n");
    fprintf(html, "        .error-item { background: #fff5f5; border-left: 4px solid #e74c3c; padding: 15px; margin-bottom: 10px; border-radius: 5px; }\n");
    fprintf(html, "        .error-type { font-weight: bold; color: #e74c3c; margin-bottom: 5px; }\n");
    fprintf(html, "        .error-location { color: #666; font-size: 0.9em; margin-bottom: 5px; }\n");
    fprintf(html, "        .error-desc { color: #333; }\n");
    fprintf(html, "        .suggestion { color: #27ae60; margin-top: 5px; font-style: italic; }\n");
    fprintf(html, "        .no-errors { text-align: center; padding: 30px; color: #27ae60; font-size: 1.2em; font-weight: 500; }\n");
    fprintf(html, "    </style>\n");
    fprintf(html, "</head>\n");
    fprintf(html, "<body>\n");
    fprintf(html, "    <div class='container'>\n");
    fprintf(html, "        <div class='header'>\n");
    fprintf(html, "            <h1>🔧 Simple Compiler Front-End</h1>\n");
    fprintf(html, "            <p>Analyzed file: %s</p>\n", filename);
    fprintf(html, "        </div>\n");
    fprintf(html, "        \n");
    fprintf(html, "        <div class='stats'>\n");
    fprintf(html, "            <div class='stat-card'>\n");
    fprintf(html, "                <h3>Total Tokens</h3>\n");
    fprintf(html, "                <div class='number'>%d</div>\n", token_count);
    fprintf(html, "            </div>\n");
    fprintf(html, "            <div class='stat-card'>\n");
    fprintf(html, "                <h3>Symbol Table Entries</h3>\n");
    fprintf(html, "                <div class='number'>%d</div>\n", symbol_table.count);
    fprintf(html, "            </div>\n");
    fprintf(html, "            <div class='stat-card %s'>\n", error_count > 0 ? "error" : "");
    fprintf(html, "                <h3>Errors Detected</h3>\n");
    fprintf(html, "                <div class='number'>%d</div>\n", error_count);
    fprintf(html, "            </div>\n");
    fprintf(html, "        </div>\n");
    fprintf(html, "        \n");
    fprintf(html, "        <div class='section'>\n");
    fprintf(html, "            <h2>📊 Symbol Table</h2>\n");
    fprintf(html, "            <table>\n");
    fprintf(html, "                <thead>\n");
    fprintf(html, "                    <tr><th>Name</th><th>Type</th><th>Scope</th><th>Constant</th><th>Line Declared</th></tr>\n");
    fprintf(html, "                </thead>\n");
    fprintf(html, "                <tbody>\n");
    for (int i = 0; i < symbol_table.count; i++) {
        fprintf(html, "                    <tr>\n");
        fprintf(html, "                        <td>%s</td>\n", symbol_table.entries[i].name);
        fprintf(html, "                        <td>%s</td>\n", symbol_table.entries[i].data_type);
        fprintf(html, "                        <td>%d</td>\n", symbol_table.entries[i].scope_level);
        fprintf(html, "                        <td>%s</td>\n", symbol_table.entries[i].is_constant ? "Yes" : "No");
        fprintf(html, "                        <td>%d</td>\n", symbol_table.entries[i].line_declared);
        fprintf(html, "                    </tr>\n");
    }
    fprintf(html, "                </tbody>\n");
    fprintf(html, "            </table>\n");
    fprintf(html, "        </div>\n");
    fprintf(html, "        \n");
    fprintf(html, "        <div class='section'>\n");
    fprintf(html, "            <h2>⚠️ Error Reporting</h2>\n");
    if (error_count == 0) {
        fprintf(html, "            <div class='no-errors'>✅ No errors detected! Great job!</div>\n");
    } else {
        for (int i = 0; i < error_count; i++) {
            const char* type_str = "Unknown";
            switch (errors[i].type) {
                case ERROR_LEXICAL: type_str = "Lexical Error"; break;
                case ERROR_SYNTAX: type_str = "Syntax Error"; break;
                case ERROR_SEMANTIC: type_str = "Semantic Error"; break;
            }
            fprintf(html, "            <div class='error-item'>\n");
            fprintf(html, "                <div class='error-type'>%s</div>\n", type_str);
            fprintf(html, "                <div class='error-location'>Line %d, Column %d</div>\n", errors[i].line, errors[i].column);
            fprintf(html, "                <div class='error-desc'>%s</div>\n", errors[i].description);
            if (strlen(errors[i].suggestion) > 0) {
                fprintf(html, "                <div class='suggestion'>💡 Suggestion: %s</div>\n", errors[i].suggestion);
            }
            fprintf(html, "            </div>\n");
        }
    }
    fprintf(html, "        </div>\n");
    fprintf(html, "        \n");
    fprintf(html, "        <div class='section'>\n");
    fprintf(html, "            <h2>🔤 Lexical Analysis - Tokens</h2>\n");
    fprintf(html, "            <table>\n");
    fprintf(html, "                <thead>\n");
    fprintf(html, "                    <tr><th>Line</th><th>Type</th><th>Lexeme</th></tr>\n");
    fprintf(html, "                </thead>\n");
    fprintf(html, "                <tbody>\n");
    for (int i = 0; i < token_count; i++) {
        if (tokens[i].type == TOKEN_COMMENT) continue;
        fprintf(html, "                    <tr>\n");
        fprintf(html, "                        <td>%d</td>\n", tokens[i].line);
        fprintf(html, "                        <td>%s</td>\n", token_type_str(tokens[i].type));
        fprintf(html, "                        <td>%s</td>\n", tokens[i].lexeme);
        fprintf(html, "                    </tr>\n");
    }
    fprintf(html, "                </tbody>\n");
    fprintf(html, "            </table>\n");
    fprintf(html, "        </div>\n");
    fprintf(html, "    </div>\n");
    fprintf(html, "</body>\n");
    fprintf(html, "</html>\n");

    fclose(html);
    printf("✅ Visual dashboard created: dashboard.html\n");
    printf("Opening dashboard in your browser...\n\n");
    
    // Open the dashboard automatically in the default browser
    system("open dashboard.html");
}

void print_errors() {
    printf("\n=============================================\n");
    printf("             ERROR REPORTING                 \n");
    printf("=============================================\n");
    if (error_count == 0) {
        printf("No errors detected!\n");
    } else {
        for (int i = 0; i < error_count; i++) {
            const char* type_str = "Unknown";
            switch (errors[i].type) {
                case ERROR_LEXICAL: type_str = "Lexical"; break;
                case ERROR_SYNTAX: type_str = "Syntax"; break;
                case ERROR_SEMANTIC: type_str = "Semantic"; break;
            }
            printf("\nError %d:\n", i + 1);
            printf("  Type: %s\n", type_str);
            printf("  Line: %d, Column: %d\n", errors[i].line, errors[i].column);
            printf("  Description: %s\n", errors[i].description);
            if (strlen(errors[i].suggestion) > 0) {
                printf("  Suggestion: %s\n", errors[i].suggestion);
            }
        }
    }
    printf("=============================================\n\n");
}

void print_symbol_table() {
    printf("\n=============================================\n");
    printf("              SYMBOL TABLE                   \n");
    printf("=============================================\n");
    printf("%-20s %-15s %-10s %-10s %-10s\n", 
           "Name", "Type", "Scope", "Const", "Line");
    printf("---------------------------------------------\n");
    for (int i = 0; i < symbol_table.count; i++) {
        printf("%-20s %-15s %-10d %-10s %-10d\n",
               symbol_table.entries[i].name,
               symbol_table.entries[i].data_type,
               symbol_table.entries[i].scope_level,
               symbol_table.entries[i].is_constant ? "Yes" : "No",
               symbol_table.entries[i].line_declared);
    }
    printf("=============================================\n\n");
}

// Simple parser to build symbol table
void parse() {
    parse_index = 0;
    symbol_table_init();
    
    while (parse_index < token_count) {
        Token t = peek_token(0);
        
        // Check for variable/constant declarations
        int is_const = 0;
        if (match_keyword("const")) {
            is_const = 1;
        }
        
        // Check for data type
        int is_datatype = 0;
        char data_type[64] = {0};
        for (int i = 0; keywords[i] != NULL; i++) {
            if (strcmp(keywords[i], "int") == 0 || 
                strcmp(keywords[i], "float") == 0 || 
                strcmp(keywords[i], "double") == 0 || 
                strcmp(keywords[i], "char") == 0 || 
                strcmp(keywords[i], "bool") == 0 || 
                strcmp(keywords[i], "string") == 0 || 
                strcmp(keywords[i], "void") == 0 ||
                strcmp(keywords[i], "long") == 0 || 
                strcmp(keywords[i], "short") == 0) {
                if (t.type == TOKEN_KEYWORD && strcmp(t.lexeme, keywords[i]) == 0) {
                    is_datatype = 1;
                    strncpy(data_type, keywords[i], 63);
                    next_token();
                    break;
                }
            }
        }
        
        if (is_datatype) {
            t = peek_token(0);
            if (t.type == TOKEN_IDENTIFIER) {
                char name[128] = {0};
                strncpy(name, t.lexeme, 127);
                next_token();
                
                if (!symbol_table_add(name, data_type, is_const, t.line)) {
                    add_error(ERROR_SEMANTIC, "Duplicate variable declaration", t.line, t.column,
                             "Rename this variable");
                }
                
                // Check for initialization
                if (peek_token(0).type == TOKEN_OPERATOR && 
                    strcmp(peek_token(0).lexeme, "=") == 0) {
                    next_token(); // consume =
                    // Skip expression
                    int paren_depth = 0;
                    while (parse_index < token_count) {
                        Token et = peek_token(0);
                        if (et.type == TOKEN_DELIMITER && strcmp(et.lexeme, ";") == 0 && paren_depth == 0) {
                            break;
                        }
                        if (et.type == TOKEN_DELIMITER && strcmp(et.lexeme, "(") == 0) paren_depth++;
                        if (et.type == TOKEN_DELIMITER && strcmp(et.lexeme, ")") == 0) paren_depth--;
                        next_token();
                    }
                    
                    // Mark as initialized
                    SymbolTableEntry* entry;
                    if (symbol_table_find(name, &entry)) {
                        entry->is_initialized = 1;
                    }
                }
                
                // Skip commas for multiple declarations
                while (peek_token(0).type == TOKEN_DELIMITER && 
                       strcmp(peek_token(0).lexeme, ",") == 0) {
                    next_token(); // consume ,
                    t = peek_token(0);
                    if (t.type == TOKEN_IDENTIFIER) {
                        char name2[128] = {0};
                        strncpy(name2, t.lexeme, 127);
                        next_token();
                        
                        if (!symbol_table_add(name2, data_type, is_const, t.line)) {
                            add_error(ERROR_SEMANTIC, "Duplicate variable declaration", t.line, t.column,
                                     "Rename this variable");
                        }
                        
                        // Check for initialization
                        if (peek_token(0).type == TOKEN_OPERATOR && 
                            strcmp(peek_token(0).lexeme, "=") == 0) {
                            next_token(); // consume =
                            // Skip expression
                            int paren_depth = 0;
                            while (parse_index < token_count) {
                                Token et = peek_token(0);
                                if (et.type == TOKEN_DELIMITER && strcmp(et.lexeme, ";") == 0 && paren_depth == 0) {
                                    break;
                                }
                                if (et.type == TOKEN_DELIMITER && strcmp(et.lexeme, "(") == 0) paren_depth++;
                                if (et.type == TOKEN_DELIMITER && strcmp(et.lexeme, ")") == 0) paren_depth--;
                                next_token();
                            }
                            
                            // Mark as initialized
                            SymbolTableEntry* entry;
                            if (symbol_table_find(name2, &entry)) {
                                entry->is_initialized = 1;
                            }
                        }
                    }
                }
                
                // Expect semicolon
                if (peek_token(0).type == TOKEN_DELIMITER && 
                    strcmp(peek_token(0).lexeme, ";") == 0) {
                    next_token();
                }
            }
        } else if (is_const) {
            // Was const but no datatype - error
            add_error(ERROR_SYNTAX, "Expected data type after 'const'", t.line, t.column,
                     "Add a data type like int or float");
        } else {
            next_token();
        }
    }
}

int main(int argc, char* argv[]) {
    const char* filename = "input/sample_program.txt";
    
    if (argc > 1) {
        filename = argv[1];
    }
    
    printf("=============================================\n");
    printf("      SIMPLE COMPILER FRONT-END (C VERSION)  \n");
    printf("=============================================\n\n");
    printf("Loading file: %s\n", filename);
    
    source = read_file(filename);
    if (!source) {
        return 1;
    }
    
    printf("Performing Lexical Analysis...\n");
    tokenize();
    print_tokens();
    
    printf("Performing Syntax Analysis & Building Symbol Table...\n");
    parse();
    
    print_symbol_table();
    print_errors();
    
    generate_html_dashboard(filename);
    
    free((void*)source);
    return 0;
}


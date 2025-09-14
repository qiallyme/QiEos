import os
from datetime import datetime

def should_ignore_directory(dir_name):
    """Check if directory should be ignored."""
    ignore_dirs = ['node_modules', 'dist', 'build', '.git', '$recycle.bin', 'tree-maker', '__pycache__']
    return dir_name.lower() in [d.lower() for d in ignore_dirs]

def is_text_file(file_name):
    """Check if file is a text file we want to extract."""
    # File extensions to explicitly exclude (binary/image files)
    binary_extensions = {
        '.ico', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp',
        '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv',
        '.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma',
        '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
        '.exe', '.dll', '.so', '.dylib', '.bin',
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
        '.db', '.sqlite', '.sqlite3', '.mdb', '.accdb',
        '.log', '.tmp', '.temp', '.cache', '.lock',
        '.pyc', '.pyo', '.pyd', '.whl', '.egg'
    }
    
    # Files to explicitly ignore
    ignore_files = {
        'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
        'composer.lock', 'Gemfile.lock', 'Pipfile.lock'
    }
    
    if file_name in ignore_files:
        return False
    
    # Check if it's a binary file
    ext = os.path.splitext(file_name)[1].lower()
    if ext in binary_extensions:
        return False
    
    # File extensions to include (text files only)
    text_extensions = {
        '.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.sass',
        '.json', '.xml', '.yaml', '.yml', '.md', '.txt', '.sh', '.bat', '.ps1',
        '.vue', '.php', '.java', '.cpp', '.c', '.h', '.hpp', '.cs', '.rb',
        '.go', '.rs', '.swift', '.kt', '.scala', '.r', '.sql', '.pl', '.lua',
        '.toml', '.ini', '.cfg', '.conf', '.env', '.gitignore'
    }
    
    # Check extension
    if ext in text_extensions:
        return True
    
    # Check for config files without extensions
    config_files = {
        'dockerfile', 'makefile', 'gemfile', 'procfile',
        'webpack.config.js', 'vite.config.js', 'rollup.config.js',
        'tsconfig.json', 'jsconfig.json', 'package.json'
    }
    return file_name.lower() in config_files

def print_directory_tree(root_dir, output_file, current_depth=0, prefix=''):
    """Print directory tree structure."""
    try:
        items = os.listdir(root_dir)
    except (PermissionError, FileNotFoundError):
        message = prefix + "└── [Access Denied]"
        print(message)
        output_file.write(message + "\n")
        return

    # Filter and sort items
    directories = []
    files = []
    
    for item in items:
        if item.startswith('.'):
            continue
        path = os.path.join(root_dir, item)
        if os.path.isdir(path):
            if not should_ignore_directory(item):
                directories.append(item)
        else:
            if is_text_file(item):
                files.append(item)
    
    # Sort alphabetically
    directories.sort(key=lambda s: s.lower())
    files.sort(key=lambda s: s.lower())
    items = directories + files

    for index, item in enumerate(items):
        path = os.path.join(root_dir, item)
        
        # Tree connector
        if index == len(items) - 1:
            connector = '└── '
            extension = '    '
        else:
            connector = '├── '
            extension = '│   '

        message = prefix + connector + item
        print(message)
        output_file.write(message + "\n")

        # Recurse into directories
        if os.path.isdir(path):
            print_directory_tree(path, output_file, current_depth + 1, prefix + extension)

def is_binary_file(file_path):
    """Check if a file is binary by reading the first 1024 bytes."""
    try:
        with open(file_path, 'rb') as f:
            chunk = f.read(1024)
            if b'\0' in chunk:  # Null bytes indicate binary
                return True
            # Check for high ratio of non-printable characters
            try:
                chunk.decode('utf-8')
            except UnicodeDecodeError:
                return True
            return False
    except:
        return True  # If we can't read it, assume it's binary

def extract_file_content(file_path, output_file):
    """Extract and write file content."""
    try:
        # Double-check if file is binary before reading
        if is_binary_file(file_path):
            skip_msg = f"\n{'='*80}\nSKIPPED BINARY FILE: {file_path}\n{'='*80}\n\n"
            print(skip_msg)
            output_file.write(skip_msg)
            return
        
        # File header
        header = f"\n{'='*80}\nFILE: {file_path}\n{'='*80}\n\n"
        print(header)
        output_file.write(header)
        
        # Read and write content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            print(content)
            output_file.write(content)
            
        # File footer
        footer = f"\n\n{'='*80}\nEND: {file_path}\n{'='*80}\n\n"
        print(footer)
        output_file.write(footer)
        
    except Exception as e:
        error_msg = f"\nERROR: {file_path} - {str(e)}\n"
        print(error_msg)
        output_file.write(error_msg)

def walk_and_extract(root_dir, output_file):
    """Walk directories and extract text files in order."""
    print(f"\n{'='*80}")
    print("EXTRACTING FILE CONTENTS")
    print(f"{'='*80}\n")
    output_file.write(f"\n{'='*80}\nEXTRACTING FILE CONTENTS\n{'='*80}\n\n")
    
    file_count = 0
    
    for root, dirs, files in os.walk(root_dir):
        # Filter directories
        dirs[:] = [d for d in dirs if not should_ignore_directory(d) and not d.startswith('.')]
        
        # Filter and sort files
        text_files = [f for f in files if is_text_file(f)]
        text_files.sort(key=lambda s: s.lower())
        
        for file_name in text_files:
            file_path = os.path.join(root, file_name)
            extract_file_content(file_path, output_file)
            file_count += 1
    
    return file_count

def main():
    """Main function to run the code extraction."""
    root_dir = os.getcwd()
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    output_filename = f"code_extraction_{timestamp}.txt"
    output_path = os.path.join(root_dir, output_filename)
    
    print(f"Extracting from: {root_dir}")
    print(f"Output: {output_path}")
    print(f"Ignoring: node_modules, dist, build, .git, $RECYCLE.BIN, tree-maker, __pycache__")
    print(f"{'='*80}\n")
    
    with open(output_path, 'w', encoding='utf-8') as output_file:
        # Header
        header = f"CODE EXTRACTION - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        header += f"Root: {root_dir}\n"
        header += f"{'='*80}\n\n"
        print(header)
        output_file.write(header)
        
        # Directory tree
        print("DIRECTORY TREE:")
        print("-" * 40)
        output_file.write("DIRECTORY TREE:\n" + "-" * 40 + "\n")
        print_directory_tree(root_dir, output_file)
        
        # Extract files
        file_count = walk_and_extract(root_dir, output_file)
        
        # Footer
        footer = f"\n{'='*80}\nCOMPLETE - {file_count} files extracted\n{'='*80}\n"
        print(footer)
        output_file.write(footer)
    
    print(f"\nDone! Output: {output_path}")

if __name__ == "__main__":
    main()

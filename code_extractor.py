import os
from datetime import datetime

def should_ignore_directory(dir_name):
    """Check if directory should be ignored."""
    ignore_dirs = ['dist', 'node_modules']
    return dir_name.lower() in [d.lower() for d in ignore_dirs]

def get_file_extension(file_name):
    """Get file extension for determining if it's a code file."""
    return os.path.splitext(file_name)[1].lower()

def is_code_file(file_name):
    """Check if file is likely a code file based on extension."""
    # Files to explicitly ignore
    ignore_files = ['package-lock.json']
    if file_name in ignore_files:
        return False
    
    code_extensions = {
        '.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.sass',
        '.json', '.xml', '.yaml', '.yml', '.md', '.txt', '.sh', '.bat', '.ps1',
        '.vue', '.php', '.java', '.cpp', '.c', '.h', '.hpp', '.cs', '.rb',
        '.go', '.rs', '.swift', '.kt', '.scala', '.r', '.sql', '.pl', '.lua',
        '.config.js'  # Include config.js files
    }
    
    # Check for exact extension match
    if get_file_extension(file_name) in code_extensions:
        return True
    
    # Special check for .config.js files
    if file_name.endswith('.config.js'):
        return True
    
    return False

def print_directory_tree(root_dir, output_file, current_depth=0, prefix=''):
    """Recursively prints the directory tree structure and writes to output file."""
    
    try:
        # Get the list of items in the directory
        items = os.listdir(root_dir)
    except PermissionError:
        message = prefix + "└── [Permission Denied]"
        print(message)
        output_file.write(message + "\n")
        return
    except FileNotFoundError:
        message = prefix + "└── [Directory Not Found]"
        print(message)
        output_file.write(message + "\n")
        return

    # Sort items: directories first, then files
    items = sorted(items, key=lambda s: s.lower())
    directories = [item for item in items if os.path.isdir(os.path.join(root_dir, item))]
    files = [item for item in items if not os.path.isdir(os.path.join(root_dir, item))]

    # Filter out ignored directories and hidden files/directories
    directories = [item for item in directories if not should_ignore_directory(item) and not item.startswith('.')]
    files = [item for item in files if not item.startswith('.')]

    # Combine directories and files
    items = directories + files

    for index, item in enumerate(items):
        path = os.path.join(root_dir, item)
        
        # Determine tree connector style
        if index == len(items) - 1:
            connector = '└── '
            extension = '    '
        else:
            connector = '├── '
            extension = '│   '

        # Print and write to file
        message = prefix + connector + item
        print(message)
        output_file.write(message + "\n")

        # Recurse into directories (excluding ignored ones)
        if os.path.isdir(path):
            print_directory_tree(path, output_file, current_depth + 1, prefix + extension)

def extract_file_content(file_path, output_file):
    """Extract and write file content with header."""
    try:
        # Create header
        header = f"\n{'='*80}\n"
        header += f"FILE: {file_path}\n"
        header += f"TYPE: {get_file_extension(file_path)}\n"
        header += f"{'='*80}\n\n"
        
        print(header)
        output_file.write(header)
        
        # Read and write file content
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            print(content)
            output_file.write(content)
            
        # Add footer
        footer = f"\n\n{'='*80}\nEND OF FILE: {file_path}\n{'='*80}\n\n"
        print(footer)
        output_file.write(footer)
        
    except Exception as e:
        error_msg = f"\nERROR READING FILE {file_path}: {str(e)}\n"
        print(error_msg)
        output_file.write(error_msg)

def scan_and_extract_files(root_dir, output_file):
    """Scan directory tree and extract content from all code files."""
    print(f"\n{'='*80}")
    print("STARTING FILE CONTENT EXTRACTION")
    print(f"{'='*80}\n")
    output_file.write(f"\n{'='*80}\n")
    output_file.write("STARTING FILE CONTENT EXTRACTION\n")
    output_file.write(f"{'='*80}\n\n")
    
    file_count = 0
    
    for root, dirs, files in os.walk(root_dir):
        # Filter out ignored directories from traversal
        dirs[:] = [d for d in dirs if not should_ignore_directory(d) and not d.startswith('.')]
        
        # Filter out hidden files and sort for consistent order
        files = [f for f in files if not f.startswith('.')]
        files = sorted(files, key=lambda s: s.lower())
        
        for file_name in files:
            file_path = os.path.join(root, file_name)
            
            # Only process code files
            if is_code_file(file_name):
                extract_file_content(file_path, output_file)
                file_count += 1
    
    return file_count

def main():
    """Main function to run the code extraction."""
    # Get the project root (current working directory)
    root_dir = os.getcwd()
    
    # Create output file in root directory
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    output_filename = f"code_extraction_{timestamp}.txt"
    output_path = os.path.join(root_dir, output_filename)
    
    print(f"Starting code extraction from: {root_dir}")
    print(f"Output will be saved to: {output_path}")
    print(f"Ignoring directories: dist, node_modules")
    print(f"Ignoring files: package-lock.json")
    print(f"{'='*80}\n")
    
    with open(output_path, 'w', encoding='utf-8') as output_file:
        # Write header information
        header_info = f"CODE EXTRACTION REPORT\n"
        header_info += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        header_info += f"Root Directory: {root_dir}\n"
        header_info += f"Ignored Directories: dist, node_modules\n"
        header_info += f"Ignored Files: package-lock.json\n"
        header_info += f"{'='*80}\n\n"
        
        print(header_info)
        output_file.write(header_info)
        
        # Print directory tree
        print("DIRECTORY TREE STRUCTURE:")
        print("-" * 40)
        output_file.write("DIRECTORY TREE STRUCTURE:\n")
        output_file.write("-" * 40 + "\n")
        
        print_directory_tree(root_dir, output_file)
        
        # Extract file contents
        file_count = scan_and_extract_files(root_dir, output_file)
        
        # Write footer
        footer = f"\n{'='*80}\n"
        footer += f"EXTRACTION COMPLETE\n"
        footer += f"Total files processed: {file_count}\n"
        footer += f"Output saved to: {output_path}\n"
        footer += f"{'='*80}\n"
        
        print(footer)
        output_file.write(footer)
    
    print(f"\nCode extraction completed successfully!")
    print(f"Output saved to: {output_path}")

if __name__ == "__main__":
    main()

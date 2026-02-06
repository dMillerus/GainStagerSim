#!/usr/bin/env python3
"""
build.py - Bundle modular files back into single HTML for distribution

Usage:
    python3 scripts/build.py [--output dist/simulator.html]

This script:
1. Reads index.html
2. Inlines all CSS from <link rel="stylesheet"> tags
3. Inlines all JS from <script type="module"> with import resolution
4. Outputs a single self-contained HTML file
"""

import argparse
import os
import re
import sys
from pathlib import Path


def resolve_imports(js_content: str, base_dir: Path, processed: set) -> str:
    """
    Recursively resolve and inline ES6 imports.
    Returns JavaScript with imports replaced by inlined code.
    """
    result_lines = []

    for line in js_content.split('\n'):
        # Match import statements
        import_match = re.match(
            r"import\s+(?:(\{[^}]+\})|(\w+))\s+from\s+['\"]([^'\"]+)['\"];?",
            line.strip()
        )

        if import_match:
            import_path = import_match.group(3)

            # Resolve relative path
            if import_path.startswith('./') or import_path.startswith('../'):
                full_path = (base_dir / import_path).resolve()
            else:
                # Assume relative to base
                full_path = (base_dir / import_path).resolve()

            # Skip if already processed (prevent circular imports)
            if str(full_path) in processed:
                continue

            processed.add(str(full_path))

            if full_path.exists():
                with open(full_path, 'r', encoding='utf-8') as f:
                    imported_content = f.read()

                # Recursively process imports in the imported file
                imported_dir = full_path.parent
                imported_content = resolve_imports(imported_content, imported_dir, processed)

                # Remove export statements and convert to regular code
                imported_content = process_exports(imported_content)

                result_lines.append(f'// === Inlined from {import_path} ===')
                result_lines.append(imported_content)
                result_lines.append(f'// === End {import_path} ===\n')
            else:
                print(f"Warning: Could not find import: {full_path}", file=sys.stderr)
        else:
            result_lines.append(line)

    return '\n'.join(result_lines)


def process_exports(js_content: str) -> str:
    """
    Process export statements to make code work inline.
    - Remove 'export ' prefix from declarations
    - Remove 'export default' statements
    """
    lines = js_content.split('\n')
    result = []

    for line in lines:
        # Skip export default statements at end of file
        if line.strip().startswith('export default'):
            continue

        # Remove export prefix from declarations
        if line.strip().startswith('export '):
            line = line.replace('export ', '', 1)

        result.append(line)

    return '\n'.join(result)


def inline_css(html_content: str, base_dir: Path) -> str:
    """
    Find all <link rel="stylesheet"> tags and inline the CSS.
    """
    # Pattern to match stylesheet links
    pattern = r'<link\s+rel="stylesheet"\s+href="([^"]+)"[^>]*>'

    def replace_link(match):
        href = match.group(1)
        css_path = (base_dir / href).resolve()

        if css_path.exists():
            with open(css_path, 'r', encoding='utf-8') as f:
                css_content = f.read()

            # Process CSS variables and imports
            css_content = process_css_imports(css_content, css_path.parent)

            return f'<style>\n{css_content}\n</style>'
        else:
            print(f"Warning: Could not find CSS file: {css_path}", file=sys.stderr)
            return match.group(0)

    return re.sub(pattern, replace_link, html_content)


def process_css_imports(css_content: str, base_dir: Path) -> str:
    """
    Process @import statements in CSS files.
    """
    pattern = r"@import\s+['\"]([^'\"]+)['\"];"

    def replace_import(match):
        import_path = match.group(1)
        css_path = (base_dir / import_path).resolve()

        if css_path.exists():
            with open(css_path, 'r', encoding='utf-8') as f:
                imported_css = f.read()
            return process_css_imports(imported_css, css_path.parent)
        else:
            print(f"Warning: Could not find CSS import: {css_path}", file=sys.stderr)
            return match.group(0)

    return re.sub(pattern, replace_import, css_content)


def inline_js(html_content: str, base_dir: Path) -> str:
    """
    Find <script type="module"> tags and inline the JavaScript with resolved imports.
    """
    # Pattern to match module script tags
    pattern = r'<script\s+type="module"\s+src="([^"]+)"[^>]*></script>'

    def replace_script(match):
        src = match.group(1)
        js_path = (base_dir / src).resolve()

        if js_path.exists():
            with open(js_path, 'r', encoding='utf-8') as f:
                js_content = f.read()

            # Resolve all imports
            processed = {str(js_path)}
            js_content = resolve_imports(js_content, js_path.parent, processed)

            # Process exports in the main file
            js_content = process_exports(js_content)

            return f'<script>\n{js_content}\n</script>'
        else:
            print(f"Warning: Could not find JS file: {js_path}", file=sys.stderr)
            return match.group(0)

    return re.sub(pattern, replace_script, html_content)


def build(input_file: str, output_file: str) -> bool:
    """
    Main build function.
    """
    input_path = Path(input_file).resolve()
    output_path = Path(output_file).resolve()

    if not input_path.exists():
        print(f"Error: Input file not found: {input_path}", file=sys.stderr)
        return False

    print(f"Building from: {input_path}")

    with open(input_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    base_dir = input_path.parent

    # Inline CSS
    print("  Inlining CSS...")
    html_content = inline_css(html_content, base_dir)

    # Inline JS
    print("  Inlining JavaScript...")
    html_content = inline_js(html_content, base_dir)

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"Built: {output_path}")
    print(f"  Size: {output_path.stat().st_size:,} bytes")

    return True


def main():
    parser = argparse.ArgumentParser(
        description='Bundle modular files into single HTML'
    )
    parser.add_argument(
        '--input', '-i',
        default='index.html',
        help='Input HTML file (default: index.html)'
    )
    parser.add_argument(
        '--output', '-o',
        default='dist/simulator.html',
        help='Output HTML file (default: dist/simulator.html)'
    )

    args = parser.parse_args()

    # Resolve paths relative to script location
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent

    input_file = project_dir / args.input
    output_file = project_dir / args.output

    success = build(str(input_file), str(output_file))
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
